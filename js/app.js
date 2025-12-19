// App.js - Main vanilla JavaScript application with router

// Configuration and utilities are now loaded from external files

class App {
  constructor() {
    try {
      console.log('App constructor started...');
      
      this.initializeTheme();
      this.initializeState();
      
      console.log('App constructor completed, darkMode:', this.darkMode);
    } catch (error) {
      Utils.handleError(error, 'App constructor');
      throw error;
    }
  }

  initializeTheme() {
    const savedTheme = Utils.getStorageItem(CONFIG.THEME.STORAGE_KEY);
    const lastSetTsStr = Utils.getStorageItem(CONFIG.THEME.PREF_LAST_SET_KEY);
    const lastSetTs = lastSetTsStr ? parseInt(lastSetTsStr, 10) : 0;

    const now = new Date();
    const boundaryTs = this.getCurrentBoundaryTimestamp(now);

    if (savedTheme && lastSetTs && lastSetTs >= boundaryTs) {
      this.darkMode = (savedTheme === CONFIG.THEME.DARK);
    } else {
      this.darkMode = this.shouldUseDarkTheme(now);
    }
    
    this.updateThemeUI();
  }

  shouldUseDarkTheme(dateObj) {
    if (!Utils.isWindowAvailable()) return false;
    
    try {
      const hour = (dateObj || new Date()).getHours();
      return hour >= CONFIG.THEME.NIGHT_START_HOUR || hour < CONFIG.THEME.NIGHT_END_HOUR;
    } catch (error) {
      Utils.handleError(error, 'shouldUseDarkTheme');
      return false;
    }
  }

  // Returns Unix ms of the most recent boundary start (night start)
  getCurrentBoundaryTimestamp(now) {
    try {
      const d = new Date(now.getTime());
      const nightStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), CONFIG.THEME.NIGHT_START_HOUR, 0, 0, 0);
      if (d.getHours() >= CONFIG.THEME.NIGHT_START_HOUR) {
        return nightStart.getTime();
      }
      const yesterday = new Date(nightStart.getTime() - 24 * 60 * 60 * 1000);
      const prevNightStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), CONFIG.THEME.NIGHT_START_HOUR, 0, 0, 0);
      return prevNightStart.getTime();
    } catch (error) {
      Utils.handleError(error, 'getCurrentBoundaryTimestamp');
      return 0;
    }
  }

  initializeState() {
    this.currentPage = CONFIG.DEFAULTS.PAGE;
    this.currentParams = {};
    this.blogPosts = [];
    this.isMenuOpen = false;

    // Blog list controls state
    this.blogSearchQuery = '';
    this.blogSelectedTag = '';
    this.blogCurrentPageIndex = 0;
    this.allTags = [];
    this.tagFilterOpen = false;

    // Outside click handler ref for dropdown
    this._tagFilterOutsideHandler = null;
  }

  async init() {
    try {
      // Initialize icons first to prevent visual jumps
      this.initializeIcons();
      
      // Disable browser scroll restoration for SPA routing
      if (typeof window !== 'undefined' && window.history && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      
      await this.loadBlogPosts();
      this.setupRouting();
      this.setupEventListeners();
      this.render();
      this.updateThemeUI();
      this.updateCurrentYear();
      this.updateSocialLinks();
    } catch (error) {
      Utils.handleError(error, 'init');
    }
  }

  async loadBlogPosts() {
    try {
      // Load posts index
      const indexResponse = await fetch('data/posts/index.json');
      if (!indexResponse.ok) throw new Error(`HTTP error! status: ${indexResponse.status}`);
      const index = await indexResponse.json();

      // Fetch all markdown files listed in index, in parallel
      const mdResponses = await Promise.all(index.map(item => fetch(item.file)));
      const mdTexts = await Promise.all(mdResponses.map(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${res.url}: ${res.status}`);
        return res.text();
      }));

      // Parse frontmatter and markdown, build normalized posts with fallbacks
      const posts = mdTexts.map((md, i) => {
        const idxItem = index[i] || {};
        const { frontmatter, content } = Utils.parseFrontmatter(md);
        const html = Utils.markdownToHtml(content);

        // Merge metadata: frontmatter overrides index where present
        const id = frontmatter.id || idxItem.id;
        const title = frontmatter.title || idxItem.title || '';
        const order = Number((frontmatter.order !== undefined ? frontmatter.order : idxItem.order) || 0);
        const author = frontmatter.author || idxItem.author || '';
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : (idxItem.tags || []);
        const excerptSource = frontmatter.excerpt || idxItem.excerpt || '';
        const excerpt = excerptSource || Utils.generateExcerpt(content, CONFIG.BLOG.EXCERPT_MAX_LENGTH);
        const cover = frontmatter.cover || null;
        const coverAlt = frontmatter.coverAlt || '';

        return { id, title, order, author, tags, excerpt, html, cover, coverAlt };
      });

      // Sort posts by order desc; fallback to 0
      posts.sort((a, b) => (Number(b.order) || 0) - (Number(a.order) || 0));

      // Aggregate tags dynamically
      const tagSet = new Set();
      posts.forEach(p => (Array.isArray(p.tags) ? p.tags : []).forEach(t => tagSet.add(t)));
      this.allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

      this.blogPosts = posts;
    } catch (error) {
      Utils.handleError(error, 'loadBlogPosts');
      this.blogPosts = [];
    }
  }

  setupRouting() {
    const handleRoute = () => {
      try {
        const hash = window.location.hash || CONFIG.DEFAULTS.HASH;
        const parts = hash.replace(/^#\//, '').split('/');
        const route = parts[0] || CONFIG.DEFAULTS.PAGE;
        
        if (route === CONFIG.ROUTES.BLOG && parts.length === 2) {
          this.navigateToPage(CONFIG.ROUTES.BLOG_POST, { id: parts[1] });
        } else if (route === CONFIG.ROUTES.BLOG) {
          this.navigateToPage(CONFIG.ROUTES.BLOG);
        } else if (route === CONFIG.ROUTES.CONTACT) {
          this.navigateToPage(CONFIG.ROUTES.CONTACT);
        } else {
          this.navigateToPage(CONFIG.DEFAULTS.PAGE);
        }
      } catch (error) {
        Utils.handleError(error, 'handleRoute');
        this.navigateToPage(CONFIG.DEFAULTS.PAGE);
      }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  navigateToPage(page, params = {}) {
    try {
      this.currentPage = page;
      this.currentParams = params;

      // Reset blog controls when entering blog list page
      if (page === CONFIG.ROUTES.BLOG) {
        this.blogSearchQuery = '';
        this.blogSelectedTag = '';
        this.blogCurrentPageIndex = 0;
        this.tagFilterOpen = false;
      }

      this.render();

      // Always reset scroll to top on page change
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }

      const routes = {
        [CONFIG.ROUTES.HOME]: '#/home',
        [CONFIG.ROUTES.BLOG]: '#/blog',
        [CONFIG.ROUTES.BLOG_POST]: `#/blog/${params.id}`,
        [CONFIG.ROUTES.CONTACT]: '#/contact'
      };
      
      const targetRoute = routes[page];
      if (targetRoute && window.location.hash !== targetRoute) {
        window.location.hash = targetRoute;
      }
    } catch (error) {
      Utils.handleError(error, 'navigateToPage');
    }
  }

  setupEventListeners() {
    try {
      this.setupThemeToggle();
      this.setupMobileMenu();
      this.setupNavigationLinks();
      this.setupGlobalEventListeners();
      this.setupContactForm();
    } catch (error) {
      Utils.handleError(error, 'setupEventListeners');
    }
  }

  // Latest posts (home) interactions: make preview items clickable
  setupLatestPostsInteractions() {
    try {
      const container = document.getElementById('latest-posts-container');
      if (!container || container.__bound) return;

      container.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let links work normally
        const card = e.target.closest('.blog-preview-item');
        if (!card) return;
        const postId = card.getAttribute('data-post-id');
        if (postId) {
          this.navigateToPage(CONFIG.ROUTES.BLOG_POST, { id: postId });
        }
      });

      container.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.blog-preview-item');
        if (!card || !container.contains(card)) return;
        e.preventDefault();
        const postId = card.getAttribute('data-post-id');
        if (postId) {
          this.navigateToPage(CONFIG.ROUTES.BLOG_POST, { id: postId });
        }
      });

      container.__bound = true;
    } catch (error) {
      Utils.handleError(error, 'setupLatestPostsInteractions');
    }
  }

  setupThemeToggle() {
    const themeToggle = Utils.querySelector(CONFIG.SELECTORS.THEME_TOGGLE);
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleDarkMode());
    }
  }

  setupMobileMenu() {
    const hamburgerButton = Utils.querySelector(CONFIG.SELECTORS.HAMBURGER_BUTTON);
    if (hamburgerButton) {
      hamburgerButton.addEventListener('click', () => this.toggleMobileMenu());
    }
  }

  setupNavigationLinks() {
    const navLinks = Utils.querySelectorAll(CONFIG.SELECTORS.NAV_LINKS);
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) {
          this.navigateToPage(view);
        }
      });
    });
  }

  setupGlobalEventListeners() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !e.target.closest(CONFIG.SELECTORS.HAMBURGER_CONTAINER)) {
        this.closeMobileMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.updateHeaderOffset();
    });
  }

  setupContactForm() {
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'contact-form') {
        e.preventDefault();
        this.handleContactSubmit(e);
      }
    });
  }

  // Blog controls: search, dropdown filter, pagination
  setupBlogControls() {
    // Search input (debounced)
    const searchInput = document.getElementById('blog-search-input');
    if (searchInput && !searchInput.__bound) {
      searchInput.value = this.blogSearchQuery;
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.blogSearchQuery = e.target.value || '';
        this.blogCurrentPageIndex = 0;
        this.updateBlogListUI();
      }, 100));
      searchInput.__bound = true;
    }

    // Bind dropdown tag filter events
    this.bindTagFilterEvents();

    // Pagination buttons (delegated on container)
    const paginationEl = document.querySelector('.pagination-controls');
    if (paginationEl && !paginationEl.__bound) {
      paginationEl.addEventListener('click', (e) => {
        const prev = e.target.closest('#blog-prev-page');
        const next = e.target.closest('#blog-next-page');
        const { totalPages } = this.getFilteredPosts();

        if (prev) {
          if (this.blogCurrentPageIndex > 0) {
            this.blogCurrentPageIndex -= 1;
            this.updateBlogListUI();
          }
          return;
        }

        if (next) {
          if (this.blogCurrentPageIndex < totalPages - 1) {
            this.blogCurrentPageIndex += 1;
            this.updateBlogListUI();
          }
          return;
        }
      });
      paginationEl.__bound = true;
    }

    // Make entire blog cards clickable (delegated on grid)
    const gridEl = document.querySelector('.blog-grid');
    if (gridEl && !gridEl.__cardNavBound) {
      gridEl.addEventListener('click', (e) => {
        // Allow default behavior for actual links inside the card
        if (e.target.closest('a')) return;
        const card = e.target.closest('.blog-card');
        if (!card) return;
        const postId = card.getAttribute('data-post-id');
        if (postId) {
          this.navigateToPage(CONFIG.ROUTES.BLOG_POST, { id: postId });
        }
      });

      // Keyboard accessibility: Enter/Space activates card
      gridEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.blog-card');
        if (!card || !gridEl.contains(card)) return;
        e.preventDefault();
        const postId = card.getAttribute('data-post-id');
        if (postId) {
          this.navigateToPage(CONFIG.ROUTES.BLOG_POST, { id: postId });
        }
      });

      gridEl.__cardNavBound = true;
    }
  }

  bindTagFilterEvents() {
    const filterContainer = document.querySelector('.tag-filter');
    const button = document.getElementById('tag-filter-button');
    const menu = document.getElementById('tag-filter-menu');

    if (button && !button.__bound) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.tagFilterOpen = !this.tagFilterOpen;
        this.syncTagFilterOpenState();
      });
      button.__bound = true;
    }

    if (menu) {
      const inputs = menu.querySelectorAll('input[type="radio"][name="tag-filter"][data-tag-option]');
      inputs.forEach(input => {
        if (!input.__bound) {
          input.addEventListener('change', () => {
            const tag = input.getAttribute('data-tag-option') || '';
            this.blogSelectedTag = tag; // single-select
            this.blogCurrentPageIndex = 0;
            this.updateBlogListUI();
          });
          input.__bound = true;
        }
      });
    }

    // Outside click to close dropdown
    if (!this._tagFilterOutsideHandler) {
      this._tagFilterOutsideHandler = (e) => {
        if (!this.tagFilterOpen) return;
        if (!e.target.closest('.tag-filter')) {
          this.tagFilterOpen = false;
          this.syncTagFilterOpenState();
        }
      };
      document.addEventListener('click', this._tagFilterOutsideHandler);
    }

    // Sync open/closed visuals initially
    this.syncTagFilterOpenState();
  }

  syncTagFilterOpenState() {
    const button = document.getElementById('tag-filter-button');
    const menu = document.getElementById('tag-filter-menu');
    if (button) button.setAttribute('aria-expanded', this.tagFilterOpen ? 'true' : 'false');
    if (menu) {
      if (this.tagFilterOpen) {
        menu.classList.add('open');
      } else {
        menu.classList.remove('open');
      }
    }
  }

  getFilteredPosts() {
    // Apply search and tag filters
    const query = (this.blogSearchQuery || '').toLowerCase();
    const selectedTag = this.blogSelectedTag || '';

    let filtered = this.blogPosts.filter(post => {
      const matchesQuery = !query || (
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(query)))
      );
      const matchesTags = !selectedTag || (Array.isArray(post.tags) && post.tags.includes(selectedTag));
      return matchesQuery && matchesTags;
    });

    // Ensure ordering by custom order (desc)
    filtered.sort((a, b) => (Number(b.order) || 0) - (Number(a.order) || 0));

    const perPage = CONFIG.BLOG.POSTS_PER_PAGE;
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const currentPage = Math.min(this.blogCurrentPageIndex, totalPages - 1);
    const start = currentPage * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    return { filtered, totalPages, currentPage, pageItems };
  }

  // Update only the blog list UI without re-rendering entire app
  updateBlogListUI() {
    const { pageItems, totalPages, currentPage, filtered } = this.getFilteredPosts();

    // Update dropdown filter container
    const filterContainer = document.querySelector('.tag-filter');
    if (filterContainer) {
      filterContainer.innerHTML = this.buildTagFilterInnerHtml();
    }

    // Update blog grid
    const grid = document.querySelector('.blog-grid');
    if (grid) {
      grid.innerHTML = pageItems.map(post => this.buildBlogCardHtml(post)).join('');
    }

    // Update pagination
    const pagination = document.querySelector('.pagination-controls');
    if (pagination) {
      pagination.innerHTML = this.buildPaginationInnerHtml(totalPages, currentPage, filtered.length);
      pagination.__bound = false; // rebind events
    }

    // Re-bind events for updated pieces
    this.bindTagFilterEvents();
    this.setupBlogControls();

    // Re-init icons
    this.initializeIcons();
  }

  buildBlogCardHtml(post) {
    return `
      <article class="blog-card" data-post-id="${post.id}" tabindex="0">
        ${post.cover ? `<div class=\"blog-image\"><img src=\"${post.cover}\" alt=\"${Utils.escapeHtml(post.coverAlt || post.title)}\"></div>` : ''}
        <div class="blog-card-content">
          <h2 class="blog-card-title">${Utils.escapeHtml(post.title)}</h2>
          <p class="blog-card-excerpt">${Utils.escapeHtml(post.excerpt)}</p>
          <div class="blog-card-meta">
            <span class="blog-card-author">By ${Utils.escapeHtml(post.author)}</span>
            <div class="blog-card-tags">
              ${post.tags.map(tag => `<span class=\"tag\">${Utils.escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
          <a href="#/blog/${post.id}" class="read-more">Read More</a>
        </div>
      </article>
    `;
  }

  buildTagFilterInnerHtml() {
    const icon = '<span class="nav-icon" data-lucide="filter"></span>';
    const summary = !this.blogSelectedTag ? 'All tags' : this.blogSelectedTag;
    return `
      <button class="filter-button" id="tag-filter-button" aria-expanded="${this.tagFilterOpen ? 'true' : 'false'}">${icon}<span class="filter-summary">${summary}</span></button>
      <div class="filter-menu" id="tag-filter-menu">
        ${this.buildTagFilterMenuHtml()}
      </div>
    `;
  }

  buildTagFilterMenuHtml() {
    if (!this.allTags || this.allTags.length === 0) return '<div class="filter-empty">No tags</div>';
    const items = this.allTags.map(tag => `
      <label class="filter-option">
        <input type="radio" name="tag-filter" data-tag-option="${Utils.escapeHtml(tag)}" ${this.blogSelectedTag === tag ? 'checked' : ''}>
        <span>${Utils.escapeHtml(tag)}</span>
      </label>
    `).join('');
    const allOption = `
      <label class="filter-option">
        <input type="radio" name="tag-filter" data-tag-option="" ${!this.blogSelectedTag ? 'checked' : ''}>
        <span>All tags</span>
      </label>
    `;
    return allOption + items;
  }

  buildTagChipsHtml() {
    return this.allTags.map(tag => `<span class="tag${this.blogSelectedTags.has(tag) ? ' active' : ''}" data-tag-chip="${Utils.escapeHtml(tag)}">${Utils.escapeHtml(tag)}</span>`).join('');
  }

  buildPaginationInnerHtml(totalPages, currentPage, totalResults) {
    return `
      <button id="blog-prev-page" class="btn primary">← Prev</button>
      <div aria-live="polite">Page ${currentPage + 1} of ${totalPages} • ${totalResults} result${totalResults === 1 ? '' : 's'}</div>
      <button id="blog-next-page" class="btn primary">Next →</button>
    `;
  }

  render() {
    try {
      const appContainer = Utils.querySelector(CONFIG.SELECTORS.APP_CONTAINER);
      if (!appContainer) return;

      let content = '';
      
      switch (this.currentPage) {
        case CONFIG.ROUTES.HOME:
          content = this.renderHomeView();
          break;
        case CONFIG.ROUTES.BLOG:
          content = this.renderBlogView();
          break;
        case CONFIG.ROUTES.BLOG_POST:
          content = this.renderBlogPostView(this.currentParams.id);
          break;
        case CONFIG.ROUTES.CONTACT:
          content = this.renderContactView();
          break;
        default:
          content = this.renderHomeView();
      }

      appContainer.innerHTML = content;
      this.updateHeaderOffset();
      this.highlightCodeBlocks();
      this.initializeIcons();

      // Wire blog controls after render
      if (this.currentPage === CONFIG.ROUTES.BLOG) {
        this.setupBlogControls();
      }

      // Wire latest posts interactions on home view
      if (this.currentPage === CONFIG.ROUTES.HOME) {
        this.setupLatestPostsInteractions();
      }
    } catch (error) {
      Utils.handleError(error, 'render');
    }
  }

  highlightCodeBlocks() {
    try {
      if (typeof window !== 'undefined' && window.Prism) {
        const container = document.querySelector('.post-content');
        if (typeof window.Prism.highlightAllUnder === 'function' && container) {
          window.Prism.highlightAllUnder(container);
        } else if (typeof window.Prism.highlightAll === 'function') {
          window.Prism.highlightAll();
        }
      }
    } catch (error) {
      Utils.handleError(error, 'highlightCodeBlocks');
    }
  }

  renderHomeView() {
    return `
      <section class="home-page">
        <div class="main-content-container">
          <!-- Hero container (left side) -->
          <div class="hero-container">
            <div class="hero">
              <h1>Hey, I'm <span class="highlight">Emin</span></h1>
              <h2>Developer | Engineer</h2>
              <h3>Welcome to my space where I share ideas, projects, and things I'm learning.</h3>
              <h3>Software Engineer based in the US🇺🇸</h3>
              
              <div class="divider-line"></div>
              
              <div class="bio-content">
                <p>Software engineer writing about backend systems, data pipelines, and applied artificial intelligence (AI) in real world production.</p>
                <p>I've worked as both freelancer and employee, across backend/frontend, image processing and games, proving I can quickly master any technology or domain, no matter my prior experience.</p>
              </div>
              </div>
              
              <div class="hero-social-links">
                <a href="${CONFIG.SOCIAL_LINKS.GITHUB}" target="_blank" rel="noopener noreferrer" class="social-link">
                  <span class="social-icon" data-lucide="github"></span>
                  <span class="social-name">GitHub</span>
                </a>
                <a href="${CONFIG.SOCIAL_LINKS.LINKEDIN}" target="_blank" rel="noopener noreferrer" class="social-link">
                  <span class="social-icon" data-lucide="linkedin"></span>
                  <span class="social-name">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Profile & AI container (right side) -->
          <div class="profile-ai-container">
            <div class="profile-section">
              <div class="profile-image">
                <img src="assets/me.jpeg" alt="Emin Yorgun">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Latest posts section -->
        <div class="latest-posts">
          <h2>Latest from the Blog</h2>
          <div class="blog-preview" id="latest-posts-container">
            ${this.renderLatestPosts()}
          </div>
        </div>
      </section>
    `;
  }

  renderBlogView() {
    const { pageItems, totalPages, currentPage, filtered } = this.getFilteredPosts();

    return `
      <section class="blog-page">
        <div class="blog-header">
          <h1>Blog</h1>
          <p>Thoughts, tutorials, and insights on technology and development.</p>
        </div>
        
        <div class="blog-controls">
          <div class="search-box">
            <input id="blog-search-input" type="text" placeholder="Search in posts..." value="${Utils.escapeHtml(this.blogSearchQuery)}" />
          </div>
          <div class="category-filter">
            <div class="tag-filter">
              ${this.buildTagFilterInnerHtml()}
            </div>
          </div>
        </div>
        
        <div class="blog-grid">
          ${pageItems.map(post => this.buildBlogCardHtml(post)).join('')}
        </div>

        <div class="pagination-controls" style="display:flex;justify-content:space-between;align-items:center;margin:1.5rem 0;">
          ${this.buildPaginationInnerHtml(totalPages, currentPage, filtered.length)}
        </div>
      </section>
    `;
  }

  renderBlogPostView(postId) {
    const post = this.blogPosts.find(p => p.id == postId);
    if (!post) {
      return `
        <section class="blog-page">
          <div class="error-message">
            <h1>Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <a href="#/blog" class="btn primary">Back to Blog</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="blog-page">
        <article class="blog-post">
          <header class="post-header">
            <h1>${Utils.escapeHtml(post.title)}</h1>
            <div class="post-meta">
              <div class="byline">
                <span class="author">${Utils.escapeHtml(post.author)}</span>
              </div>
              <div class="blog-card-tags">
                ${post.tags.map(tag => `<span class="tag">${Utils.escapeHtml(tag)}</span>`).join('')}
              </div>
            </div>
            ${post.cover ? `<div class="featured-image"><img src="${post.cover}" alt="${Utils.escapeHtml(post.coverAlt || post.title)}"></div>` : ''}
          </header>
          
          <div class="post-content">
            ${post.html}
          </div>
          
          <footer class="post-footer">
            <a href="#/blog" class="btn primary">← Back to Blog</a>
          </footer>
        </article>
      </section>
    `;
  }

  renderContactView() {
    return `
      <section class="contact-page">
        <div class="contact-header">
          <h1>Get in Touch</h1>
          <p>Have a question or want to work together? I'd love to hear from you!</p>
        </div>
        
        <div class="contact-container">
          <div class="contact-info">
            <div class="info-item">
              <span class="contact-icon" data-lucide="mail"></span>
              <span>${CONFIG.CONTACT_INFO.EMAIL}</span>
            </div>
            <div class="info-item">
              <span class="contact-icon" data-lucide="map-pin"></span>
              <span>${CONFIG.CONTACT_INFO.LOCATION}</span>
            </div>
            <div class="info-item">
              <span class="contact-icon" data-lucide="linkedin"></span>
              <a href="${CONFIG.SOCIAL_LINKS.LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            <div class="info-item">
              <span class="contact-icon" data-lucide="github"></span>
              <a href="${CONFIG.SOCIAL_LINKS.GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div class="info-item">
              <span class="contact-icon" data-lucide="instagram"></span>
              <a href="${CONFIG.SOCIAL_LINKS.INSTAGRAM}" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
            <div class="info-item">
              <span class="contact-icon" data-lucide="twitter"></span>
              <a href="${CONFIG.SOCIAL_LINKS.TWITTER}" target="_blank" rel="noopener noreferrer">Twitter/X</a>
            </div>
          </div>
          
          <form class="contact-form" id="contact-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="subject">Subject</label>
              <input type="text" id="subject" name="subject" required>
            </div>
            
            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            
            <button type="submit" class="btn primary">Send Message</button>
          </form>
        </div>
      </section>
    `;
  }

  renderLatestPosts() {
    const latestPosts = [...this.blogPosts]
      .sort((a, b) => (Number(b.order) || 0) - (Number(a.order) || 0))
      .slice(0, CONFIG.BLOG.LATEST_POSTS_COUNT);
    return latestPosts.map(post => `
      <div class="blog-preview-item" data-post-id="${post.id}" tabindex="0">
        <h3>${Utils.escapeHtml(post.title)}</h3>
        <p>${Utils.escapeHtml(post.excerpt)}</p>
        <div class="blog-preview-meta">
          <span class="blog-preview-author">by ${Utils.escapeHtml(post.author)}</span>
        </div>
        <a href="#/blog/${post.id}" class="read-more">Read More</a>
      </div>
    `).join('');
  }

  handleContactSubmit(e) {
    try {
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };
      
      // Validation
      const errors = this.validateContactForm(data);
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        return;
      }
      
      // Simulate form submission
      this.showFormSubmissionState(e.target);
      
      setTimeout(() => {
        this.showSuccessMessage(e.target);
      }, CONFIG.ANIMATION.FORM_SUBMISSION_DELAY);
    } catch (error) {
      Utils.handleError(error, 'handleContactSubmit');
    }
  }

  validateContactForm(data) {
    const errors = {};
    
    if (!Utils.isValidString(data.name)) {
      errors.name = 'Name is required';
    }
    
    if (!Utils.isValidString(data.email) || !Utils.isValidEmail(data.email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!Utils.isValidString(data.subject)) {
      errors.subject = 'Subject is required';
    }
    
    if (!Utils.isValidString(data.message)) {
      errors.message = 'Message is required';
    }
    
    return errors;
  }

  showFormSubmissionState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
    }
  }

  showSuccessMessage(form) {
    if (form) {
      form.innerHTML = `
        <div class="success-message">
          <h2>Thank You!</h2>
          <p>Your message has been sent successfully. I'll get back to you as soon as possible.</p>
          <button class="btn primary" onclick="window.location.reload()">Send Another Message</button>
        </div>
      `;
    }
  }

  toggleDarkMode() {
    try {
      this.darkMode = !this.darkMode;
      const themeToggle = Utils.querySelector(CONFIG.SELECTORS.THEME_TOGGLE);
      this.updateThemeUI(themeToggle);
      // Persist user preference with timestamp
      Utils.setStorageItem(CONFIG.THEME.STORAGE_KEY, this.darkMode ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT);
      Utils.setStorageItem(CONFIG.THEME.PREF_LAST_SET_KEY, String(Date.now()));
    } catch (error) {
      Utils.handleError(error, 'toggleDarkMode');
    }
  }

  updateThemeUI(themeToggle) {
    try {
      const buttonEl = themeToggle || Utils.querySelector(CONFIG.SELECTORS.THEME_TOGGLE);
      if (!buttonEl) return;
      
      if (this.darkMode) {
        document.body.classList.add('dark-mode');
        buttonEl.classList.add('dark');
        buttonEl.classList.remove('light');
      } else {
        document.body.classList.remove('dark-mode');
        buttonEl.classList.add('light');
        buttonEl.classList.remove('dark');
      }

      // Sync Prism theme (light vs dark)
      try {
        const lightPrism = document.getElementById('prism-theme-light');
        const darkPrism = document.getElementById('prism-theme-dark');
        if (lightPrism && darkPrism) {
          // Enable only the active theme
          lightPrism.disabled = this.darkMode;
          darkPrism.disabled = !this.darkMode;
        }
      } catch (e) {
        // Non-fatal; continue
        console.warn('Could not switch Prism theme:', e);
      }
    } catch (error) {
      Utils.handleError(error, 'updateThemeUI');
    }
  }

  updateHeaderOffset() {
    try {
      const headerEl = document.querySelector('header');
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : CONFIG.LAYOUT.HEADER_HEIGHT;
      const totalOffset = Math.max(CONFIG.LAYOUT.MIN_HEADER_OFFSET, Math.round(headerHeight + CONFIG.LAYOUT.EXTRA_HEADER_SPACING));
      document.documentElement.style.setProperty('--header-offset', `${totalOffset}px`);
    } catch (error) {
      Utils.handleError(error, 'updateHeaderOffset');
    }
  }

  openMobileMenu() {
    try {
      this.isMenuOpen = true;
      const hamburgerFlyout = Utils.querySelector(CONFIG.SELECTORS.HAMBURGER_FLYOUT);
      const hamburgerButton = Utils.querySelector(CONFIG.SELECTORS.HAMBURGER_BUTTON);
      
      if (hamburgerFlyout) hamburgerFlyout.classList.add('open');
      if (hamburgerButton) hamburgerButton.classList.add('active');
      document.body.classList.add('menu-open');
    } catch (error) {
      Utils.handleError(error, 'openMobileMenu');
    }
  }

  closeMobileMenu() {
    try {
      this.isMenuOpen = false;
      const hamburgerFlyout = Utils.querySelector(CONFIG.SELECTORS.HAMBURGER_FLYOUT);
      const hamburgerButton = Utils.querySelector(CONFIG.SELECTORS.HAMBURGER_BUTTON);
      
      if (hamburgerFlyout) hamburgerFlyout.classList.remove('open');
      if (hamburgerButton) hamburgerButton.classList.remove('active');
      document.body.classList.remove('menu-open');
    } catch (error) {
      Utils.handleError(error, 'closeMobileMenu');
    }
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  initializeIcons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
        // Add a class to indicate icons are loaded
        document.body.classList.add('icons-loaded');
      } else {
        // If Lucide isn't available, still mark as loaded to prevent hanging
        document.body.classList.add('icons-loaded');
      }
    } catch (error) {
      console.warn('Could not initialize Lucide icons:', error);
      // Mark as loaded even if there's an error
      document.body.classList.add('icons-loaded');
    }
  }

  updateCurrentYear() {
    try {
      const currentYearElement = Utils.querySelector(CONFIG.SELECTORS.CURRENT_YEAR);
      if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
      }
    } catch (error) {
      Utils.handleError(error, 'updateCurrentYear');
    }
  }

  updateSocialLinks() {
    try {
      const map = {
        github: CONFIG.SOCIAL_LINKS.GITHUB,
        linkedin: CONFIG.SOCIAL_LINKS.LINKEDIN,
        twitter: CONFIG.SOCIAL_LINKS.TWITTER,
        instagram: CONFIG.SOCIAL_LINKS.INSTAGRAM
      };
      const links = document.querySelectorAll('[data-social]');
      links.forEach((el) => {
        const key = el.getAttribute('data-social');
        const href = map[key];
        if (href) {
          el.setAttribute('href', href);
        } else {
          el.removeAttribute('href');
        }
      });
    } catch (error) {
      Utils.handleError(error, 'updateSocialLinks');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new App();
    window.app.init();
    
    // Fallback: ensure icons are marked as loaded after a reasonable timeout
    setTimeout(() => {
      if (!document.body.classList.contains('icons-loaded')) {
        document.body.classList.add('icons-loaded');
      }
    }, 1000); // 1 second fallback
  } catch (error) {
    Utils.handleError(error, 'App initialization');
  }
});
