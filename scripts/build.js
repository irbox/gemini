import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BASE_URL = '/gemini';

// Helper for recursive copy
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Load Data
const navData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/navigation.json'), 'utf8'));
const researchAreas = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/research_areas.json'), 'utf8'));
const publications = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/publications.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/projects.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/people.json'), 'utf8'));
const blogPosts = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, '_data/blog.json'), 'utf8'));

// Google Logo SVG Component
function renderGoogleLogo() {
  return `
    <svg class="google-logo-svg" viewBox="0 0 74 24" width="74" height="24" aria-hidden="true" role="img">
      <use href="${BASE_URL}/gr/static/assets/icons/glue-icons.svg#google-solid-logo"></use>
    </svg>
  `;
}

// Header & Navigation Builder complying with Modern Web Guidance
function renderHeader(activeNav = '') {
  const navItemsHtml = navData.main.map(item => {
    const isCurrent = activeNav === item.id;
    const currentAttr = isCurrent ? 'aria-current="page"' : '';
    
    if (item.has_flyout && item.columns) {
      const columnsHtml = item.columns.map(col => `
        <div class="flyout-column">
          <div class="flyout-column-title">${col.heading}</div>
          <div class="flyout-items">
            ${col.items.map(sub => `
              <a href="${sub.url}" class="flyout-item">
                <img src="${BASE_URL}/gr/static/assets/icons/${sub.icon}" alt="" class="flyout-item-icon" width="24" height="24" loading="lazy">
                <div>
                  <span class="flyout-item-title">${sub.title}</span>
                  <span class="flyout-item-desc">${sub.desc}</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `).join('');

      return `
        <li class="nav-item">
          <button class="nav-link" type="button" popovertarget="flyout-${item.id}" ${currentAttr}>
            ${item.title}
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="m7 10 5 5 5-5z"/></svg>
          </button>
          <div id="flyout-${item.id}" class="dropdown-menu" popover="auto">
            <div class="flyout-grid">
              ${columnsHtml}
            </div>
          </div>
        </li>
      `;
    }

    return `
      <li class="nav-item">
        <a href="${item.url}" class="nav-link" ${currentAttr}>${item.title}</a>
      </li>
    `;
  }).join('');

  const mobileNavItemsHtml = navData.main.map(item => {
    const isCurrent = activeNav === item.id;
    const currentAttr = isCurrent ? 'aria-current="page"' : '';
    return `<li><a href="${item.url}" class="mobile-nav-link" ${currentAttr}>${item.title}</a></li>`;
  }).join('');

  return `
    <header class="site-header" role="banner">
      <div class="header-inner">
        <a href="${BASE_URL}/" class="brand-lockup" aria-label="Google Research Home">
          ${renderGoogleLogo()}
          <span class="research-text">Research</span>
        </a>

        <nav class="site-nav" aria-label="Primary">
          <ul class="nav-links-desktop">
            ${navItemsHtml}
          </ul>
        </nav>

        <div class="header-actions">
          <button type="button" class="search-trigger-btn" aria-label="Search Google Research" title="Search (Esc to close)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <button class="mobile-menu-btn" type="button" popovertarget="site-mobile-menu" aria-label="Toggle navigation menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          <ul id="site-mobile-menu" class="mobile-nav" popover="auto">
            ${mobileNavItemsHtml}
          </ul>
        </div>
      </div>
    </header>
  `;
}

// Search Modal Dialog complying with Modern Web Guidance dialog pattern
function renderSearchDialog() {
  return `
    <dialog class="search-modal" id="search-dialog" aria-labelledby="search-dialog-title" closedby="any">
      <div class="search-dialog-header">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5f6368" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <label for="search-input" class="sr-only" id="search-dialog-title">Search Google Research</label>
        <input 
          type="search" 
          id="search-input" 
          class="search-dialog-input" 
          placeholder="Search areas, papers, projects, people..." 
          autocomplete="off"
          autofocus
        >
        <form method="dialog">
          <button type="submit" class="search-dialog-close" aria-label="Close search">✕</button>
        </form>
      </div>
      <div class="search-dialog-results" id="search-results">
        <p style="color:var(--google-grey-500);text-align:center;padding:2rem 0;">Type to search across Research Areas, Publications, Projects, People, and Blog...</p>
      </div>
    </dialog>
  `;
}

// Authentic Google Research Footer
function renderFooter() {
  return `
    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="${BASE_URL}/" class="brand-lockup" aria-label="Google Research">
              ${renderGoogleLogo()}
              <span class="research-text">Research</span>
            </a>
            <p style="color:var(--google-grey-700);font-size:0.9rem;max-width:320px;margin-top:0.75rem;">
              Pursuing research that transforms lives, expands human knowledge, and advances state-of-the-art AI.
            </p>
            <div class="footer-social-links" style="margin-top:1.25rem;">
              <a href="https://twitter.com/GoogleResearch" class="social-icon-btn" aria-label="Google Research on X / Twitter" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com/google-research" class="social-icon-btn" aria-label="Google Research on GitHub" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </a>
              <a href="https://www.youtube.com/user/GoogleResearch" class="social-icon-btn" aria-label="Google Research on YouTube" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-columns">
            <div class="footer-col">
              <div class="footer-col-title">Research</div>
              <ul class="footer-col-links">
                <li><a href="${BASE_URL}/research-areas/">Research Areas</a></li>
                <li><a href="${BASE_URL}/pubs/">Publications</a></li>
                <li><a href="${BASE_URL}/resources/our-projects/">Projects</a></li>
                <li><a href="${BASE_URL}/people/">People</a></li>
                <li><a href="${BASE_URL}/blog/">Blog</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <div class="footer-col-title">Pillars</div>
              <ul class="footer-col-links">
                <li><a href="${BASE_URL}/research-areas/#earth-ai">Earth AI & Climate</a></li>
                <li><a href="${BASE_URL}/research-areas/#health-ai">Health AI & Medicine</a></li>
                <li><a href="${BASE_URL}/research-areas/#science-ai">Science AI & Biology</a></li>
                <li><a href="${BASE_URL}/research-areas/#quantum">Quantum Computing</a></li>
                <li><a href="${BASE_URL}/research-areas/#responsible-ai">Responsible AI</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <div class="footer-col-title">Programs</div>
              <ul class="footer-col-links">
                <li><a href="${BASE_URL}/programs-and-events/">Academic Engagement</a></li>
                <li><a href="${BASE_URL}/programs-and-events/">PhD Fellowships</a></li>
                <li><a href="${BASE_URL}/programs-and-events/">Research Grants</a></li>
                <li><a href="https://careers.google.com">Google Careers</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} Google LLC. All rights reserved.</div>
          <ul class="footer-legal-links">
            <li><a href="https://about.google/">About Google</a></li>
            <li><a href="https://policies.google.com/privacy">Privacy</a></li>
            <li><a href="https://policies.google.com/terms">Terms</a></li>
            <li><a href="${BASE_URL}/search.json">Search Index</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}

// Complete Page Wrapper
function renderFullPage({ title, description, activeNav, content }) {
  const pageTitle = title.includes('Google Research') ? title : `${title} – Google Research`;
  const metaDesc = description || "Discover Google Research. We publish research papers across a wide range of domains and share our latest developments in AI and science research.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="base-url" content="${BASE_URL}">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="https://irbox.github.io${BASE_URL}/">

  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://irbox.github.io${BASE_URL}/">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="https://www.gstatic.com/images/branding/googleg_gradient/1x/googleg_gradient_standard_20dp.png">

  <!-- Google Fonts: Google Sans Flex & Product Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,300..700&family=Google+Sans+Display:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=Product+Sans:wght@400;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="${BASE_URL}/gr/static/css/glue-material.min.css">
  <link rel="stylesheet" href="${BASE_URL}/gr/static/css/googleresearch.css">
  <link rel="stylesheet" href="${BASE_URL}/gr/static/css/modern-custom.css">
</head>
<body class="glue-body">
  ${renderHeader(activeNav)}
  ${renderSearchDialog()}

  <main id="page-content" tabindex="-1">
    ${content}
  </main>

  ${renderFooter()}

  <!-- Client-side script -->
  <script src="${BASE_URL}/gr/static/js/modern-components.js" type="module"></script>
</body>
</html>`;
}

// -------------------------------------------------------------
// Page Generators
// -------------------------------------------------------------

// 1. Homepage
function generateHomePage() {
  const latestPubsHtml = publications.slice(0, 3).map(pub => `
    <article class="research-card">
      <div class="card-top">
        <span class="card-badge">${pub.area}</span>
        <span style="font-size:0.85rem;color:var(--google-grey-500);font-weight:500;">${pub.year}</span>
      </div>
      <div>
        <h3 class="card-title">${pub.title}</h3>
        <p class="card-description">${pub.abstract.slice(0, 180)}...</p>
      </div>
      <div class="card-footer">
        <span style="font-size:0.85rem;color:var(--google-grey-700);">${pub.venue.split('(')[0]}</span>
        <a href="${BASE_URL}/pubs/#${pub.id}" class="card-action-link">
          Read paper →
        </a>
      </div>
    </article>
  `).join('');

  const flagshipProjectsHtml = projects.slice(0, 3).map(proj => `
    <div class="research-card">
      <div class="card-top">
        <span class="card-badge" style="background-color:rgba(52, 168, 83, 0.12);color:var(--google-green);">${proj.status}</span>
        <span style="font-size:0.85rem;color:var(--google-grey-500);font-weight:500;">${proj.area}</span>
      </div>
      <div>
        <h3 class="card-title">${proj.name}</h3>
        <div style="font-size:0.9rem;color:var(--google-blue);font-weight:500;margin-bottom:0.5rem;">${proj.tagline}</div>
        <p class="card-description">${proj.summary.slice(0, 190)}...</p>
      </div>
      <div class="card-footer">
        <div style="display:flex;gap:1rem;">
          ${proj.metrics.slice(0, 2).map(m => `
            <div>
              <div style="font-size:0.75rem;color:var(--google-grey-500);">${m.label}</div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--google-grey-900);">${m.value}</div>
            </div>
          `).join('')}
        </div>
        <a href="${BASE_URL}/resources/our-projects/#${proj.id}" class="card-action-link">Explore →</a>
      </div>
    </div>
  `).join('');

  const pillarsHtml = researchAreas.map(pillar => `
    <div class="research-card">
      <div>
        <span class="card-badge" style="background-color:rgba(26,115,232,0.1);color:var(--google-blue);margin-bottom:0.75rem;display:inline-block;">Pillar</span>
        <h3 class="card-title">${pillar.pillar}</h3>
        <p class="card-description">${pillar.description}</p>
        <div style="margin-top:1rem;">
          <div style="font-size:0.8rem;text-transform:uppercase;color:var(--google-grey-500);font-weight:700;margin-bottom:0.5rem;">Key Areas</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${pillar.areas.map(a => `<span class="btn-chip" style="pointer-events:none;">${a.title}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="card-footer" style="margin-top:1.5rem;">
        <a href="${BASE_URL}/research-areas/#${pillar.slug}" class="btn-primary" style="padding:0.5rem 1rem;font-size:0.875rem;">
          View ${pillar.areas.length} Areas →
        </a>
      </div>
    </div>
  `).join('');

  const content = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-pill-badge">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--google-blue)"><circle cx="12" cy="12" r="10"/></svg>
        Advancing Science and AI for Everyone
      </div>
      <h1 class="display-headline">Amplifying human ingenuity</h1>
      <p class="sub-headline">
        At Google Research, we pursue foundational innovation that has the potential to fundamentally change how people live—from quantum processors below error thresholds to planetary crisis prediction and biological discovery.
      </p>
      <div class="hero-actions">
        <a href="${BASE_URL}/research-areas/" class="btn-primary">Explore research areas</a>
        <a href="${BASE_URL}/pubs/" class="btn-secondary">Browse publications</a>
        <button type="button" class="btn-secondary search-trigger-btn">Search research</button>
      </div>
    </section>

    <!-- Latest Research Breakthroughs -->
    <section class="content-container">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1rem;">
        <div>
          <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Breakthroughs</span>
          <h2 class="section-headline">Read the latest</h2>
        </div>
        <a href="${BASE_URL}/pubs/" class="card-action-link" style="font-size:0.95rem;margin-bottom:0.5rem;">View all publications →</a>
      </div>
      <div class="grid-3-col">
        ${latestPubsHtml}
      </div>
    </section>

    <!-- Core Research Pillars -->
    <section class="content-container" style="background:var(--google-grey-50);border-radius:24px;padding:3rem 2rem;margin-top:2rem;">
      <div style="text-align:center;max-width:760px;margin:0 auto 2.5rem;">
        <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Domains</span>
        <h2 class="section-headline">Explore our many areas of focus</h2>
        <p style="color:var(--google-grey-700);font-size:1.05rem;">
          Our multidisciplinary teams collaborate across computer science, theoretical physics, atmospheric modeling, and molecular biology.
        </p>
      </div>
      <div class="grid-3-col">
        ${pillarsHtml}
      </div>
    </section>

    <!-- Flagship Projects -->
    <section class="content-container" style="margin-top:4rem;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1rem;">
        <div>
          <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-green);letter-spacing:0.05em;">Initiatives</span>
          <h2 class="section-headline">Computational Discovery</h2>
        </div>
        <a href="${BASE_URL}/resources/our-projects/" class="card-action-link" style="font-size:0.95rem;margin-bottom:0.5rem;">See all projects →</a>
      </div>
      <div class="grid-3-col">
        ${flagshipProjectsHtml}
      </div>
    </section>

    <!-- Tribute to Open Research -->
    <section class="content-container" style="margin-top:2rem;">
      <div style="background:linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);color:#ffffff;border-radius:24px;padding: clamp(2rem, 1.5rem + 3vw, 4rem);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2rem;">
        <div style="max-width:680px;">
          <span style="background:rgba(255,255,255,0.2);padding:0.3rem 0.8rem;border-radius:100px;font-size:0.8rem;font-weight:600;text-transform:uppercase;">Milestone</span>
          <h2 style="font-family:var(--font-display);font-size:clamp(1.75rem, 1.2rem + 2vw, 2.75rem);margin:1rem 0 0.5rem;font-weight:500;">One research paper started it all</h2>
          <p style="font-size:1.1rem;opacity:0.95;line-height:1.6;margin-bottom:1.5rem;">
            In 2017, Google researchers published "Attention Is All You Need," introducing the Transformer architecture. Today, Transformers underpin modern generative AI, language translation, protein modeling, and multimodal foundation models worldwide.
          </p>
          <a href="${BASE_URL}/pubs/#transformer-2017" class="btn-primary" style="background:#ffffff;color:var(--google-blue);">
            Read the original paper
          </a>
        </div>
        <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:16px;padding:1.5rem;max-width:340px;width:100%;">
          <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;opacity:0.8;">Citations & Impact</div>
          <div style="font-size:2.5rem;font-weight:700;font-family:var(--font-display);margin:0.25rem 0;">150,000+</div>
          <div style="font-size:0.85rem;opacity:0.9;">Academic citations across machine learning, computational biology, and physics literature.</div>
        </div>
      </div>
    </section>
  `;

  return renderFullPage({
    title: "Google Research - Explore Our Latest Research in Science and AI",
    description: "Discover Google Research. We publish research papers across a wide range of domains and share our latest developments in AI and science research.",
    activeNav: "home",
    content
  });
}

// 2. Research Areas Page
function generateResearchAreasPage() {
  const sectionsHtml = researchAreas.map(pillar => `
    <div id="${pillar.slug}" style="margin-bottom:4rem;">
      <div style="border-bottom:2px solid var(--google-grey-200);padding-bottom:1rem;margin-bottom:2rem;">
        <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Core Pillar</span>
        <h2 class="section-headline">${pillar.pillar}</h2>
        <p style="color:var(--google-grey-700);font-size:1.1rem;max-width:85ch;margin:0;">${pillar.description}</p>
      </div>

      <div class="grid-2-col">
        ${pillar.areas.map(area => `
          <div id="${area.id}" class="research-card">
            <div>
              <div class="card-top">
                <img src="${BASE_URL}/gr/static/assets/icons/${area.icon}" alt="" class="card-icon" width="36" height="36" loading="lazy">
                <span class="card-badge">${area.paper_count} Papers</span>
              </div>
              <h3 class="card-title">${area.title}</h3>
              <p class="card-description">${area.summary}</p>
            </div>
            <div class="card-footer">
              <div style="font-size:0.85rem;color:var(--google-grey-700);">
                <strong>Leads:</strong> ${area.leads.join(', ')}
              </div>
              <a href="${BASE_URL}/pubs/?area=${encodeURIComponent(area.title)}" class="card-action-link">
                View papers →
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Research Taxonomy</span>
      <h1 class="display-headline">Explore our many areas of focus</h1>
      <p class="sub-headline">
        Our research teams tackle complex challenges across computing, fundamental sciences, and society. We publish openly and build collaboratively to advance human understanding.
      </p>
    </section>

    <div class="content-container">
      ${sectionsHtml}
    </div>
  `;

  return renderFullPage({
    title: "Research Areas – Google Research",
    description: "Explore our many areas of focus across Applied AI, Foundational ML, and Computing Systems at Google Research.",
    activeNav: "research-areas",
    content
  });
}

// 3. Publications Page
function generatePublicationsPage() {
  const pubsListHtml = publications.map(pub => `
    <article class="pub-item" id="${pub.id}" data-area="${pub.area}">
      <div class="pub-meta">
        <span class="pub-venue-badge">${pub.venue}</span>
        <span class="pub-year">${pub.year}</span>
        <span class="btn-chip" style="font-size:0.75rem;padding:0.15rem 0.5rem;pointer-events:none;">${pub.area}</span>
      </div>
      <h3 class="pub-title">${pub.title}</h3>
      <div class="pub-authors">
        <strong>Authors:</strong> ${pub.authors.join(', ')}
      </div>
      <p class="pub-abstract">${pub.abstract}</p>
      <div class="pub-actions">
        <a href="${pub.pdf_url}" class="btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem;" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          PDF / Publisher
        </a>
        <button type="button" class="btn-chip" data-bibtex-toggle="bib-${pub.id}" aria-expanded="false">
          BibTeX Citation
        </button>
      </div>
      <div id="bib-${pub.id}" class="bibtex-box" hidden>
        <button type="button" class="btn-chip" data-copy-bibtex="bib-code-${pub.id}" style="position:absolute;top:0.5rem;right:0.5rem;background:#ffffff;">Copy</button>
        <code id="bib-code-${pub.id}">${pub.bibtex}</code>
      </div>
    </article>
  `).join('');

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Scholarly Output</span>
      <h1 class="display-headline">Publications</h1>
      <p class="sub-headline">
        Discover peer-reviewed papers published by Google researchers across NeurIPS, ICML, Nature, Science, and leading journals.
      </p>

      <!-- Filter Chips -->
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.5rem;">
        <button type="button" class="btn-chip pub-filter-btn active" data-filter="all">All Disciplines</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Natural Language Processing">NLP & Transformers</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Quantum AI">Quantum AI</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Science AI">Science AI</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Health AI">Health AI</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Earth AI">Earth AI & Climate</button>
        <button type="button" class="btn-chip pub-filter-btn" data-filter="Software & Hardware Systems">Systems & TPUs</button>
      </div>
    </section>

    <div class="content-container">
      <div class="pubs-catalog">
        ${pubsListHtml}
      </div>
    </div>
  `;

  return renderFullPage({
    title: "Publications – Google Research",
    description: "Browse publications authored by Google researchers in artificial intelligence, quantum computing, climate science, and health.",
    activeNav: "pubs",
    content
  });
}

// 4. Projects Page
function generateProjectsPage() {
  const projectsHtml = projects.map(proj => `
    <article class="research-card" id="${proj.id}" style="margin-bottom:2rem;">
      <div class="card-top">
        <div>
          <span class="card-badge" style="background-color:rgba(52, 168, 83, 0.12);color:var(--google-green);margin-right:0.5rem;">${proj.status}</span>
          <span style="font-size:0.85rem;color:var(--google-grey-500);font-weight:500;">${proj.area}</span>
        </div>
        <span style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--google-grey-500);">${proj.pillar}</span>
      </div>
      <div>
        <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:500;margin:0.25rem 0 0.5rem;color:var(--google-grey-900);">${proj.name}</h2>
        <div style="font-size:1rem;color:var(--google-blue);font-weight:500;margin-bottom:0.75rem;">${proj.tagline}</div>
        <p class="card-description" style="font-size:1rem;line-height:1.6;">${proj.summary}</p>
      </div>

      <div style="background:var(--google-grey-50);border-radius:12px;padding:1rem;margin:1rem 0;display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:1rem;">
        ${proj.metrics.map(m => `
          <div>
            <div style="font-size:0.75rem;color:var(--google-grey-500);text-transform:uppercase;">${m.label}</div>
            <div style="font-size:1.15rem;font-weight:700;color:var(--google-grey-900);font-family:var(--font-display);">${m.value}</div>
          </div>
        `).join('')}
      </div>

      <div class="card-footer">
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          ${proj.links.map(l => `
            <a href="${l.url}" class="btn-chip" target="_blank" rel="noopener">
              ${l.label} ↗
            </a>
          `).join('')}
        </div>
      </div>
    </article>
  `).join('');

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-green);letter-spacing:0.05em;">Flagship Research</span>
      <h1 class="display-headline">Projects</h1>
      <p class="sub-headline">
        From quantum hardware breakthroughs to planetary disaster warning systems, explore Google Research's flagship scientific initiatives.
      </p>
    </section>

    <div class="content-container">
      <div style="max-width:960px;margin:0 auto;">
        ${projectsHtml}
      </div>
    </div>
  `;

  return renderFullPage({
    title: "Projects – Google Research",
    description: "Explore flagship research projects at Google Research, including Project Willow, AlphaFold, GraphCast, and FloodHub.",
    activeNav: "projects",
    content
  });
}

// 5. People Page
function generatePeoplePage() {
  const peopleHtml = people.map(p => `
    <article class="person-card" id="${p.id}">
      <div class="person-header">
        <div class="person-avatar" style="background-color:${p.avatar_color};">
          ${p.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h3 class="person-name">${p.name}</h3>
          <div class="person-title">${p.title}</div>
          <span style="font-size:0.75rem;color:var(--google-grey-500);text-transform:uppercase;font-weight:600;">${p.group}</span>
        </div>
      </div>
      <p class="person-bio">${p.bio}</p>
      <div class="card-footer">
        <span style="font-size:0.85rem;color:var(--google-grey-700);"><strong>${p.publications_count}</strong> Publications</span>
        <div style="display:flex;gap:0.5rem;">
          ${p.links.map(l => `
            <a href="${l.url}" class="card-action-link" target="_blank" rel="noopener">
              ${l.label} ↗
            </a>
          `).join('')}
        </div>
      </div>
    </article>
  `).join('');

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Our Researchers</span>
      <h1 class="display-headline">People</h1>
      <p class="sub-headline">
        Google researchers, scientists, and engineers drive advancements in computer science and fundamental science through both curiosity-driven and applied discovery.
      </p>
    </section>

    <div class="content-container">
      <div class="grid-3-col">
        ${peopleHtml}
      </div>
    </div>
  `;

  return renderFullPage({
    title: "People – Google Research",
    description: "Meet the researchers, fellows, and scientists driving advancements at Google Research.",
    activeNav: "people",
    content
  });
}

// 6. Blog Page
function generateBlogPage() {
  const blogListHtml = blogPosts.map(post => `
    <article class="pub-item" id="${post.id}">
      <div class="pub-meta">
        <span class="pub-venue-badge" style="background-color:rgba(234, 67, 53, 0.1);color:var(--google-red);">${post.category}</span>
        <span class="pub-year">${post.date}</span>
        <span style="font-size:0.8rem;color:var(--google-grey-500);">${post.read_time}</span>
      </div>
      <h2 style="font-family:var(--font-display);font-size:1.35rem;font-weight:500;margin:0.25rem 0 0.5rem;color:var(--google-grey-900);">
        <a href="${BASE_URL}${post.url}" style="color:inherit;text-decoration:none;">${post.title}</a>
      </h2>
      <div style="font-size:0.85rem;color:var(--google-grey-700);margin-bottom:0.75rem;">
        By <strong>${post.author}</strong>
      </div>
      <p class="pub-abstract">${post.excerpt}</p>
      <div class="pub-actions">
        <a href="${BASE_URL}${post.url}" class="card-action-link">
          Read full post →
        </a>
      </div>
    </article>
  `).join('');

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-red);letter-spacing:0.05em;">Research Blog</span>
      <h1 class="display-headline">The latest research from Google</h1>
      <p class="sub-headline">
        Technical insights, announcements, and deep dives from our researchers and engineers worldwide.
      </p>
    </section>

    <div class="content-container">
      <div style="max-width:860px;margin:0 auto;">
        ${blogListHtml}
      </div>
    </div>
  `;

  return renderFullPage({
    title: "Latest News from Google Research Blog – Google Research",
    description: "Read the latest news, breakthrough announcements, and technical deep dives from the Google Research Blog.",
    activeNav: "blog",
    content
  });
}

// 7. Programs & Events Page
function generateProgramsPage() {
  const programs = [
    {
      title: "Faculty Engagement & Research Awards",
      desc: "Meaningful engagement with university faculty worldwide through research grants, unrestricted gifts, and sabbatical opportunities.",
      badge: "Faculty",
      link: "https://research.google/programs-and-events/faculty-engagement/"
    },
    {
      title: "Student Programs & PhD Fellowships",
      desc: "Recognizing outstanding graduate students doing exceptional research in computer science and related fields, with tuition, stipend, and mentorship.",
      badge: "Students",
      link: "https://research.google/programs-and-events/student-engagement/"
    },
    {
      title: "Visiting Researchers & Sabbaticals",
      desc: "Distinguished academics spend dedicated research sabbaticals collaborating on site with Google scientists on foundational problems.",
      badge: "Visiting Scholars",
      link: "https://research.google/programs-and-events/"
    },
    {
      title: "Google Carbon Removal & Sustainability R&D Awards",
      desc: "Supporting climate researchers and academic teams pioneering catalytic technologies for atmospheric greenhouse gas removal.",
      badge: "R&D Grants",
      link: "https://research.google/programs-and-events/"
    }
  ];

  const content = `
    <section class="hero-section" style="padding-bottom:2rem;">
      <span style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--google-blue);letter-spacing:0.05em;">Academic Community</span>
      <h1 class="display-headline">Programs & Events</h1>
      <p class="sub-headline">
        We collaborate deeply with university faculty, graduate students, and independent research institutions to support the global academic ecosystem.
      </p>
    </section>

    <div class="content-container">
      <div class="grid-2-col">
        ${programs.map(pr => `
          <div class="research-card">
            <div>
              <span class="card-badge" style="background-color:rgba(26,115,232,0.1);color:var(--google-blue);">${pr.badge}</span>
              <h3 class="card-title" style="margin-top:0.75rem;">${pr.title}</h3>
              <p class="card-description">${pr.desc}</p>
            </div>
            <div class="card-footer">
              <a href="${pr.link}" class="btn-primary" style="padding:0.5rem 1rem;font-size:0.875rem;" target="_blank" rel="noopener">
                Learn more ↗
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return renderFullPage({
    title: "Programs & Events – Google Research",
    description: "Explore Google Research academic engagement, PhD Fellowships, Faculty Awards, and Student Programs.",
    activeNav: "programs",
    content
  });
}

// 8. 404 Page
function generate404Page() {
  const content = `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:4rem 1.5rem;text-align:center;">
      <div style="max-width:540px;">
        <div style="font-family:var(--font-display);font-size:6rem;font-weight:700;color:var(--google-blue);line-height:1;">404</div>
        <h1 style="font-family:var(--font-display);font-size:2rem;font-weight:500;margin:1rem 0;color:var(--google-grey-900);">Page not found</h1>
        <p style="color:var(--google-grey-700);font-size:1.1rem;margin-bottom:2rem;">
          The requested URL was not found on this server. That’s all we know.
        </p>
        <div style="display:flex;justify-content:center;gap:1rem;">
          <a href="${BASE_URL}/" class="btn-primary">Return to Google Research</a>
          <button type="button" class="btn-secondary search-trigger-btn">Search site</button>
        </div>
      </div>
    </div>
  `;

  return renderFullPage({
    title: "Page Not Found – Google Research",
    description: "The requested page was not found.",
    activeNav: "",
    content
  });
}

// 9. Generate Search Index
function generateSearchIndex() {
  const items = [];

  // Research areas
  researchAreas.forEach(p => {
    p.areas.forEach(a => {
      items.push({
        title: `${a.title} – ${p.pillar}`,
        category: "Research Area",
        description: a.summary,
        url: `${BASE_URL}/research-areas/#${a.id}`
      });
    });
  });

  // Publications
  publications.forEach(pub => {
    items.push({
      title: pub.title,
      category: `Publication (${pub.area})`,
      description: `${pub.venue} - ${pub.authors.slice(0, 3).join(', ')}. ${pub.abstract}`,
      url: `${BASE_URL}/pubs/#${pub.id}`
    });
  });

  // Projects
  projects.forEach(proj => {
    items.push({
      title: `${proj.name}: ${proj.tagline}`,
      category: "Project",
      description: proj.summary,
      url: `${BASE_URL}/resources/our-projects/#${proj.id}`
    });
  });

  // People
  people.forEach(person => {
    items.push({
      title: `${person.name} – ${person.title}`,
      category: "Researcher Profile",
      description: person.bio,
      url: `${BASE_URL}/people/#${person.id}`
    });
  });

  // Blog
  blogPosts.forEach(bp => {
    items.push({
      title: bp.title,
      category: "Blog Article",
      description: `${bp.author} (${bp.date}) – ${bp.excerpt}`,
      url: `${BASE_URL}/blog/#${bp.id}`
    });
  });

  return JSON.stringify(items, null, 2);
}

// -------------------------------------------------------------
// Main Build Execution
// -------------------------------------------------------------
function build() {
  console.log('🚀 Building 1:1 Google Research static site...');

  const pages = [
    { outPath: 'index.html', html: generateHomePage() },
    { outPath: 'research-areas/index.html', html: generateResearchAreasPage() },
    { outPath: 'pubs/index.html', html: generatePublicationsPage() },
    { outPath: 'resources/our-projects/index.html', html: generateProjectsPage() },
    { outPath: 'people/index.html', html: generatePeoplePage() },
    { outPath: 'blog/index.html', html: generateBlogPage() },
    { outPath: 'programs-and-events/index.html', html: generateProgramsPage() },
    { outPath: '404.html', html: generate404Page() }
  ];

  const searchIndexJson = generateSearchIndex();

  const TARGET_DIRS = [ROOT_DIR, DIST_DIR];

  for (const targetDir of TARGET_DIRS) {
    fs.mkdirSync(targetDir, { recursive: true });

    // Write pages
    for (const page of pages) {
      const fullPath = path.join(targetDir, page.outPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, page.html, 'utf8');
      console.log(`  ✓ ${path.relative(ROOT_DIR, fullPath)}`);
    }

    // Write search.json
    fs.writeFileSync(path.join(targetDir, 'search.json'), searchIndexJson, 'utf8');
    console.log(`  ✓ ${path.relative(ROOT_DIR, path.join(targetDir, 'search.json'))}`);

    // If dist, copy assets
    if (targetDir === DIST_DIR) {
      console.log('📂 Copying assets to dist/gr/static...');
      copyDirSync(path.join(ROOT_DIR, 'gr'), path.join(DIST_DIR, 'gr'));
      fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');
    }
  }

  console.log('✨ 1:1 Google Research static site built successfully!');
}

build();
