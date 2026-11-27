/**
 * Utility to process and format article content into semantic, browser-rendered HTML.
 * Handles:
 *  - Native HTML strings (e.g. <p>, <h2>, <strong>, <ul>, <blockquote>, <a>, <img>)
 *  - Markdown syntax (#, ##, ###, **, *, lists, blockquotes, links, code)
 *  - Plain text paragraphs separated by newlines
 */

/**
 * Checks whether a given string contains HTML markup tags.
 */
export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return /<\/?(p|h[1-6]|div|span|ul|ol|li|blockquote|table|tr|td|th|strong|em|b|i|a|img|pre|code|br|hr)[^>]*>/i.test(content);
}

/**
 * Formats any raw article content into rich, valid HTML ready for dangerouslySetInnerHTML.
 */
export function formatArticleHtml(content: string): string {
  if (!content || !content.trim()) return '';

  const raw = content.trim();

  // If the content already has standard HTML structure, preserve and format it
  if (isHtmlContent(raw)) {
    // Check if it already uses block-level elements
    const hasBlockElements = /<\/?(p|h[1-6]|div|ul|ol|li|blockquote|table|pre|figure)[^>]*>/i.test(raw);
    
    if (hasBlockElements) {
      return raw;
    }

    // If it only has inline tags (e.g. <strong> or <em> without wrapping <p>), split paragraphs by newlines
    return raw
      .split(/\n{2,}/)
      .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
      .join('\n');
  }

  // Otherwise, parse Markdown / Plain text to HTML
  return markdownToHtml(raw);
}

/**
 * Lightweight, robust Markdown to HTML converter.
 */
export function markdownToHtml(markdown: string): string {
  // Normalize Windows/Unix newlines
  let text = markdown.replace(/\r\n/g, '\n');

  // Headings (# Heading to ###### Heading)
  text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes (> Quote)
  text = text.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

  // Bold & Italic
  text = text.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  text = text.replace(/___(.*?)___/gim, '<strong><em>$1</em></strong>');
  text = text.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  text = text.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Inline Code
  text = text.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process lists and paragraphs
  const lines = text.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      result.push(`<p>${paragraphBuffer.join('<br />')}</p>`);
      paragraphBuffer = [];
    }
  };

  const closeLists = () => {
    if (inUl) {
      result.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      result.push('</ol>');
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      closeLists();
      continue;
    }

    // Headers & Blockquotes
    if (/^<h[1-6]>/.test(line) || /^<blockquote>/.test(line)) {
      flushParagraph();
      closeLists();
      result.push(line);
      continue;
    }

    // Unordered list item: - item or * item
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (inOl) {
        result.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        result.push('<ul>');
        inUl = true;
      }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list item: 1. item
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (inUl) {
        result.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        result.push('<ol>');
        inOl = true;
      }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    // Regular line inside a paragraph
    closeLists();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeLists();

  return result.join('\n');
}
