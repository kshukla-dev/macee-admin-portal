# Macee CRM & Admin Management Portal

A full-featured Next.js Admin & CRM Portal built specifically for **Macee BV**. It gives administrators full control over incoming website leads, team profiles on the About page, published blog articles, knowledge base FAQs, and corporate clients/certifications.

---

## 🚀 Key Modules & Capabilities

### 1. 📬 Contact & Get in Touch Form Submissions (CRM Inbox)
- **Live Lead Capture**: Receives inquiries sent from the Macee website contact form and consultation booking modals in real time.
- **Pipeline Status Tracking**: Filter by `New`, `In Progress`, `Contacted`, and `Closed`.
- **Search & Quick Inspection**: Search inquiries by candidate/client name, company, email, topic, or message keyword.
- **Lead Modal**: View full message body, quick click-to-email and click-to-call, status updates, and internal team notes.
- **Export to CSV**: Download all inquiries into a spreadsheet with one click.

### 2. 👥 About Us Page Management (Team Members & Profiles)
- **Live Synchronisation**: Edits, additions, or deletions immediately write back to `macee-_update_contant/src/data/aboutData.json` (and Dutch translation `aboutData_nl.json`).
- **Profile Fields**: Member full name, role/designation, profile photo URL (with avatar presets), email, direct phone, LinkedIn profile link, desk, and display sort order.
- **Instant Live Update**: No rebuild required; refresh the Macee website to see new team members immediately.

### 3. 📝 Blog Management (CMS)
- **Publish & Draft Articles**: Create rich thought-leadership articles, legal guidance (e.g. Dutch Wet DBA compliance, IND 30% tax benefit ruling), and tech market trends.
- **Metadata**: Category selector, author attribution, cover image, slug generator, short excerpt, read time estimate, tags, and Markdown body.
- **Saved to**: `blogsData.json` and served via public REST API.

### 4. ❓ FAQ & Knowledge Base Management
- **Category Organization**: Categorized under *What does MACEE do*, *Services and Contract options*, and *Specialties and positions*.
- **Add / Edit / Reorder**: Edit questions, answers, tags, and ordering.
- **Live Sync**: Writes directly to `macee-_update_contant/src/data/faqData.json` and `faqData_nl.json`.

### 5. 🏢 Clients & Solutions Page Management
- **Certifications**: Manage SNA NEN 4400-1, IND Recognised Sponsor (Erkend Referent), and SBB training company accreditations. Toggle featured teal accent highlight.
- **Industries**: Add, remove, or edit active industry tags (Telecoms, FMCG, Banking & Fintech, Oil & Gas, Healthcare & Pharma, etc.) and introductory description.
- **Technical Expertise Domains**: Edit technology domains (Software Development, BI & Data, Cloud, Security, Finance Risk Management, Project Management) and their technology stacks.
- **Live Sync**: Writes directly to `macee-_update_contant/src/data/clientsData.json` and `clientsData_nl.json`.

---

## 🔐 Default Admin Login Credentials

- **Portal URL**: `http://localhost:3001`
- **Email**: `admin@macee.com`
- **Password**: `admin123`

---

## 🛠️ How to Run

### Development Mode (with hot-reload):
```bash
npm run dev
# or double click dev-crm.cmd
```
Runs on `http://localhost:3001`.

### Production Mode:
```bash
npm run build
npm start
# or double click start-crm.cmd
```

---

## 🌐 Public REST API Endpoints (Port 3001)

All endpoints include CORS headers for frontend integration:
- `POST /api/public/contact` — Submits new contact form inquiry
- `GET  /api/public/team` — Fetches active team members
- `GET  /api/public/blogs` — Fetches published blog articles
- `GET  /api/public/faqs` — Fetches active FAQs
- `GET  /api/public/clients` — Fetches certifications, industries, and expertise
- `POST /api/sync` — Triggers a full synchronization with the website files
"# macee-admin-portal" 
