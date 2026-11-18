// Google Research Modern Web Components
// Built according to Modern Web Guidance standards

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Elevation
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Search Modal (Native Dialog with modern-web-guidance compliance)
  const searchDialog = document.getElementById('search-dialog');
  const searchTriggers = document.querySelectorAll('.search-trigger-btn, [data-action="open-search"]');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  let searchIndex = null;

  if (searchDialog) {
    searchTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        searchDialog.showModal();
        if (searchInput) searchInput.focus();
        loadSearchIndex();
      });
    });

    // Close on backdrop click (closedby="any" light dismiss fallback)
    searchDialog.addEventListener('click', (e) => {
      const rect = searchDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        searchDialog.close();
      }
    });

    // Fetch and cache search.json
    async function loadSearchIndex() {
      if (searchIndex) return;
      try {
        const basePath = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '/gemini';
        const res = await fetch(`${basePath}/search.json`);
        if (res.ok) {
          searchIndex = await res.json();
        }
      } catch (err) {
        console.error('Failed to load search index:', err);
      }
    }

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query || !searchIndex) {
          searchResults.innerHTML = '<p style="color:var(--google-grey-500);text-align:center;padding:2rem 0;">Type to search across Research Areas, Publications, Projects, People, and Blog...</p>';
          return;
        }

        const matches = searchIndex.filter(item => {
          return (
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
          );
        }).slice(0, 8);

        if (matches.length === 0) {
          searchResults.innerHTML = `<p style="color:var(--google-grey-700);text-align:center;padding:2rem 0;">No results found for "${query}".</p>`;
          return;
        }

        searchResults.innerHTML = matches.map(item => `
          <a href="${item.url}" class="search-result-item">
            <span class="search-result-category">${item.category || 'Research'}</span>
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-snippet">${item.description ? item.description.slice(0, 140) + '...' : ''}</div>
          </a>
        `).join('');
      });
    }
  }

  // 3. Interactive BibTeX Toggles & Copy
  document.querySelectorAll('[data-bibtex-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-bibtex-toggle');
      const box = document.getElementById(targetId);
      if (box) {
        const isHidden = box.hidden;
        box.hidden = !isHidden;
        btn.setAttribute('aria-expanded', String(isHidden));
      }
    });
  });

  document.querySelectorAll('[data-copy-bibtex]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-copy-bibtex');
      const box = document.getElementById(targetId);
      if (box) {
        const text = box.innerText;
        try {
          await navigator.clipboard.writeText(text);
          const orig = btn.innerText;
          btn.innerText = 'Copied!';
          setTimeout(() => btn.innerText = orig, 2000);
        } catch {
          btn.innerText = 'Press Ctrl+C to copy';
        }
      }
    });
  });

  // 4. Publications Area Filter
  const filterBtns = document.querySelectorAll('.pub-filter-btn');
  const pubItems = document.querySelectorAll('.pub-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      pubItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-area') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
