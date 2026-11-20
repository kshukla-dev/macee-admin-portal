import fs from 'fs';
import path from 'path';
import { readDataFile } from './storage';

// Default path to the Macee main website project
const DEFAULT_WEBSITE_DIR = fs.existsSync('d:/J&F/Maceee/macee-_update_contant')
  ? path.resolve('d:/J&F/Maceee/macee-_update_contant')
  : path.resolve(process.cwd(), '../macee-_update_contant');

export interface SyncResult {
  success: boolean;
  timestamp: string;
  targetDir: string;
  filesSynced: string[];
  errors: string[];
}

export function getWebsiteDir(): string {
  const adminConfig = readDataFile<{ websitePath?: string }>('admin.json', {});
  if (adminConfig.websitePath && fs.existsSync(adminConfig.websitePath)) {
    return adminConfig.websitePath;
  }
  return DEFAULT_WEBSITE_DIR;
}

/**
 * 1. Sync Team Members to aboutData.json and aboutData_nl.json
 */
export function syncTeamToWebsite(teamMembers: any[]): boolean {
  try {
    const websiteDir = getWebsiteDir();
    const dataDir = path.join(websiteDir, 'src', 'data');
    if (!fs.existsSync(dataDir)) return false;

    // Filter active members and map to website format
    const formattedMembers = teamMembers
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.order || 99) - (b.order || 99))
      .map((m) => {
        const item: any = {
          name: m.name,
          role: m.role,
          image: m.image || '/images/team-room.jpg',
        };
        if (m.email) item.email = m.email;
        if (m.phone) item.phone = m.phone;
        if (m.linkedin) item.linkedin = m.linkedin;
        if (m.desk) item.desk = m.desk;
        return item;
      });

    // Update EN aboutData.json
    const enPath = path.join(dataDir, 'aboutData.json');
    if (fs.existsSync(enPath)) {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      if (!enData.team) enData.team = {};
      enData.team.members = formattedMembers;
      fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf-8');
    }

    // Update NL aboutData_nl.json
    const nlPath = path.join(dataDir, 'aboutData_nl.json');
    if (fs.existsSync(nlPath)) {
      const nlData = JSON.parse(fs.readFileSync(nlPath, 'utf-8'));
      if (!nlData.team) nlData.team = {};
      nlData.team.members = formattedMembers;
      fs.writeFileSync(nlPath, JSON.stringify(nlData, null, 2), 'utf-8');
    }

    return true;
  } catch (err) {
    console.error('Failed to sync team to website:', err);
    return false;
  }
}

function escapeTs(str: string): string {
  if (str === undefined || str === null) return "''";
  return JSON.stringify(str);
}

/**
 * 2. Sync FAQs to pageFaqs.ts, allFaqs.ts, faqData.json and faqData_nl.json
 */
export function syncFaqsToWebsite(faqData: { categories?: any[]; items?: any[]; pages?: any[] }): boolean {
  try {
    const websiteDir = getWebsiteDir();
    const dataDir = path.join(websiteDir, 'src', 'data');
    if (!fs.existsSync(dataDir)) return false;

    const items = (faqData.items || []).filter((f) => f.active !== false);

    // 2a. Sync pageFaqs.ts (Used by Home, About, Clients, Professionals, Projects, Contact pages)
    const getPageItems = (pageKey: string) =>
      items
        .filter((i) => (i.page === pageKey || i.categoryKey === pageKey))
        .sort((a, b) => (a.order || 99) - (b.order || 99));

    const formatPageList = (pageItems: any[]) =>
      pageItems
        .map((item) => {
          return `  {\n    question: ${escapeTs(item.question)},\n    answer:\n      ${escapeTs(item.answer)},\n    tag: ${escapeTs(item.tag || 'General')},\n  }`;
        })
        .join(',\n');

    const pageFaqsContent = `import { FaqItem } from '../components/PageFaqSection';

// ============================================================================
// 1. HOME PAGE FAQS (General Workforce Solutions, Hiring Desk & Compliance)
// ============================================================================
export const HOME_FAQS: FaqItem[] = [
${formatPageList(getPageItems('home'))}
];

// ============================================================================
// 2. ABOUT PAGE FAQS (Macee Story, Values, Team & Certifications)
// ============================================================================
export const ABOUT_FAQS: FaqItem[] = [
${formatPageList(getPageItems('about'))}
];

// ============================================================================
// 3. CLIENTS PAGE FAQS (Hiring Managers, SLA, Guarantee & Costs)
// ============================================================================
export const CLIENTS_FAQS: FaqItem[] = [
${formatPageList(getPageItems('clients'))}
];

// ============================================================================
// 4. PROFESSIONALS PAGE FAQS (Expats, Visas, 30% Ruling & Contracting)
// ============================================================================
export const PROFESSIONALS_FAQS: FaqItem[] = [
${formatPageList(getPageItems('professionals'))}
];

// ============================================================================
// 5. PROJECTS PAGE FAQS (Job Seekers, Applications, CV & Remote Policy)
// ============================================================================
export const PROJECTS_FAQS: FaqItem[] = [
${formatPageList(getPageItems('projects'))}
];

// ============================================================================
// 6. CONTACT PAGE FAQS (Response Times, Appointments & Urgencies)
// ============================================================================
export const CONTACT_FAQS: FaqItem[] = [
${formatPageList(getPageItems('contact'))}
];
`;

    const pageFaqsPath = path.join(dataDir, 'pageFaqs.ts');
    fs.writeFileSync(pageFaqsPath, pageFaqsContent, 'utf-8');

    // 2b. Sync allFaqs.ts (Used by the Knowledge Base / All FAQs page)
    const sortedAllItems = [...items].sort((a, b) => (a.order || 99) - (b.order || 99));

    const formatAllFaqItem = (f: any, isNl = false) => {
      const catKey = f.page || f.categoryKey || 'home';
      const pageSource = (f.pageName || f.pageSource || catKey).replace(' Page', '');
      const q = isNl ? (f.question_nl || f.question) : f.question;
      const a = isNl ? (f.answer_nl || f.answer) : f.answer;
      const catTitle = f.categoryName || f.categoryTitle || 'General';
      return `  {
    id: ${escapeTs(f.id)},
    categoryKey: ${escapeTs(catKey)},
    categoryTitle: ${escapeTs(catTitle)},
    pageSource: ${escapeTs(pageSource)},
    question: ${escapeTs(q)},
    answer:
      ${escapeTs(a)},
    tag: ${escapeTs(f.tag || 'General')},
  }`;
    };

    const allFaqsEnItems = sortedAllItems.map((f) => formatAllFaqItem(f, false)).join(',\n');
    const allFaqsNlItems = sortedAllItems.map((f) => formatAllFaqItem(f, true)).join(',\n');

    const allFaqsContent = `export interface AllFaqItem {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  pageSource: string;
  question: string;
  answer: string;
  tag: string;
}

export interface FaqCategoryDef {
  key: string;
  title: string;
  description: string;
  page: string;
  icon?: string;
  image?: string;
}

export const FAQ_CATEGORIES_EN: FaqCategoryDef[] = [
  {
    key: 'all',
    title: 'All Questions',
    description: 'Browse the complete directory of frequently asked questions across all Macee services.',
    page: 'all',
  },
  {
    key: 'home',
    title: 'Workforce Desk & General',
    description: 'Learn about Macee’s external workforce desk, contract models, and turnkey management.',
    page: 'home',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'about',
    title: 'About Macee & Certifications',
    description: '30+ years of recruitment expertise, Arnhem headquarters, SNA NEN 4400-1 accreditation, and team.',
    page: 'about',
    image: '/uploads/people-working-dsk.jpg',
  },
  {
    key: 'clients',
    title: 'Clients & Hiring Managers',
    description: 'Turnaround SLAs, candidate vetting, quality guarantees, MSP solutions, and fee structures.',
    page: 'clients',
    image: '/uploads/Software-Development-2.jpg',
  },
  {
    key: 'professionals',
    title: 'Professionals & Contractors',
    description: 'Secondment, ZZP brokerage, IND visa sponsorships, 30% tax ruling, and prompt payment cycles.',
    page: 'professionals',
    image: '/uploads/Finance-reporting.jpg',
  },
  {
    key: 'projects',
    title: 'Projects & Vacancies',
    description: 'Applying for assignments, CV formats, recruiter review workflows, and hybrid remote policies.',
    page: 'projects',
    image: '/uploads/PM-2.jpg',
  },
  {
    key: 'compliance',
    title: 'Compliance, Wet DBA & WAADI',
    description: 'Eliminating false self-employment risks, G-account tax protection, and Dutch labor regulations.',
    page: 'compliance',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'contact',
    title: 'Contact & Urgencies',
    description: 'Response times, Arnhem office visits, emergency staffing requests, and confidential consultations.',
    page: 'contact',
    image: '/uploads/people-working-dsk.jpg',
  },
];

export const FAQ_CATEGORIES_NL: FaqCategoryDef[] = [
  {
    key: 'all',
    title: 'Alle Vragen',
    description: 'Bekijk het volledige overzicht van alle veelgestelde vragen over Macee.',
    page: 'all',
  },
  {
    key: 'home',
    title: 'Inhuurdesk & Algemeen',
    description: 'Ontdek hoe Macee’s externe inhuurdesk werkt, contractvormen en flexibele personeelsoplossingen.',
    page: 'home',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'about',
    title: 'Over Macee & Certificeringen',
    description: '30+ jaar recruitmentexpertise, hoofdkantoor Arnhem, SNA NEN 4400-1 accreditatie en ons team.',
    page: 'about',
    image: '/uploads/people-working-dsk.jpg',
  },
  {
    key: 'clients',
    title: 'Voor Opdrachtgevers',
    description: 'Shortlist SLA’s, screening van kandidaten, no-risk vervangingsgarantie en MSP-dienstverlening.',
    page: 'clients',
    image: '/uploads/Software-Development-2.jpg',
  },
  {
    key: 'professionals',
    title: 'Voor Professionals & ZZP’ers',
    description: 'Detachering, ZZP-bemiddeling, IND-kennismigrantenvisa, 30%-regeling en stipte uitbetaling.',
    page: 'professionals',
    image: '/uploads/Finance-reporting.jpg',
  },
  {
    key: 'projects',
    title: 'Vacatures & Solliciteren',
    description: 'Sollicitatieprocedure, gewenste CV-formaten, reactietijden en hybride werkvormen.',
    page: 'projects',
    image: '/uploads/PM-2.jpg',
  },
  {
    key: 'compliance',
    title: 'Compliance, Wet DBA & WAADI',
    description: 'Voorkomen van schijnzelfstandigheid, G-rekening fiscale zekerheid en ketenaansprakelijkheid.',
    page: 'compliance',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'contact',
    title: 'Contact & Spoedaanvragen',
    description: 'Reactietijden, bezoek aan kantoor Arnhem, spoedinterim en vertrouwelijke adviesgesprekken.',
    page: 'contact',
    image: '/uploads/people-working-dsk.jpg',
  },
];

export const ALL_FAQS_EN: AllFaqItem[] = [
${allFaqsEnItems}
];

export const ALL_FAQS_NL: AllFaqItem[] = [
${allFaqsNlItems}
];

export function getFullFaqList(lang: 'EN' | 'NL' = 'EN') {
  return lang === 'NL' ? ALL_FAQS_NL : ALL_FAQS_EN;
}

export function getFaqCategories(lang: 'EN' | 'NL' = 'EN') {
  return lang === 'NL' ? FAQ_CATEGORIES_NL : FAQ_CATEGORIES_EN;
}
`;

    const allFaqsPath = path.join(dataDir, 'allFaqs.ts');
    fs.writeFileSync(allFaqsPath, allFaqsContent, 'utf-8');

    // 2c. Sync faqData.json and faqData_nl.json
    const formattedFaqs = sortedAllItems.map((f) => ({
      id: f.id,
      categoryId: f.categoryId || 1,
      categoryName: f.categoryName || 'General',
      question: f.question,
      answer: f.answer,
      tag: f.tag,
      date: f.date || 'Updated via Macee Admin'
    }));

    const formattedNlFaqs = sortedAllItems.map((f) => ({
      id: f.id,
      categoryId: f.categoryId || 1,
      categoryName: f.categoryName || 'General',
      question: f.question_nl || f.question,
      answer: f.answer_nl || f.answer,
      tag: f.tag,
      date: f.date || 'Bijgewerkt via Macee Admin'
    }));

    const enPath = path.join(dataDir, 'faqData.json');
    if (fs.existsSync(enPath)) {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      if (faqData.categories && faqData.categories.length > 0) {
        enData.categories = faqData.categories;
      }
      enData.faqs = formattedFaqs;
      fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf-8');
    }

    const nlPath = path.join(dataDir, 'faqData_nl.json');
    if (fs.existsSync(nlPath)) {
      const nlData = JSON.parse(fs.readFileSync(nlPath, 'utf-8'));
      if (faqData.categories && faqData.categories.length > 0) {
        nlData.categories = faqData.categories;
      }
      nlData.faqs = formattedNlFaqs;
      fs.writeFileSync(nlPath, JSON.stringify(nlData, null, 2), 'utf-8');
    }

    return true;
  } catch (err) {
    console.error('Failed to sync FAQs to website:', err);
    return false;
  }
}

/**
 * 3. Sync Clients data (Certifications, Industries, Expertise) to clientsData.json
 */
export function syncClientsToWebsite(clientsData: any): boolean {
  try {
    const websiteDir = getWebsiteDir();
    const dataDir = path.join(websiteDir, 'src', 'data');
    if (!fs.existsSync(dataDir)) return false;

    const enPath = path.join(dataDir, 'clientsData.json');
    if (fs.existsSync(enPath)) {
      const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      if (clientsData.certifications) {
        if (!enData.certifications) enData.certifications = {};
        enData.certifications.items = Array.isArray(clientsData.certifications)
          ? clientsData.certifications
          : (clientsData.certifications.items || []);
      }
      if (clientsData.industries) {
        if (!enData.industries) enData.industries = {};
        if (clientsData.industries.title) enData.industries.title = clientsData.industries.title;
        if (clientsData.industries.subheading) enData.industries.subheading = clientsData.industries.subheading;
        if (clientsData.industries.description) {
          enData.industries.paragraphs = Array.isArray(clientsData.industries.description)
            ? clientsData.industries.description
            : typeof clientsData.industries.description === 'string'
              ? clientsData.industries.description.split('\n\n').filter(Boolean)
              : (enData.industries.paragraphs || []);
        }
        if (Array.isArray(clientsData.industries)) {
          enData.industries.tags = clientsData.industries;
        } else if (clientsData.industries.tags) {
          enData.industries.tags = clientsData.industries.tags;
        }
      }
      if (clientsData.expertise) {
        if (!enData.expertise) enData.expertise = {};
          if(clientsData.expertise.title) enData.expertise.title = clientsData.expertise.title;
        if (clientsData.expertise.subheading) enData.expertise.subheading = clientsData.expertise.subheading;
        if (clientsData.expertise.intro) enData.expertise.intro = clientsData.expertise.intro;
        if (clientsData.expertise.prompt) enData.expertise.prompt = clientsData.expertise.prompt;
        const expItems = Array.isArray(clientsData.expertise)
          ? clientsData.expertise
          : clientsData.expertise.items || [];
        enData.expertise.items = expItems.map((i: any) => ({
          domain: i.domain,
          technologies: i.technologies
        }));
      }
      if (clientsData.services) {
        if (!enData.services) enData.services = {};
        const servItems = Array.isArray(clientsData.services)
          ? clientsData.services
          : (clientsData.services.items || []);
        enData.services.items = servItems;
      }
      fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf-8');
    }

    // Sync NL
    const nlPath = path.join(dataDir, 'clientsData_nl.json');
    if (fs.existsSync(nlPath)) {
      const nlData = JSON.parse(fs.readFileSync(nlPath, 'utf-8'));
      if (clientsData.certifications && nlData.certifications) {
        nlData.certifications.items = Array.isArray(clientsData.certifications)
          ? clientsData.certifications
          : (clientsData.certifications.items || nlData.certifications.items);
      }
      if (clientsData.industries && nlData.industries) {
        nlData.industries.tags = Array.isArray(clientsData.industries)
          ? clientsData.industries
          : (clientsData.industries.tags || nlData.industries.tags);
      }
      if (clientsData.expertise && nlData.expertise) {
        const expItems = Array.isArray(clientsData.expertise)
          ? clientsData.expertise
          : clientsData.expertise.items || [];
        nlData.expertise.items = expItems;
      }
      if (clientsData.services && nlData.services) {
        nlData.services.items = Array.isArray(clientsData.services)
          ? clientsData.services
          : (clientsData.services.items || nlData.services.items);
      }
      fs.writeFileSync(nlPath, JSON.stringify(nlData, null, 2), 'utf-8');
    }

    return true;
  } catch (err) {
    console.error('Failed to sync clients to website:', err);
    return false;
  }
}

/**
 * 4. Sync Blogs to website (blogsData.json)
 */
export function syncBlogsToWebsite(blogs: any[]): boolean {
  try {
    const websiteDir = getWebsiteDir();
    const dataDir = path.join(websiteDir, 'src', 'data');
    if (!fs.existsSync(dataDir)) return false;

    const blogsPath = path.join(dataDir, 'blogsData.json');
    fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to sync blogs to website:', err);
    return false;
  }
}

/**
 * Full Sync All Modules
 */
export function executeFullSync(): SyncResult {
  const result: SyncResult = {
    success: true,
    timestamp: new Date().toISOString(),
    targetDir: getWebsiteDir(),
    filesSynced: [],
    errors: []
  };

  try {
    // 1. Team
    const team = readDataFile<any[]>('team.json', []);
    if (syncTeamToWebsite(team)) {
      result.filesSynced.push('aboutData.json', 'aboutData_nl.json');
    } else {
      result.errors.push('Could not sync team members to aboutData.json');
    }

    // 2. FAQs
    const faqs = readDataFile<any>('faqs.json', { categories: [], items: [] });
    if (syncFaqsToWebsite(faqs)) {
      result.filesSynced.push('pageFaqs.ts', 'allFaqs.ts', 'faqData.json', 'faqData_nl.json');
    } else {
      result.errors.push('Could not sync FAQs to pageFaqs.ts and faqData.json');
    }

    // 3. Clients
    const clients = readDataFile<any>('clients.json', {});
    if (syncClientsToWebsite(clients)) {
      result.filesSynced.push('clientsData.json', 'clientsData_nl.json');
    } else {
      result.errors.push('Could not sync clients data to clientsData.json');
    }

    // 4. Blogs
    const blogs = readDataFile<any[]>('blogs.json', []);
    if (syncBlogsToWebsite(blogs)) {
      result.filesSynced.push('blogsData.json');
    }

    result.success = result.errors.length === 0;
  } catch (e: any) {
    result.success = false;
    result.errors.push(e?.message || 'Unknown sync error');
  }

  return result;
}
