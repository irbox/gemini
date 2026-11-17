// The Keyword - Modern Client-side Enhancements
(function() {
  'use strict';

  // 1. Mobile Drawer Toggle
  const toggleBtn = document.querySelector('[data-menu-toggle]');
  const drawer = document.querySelector('[data-mobile-drawer]');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // 2. Category Filter Tabs
  const filterTabs = document.querySelectorAll('[data-filter-tab]');
  const storyCards = document.querySelectorAll('[data-story-category]');
  if (filterTabs.length && storyCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        const selectedCat = tab.getAttribute('data-filter-tab');
        storyCards.forEach(card => {
          const cardCat = card.getAttribute('data-story-category');
          if (selectedCat === 'all' || cardCat === selectedCat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Live Client-side Search Modal
  const searchBtn = document.querySelector('[data-search-trigger]');
  const searchModal = document.querySelector('[data-search-modal]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const closeSearchBtn = document.querySelector('[data-close-search]');

  let searchIndex = null;

  async function loadSearchIndex() {
    if (searchIndex) return searchIndex;
    try {
      const baseUrl = searchModal?.getAttribute('data-baseurl') || '';
      const res = await fetch(`${baseUrl}/search.json`);
      searchIndex = await res.json();
      return searchIndex;
    } catch (e) {
      console.error('Failed to load search index:', e);
      return [];
    }
  }

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('is-active');
    loadSearchIndex();
    setTimeout(() => searchInput?.focus(), 50);
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('is-active');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Keyboard shortcut: '/' or 'Cmd+K' / 'Ctrl+K'
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = '';
        return;
      }

      const index = await loadSearchIndex();
      const matches = index.filter(item => {
        return (item.title && item.title.toLowerCase().includes(query)) ||
               (item.description && item.description.toLowerCase().includes(query)) ||
               (item.category && item.category.toLowerCase().includes(query));
      });

      if (!matches.length) {
        searchResults.innerHTML = `<div class="no-results">No stories found matching "${query}"</div>`;
        return;
      }

      searchResults.innerHTML = matches.map(item => `
        <a href="${item.url}" class="search-item">
          <div class="search-item__title">${item.title}</div>
          <div class="search-item__meta">${item.category} • ${item.date}</div>
        </a>
      `).join('');
    });
  }
})();
