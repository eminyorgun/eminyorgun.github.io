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
    
    if (savedTheme === CONFIG.THEME.DARK) {
      this.darkMode = true;
    } else if (savedTheme === CONFIG.THEME.LIGHT) {
      this.darkMode = false;
    } else {
      this.darkMode = this.shouldUseDarkTheme();
    }
    
    this.updateThemeUI();
  }

  shouldUseDarkTheme() {
    if (!Utils.isWindowAvailable()) return false;
    
    try {
      const hour = new Date().getHours();
      return hour >= CONFIG.THEME.NIGHT_START_HOUR || hour < CONFIG.THEME.NIGHT_END_HOUR;
    } catch (error) {
      Utils.handleError(error, 'shouldUseDarkTheme');
      return false;
    }
  }

  initializeState() {
    this.currentPage = CONFIG.DEFAULTS.PAGE;
    this.currentParams = {};
    this.blogPosts = [];
    this.isMenuOpen = false;
  }

  async init() {
    try {
      await this.loadBlogPosts();
      this.setupRouting();
      this.setupEventListeners();
      this.render();
      this.initializeIcons();
      this.updateThemeUI();
      this.updateCurrentYear();
    } catch (error) {
      Utils.handleError(error, 'init');
    }
  }

  async loadBlogPosts() {
    try {
      const response = await fetch('data/posts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.blogPosts = await response.json();
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
      this.render();

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
      this.initializeIcons();
    } catch (error) {
      Utils.handleError(error, 'render');
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
              <h2>Developer | Engineer | Learner</h2>
              <h3>Welcome to my space where I share ideas, projects, and things I'm learning.</h3>
              <h3>Software Engineer based in 🇺🇸</h3>
              
              <div class="divider-line"></div>
              
              <div class="bio-content">
                <p>I build with Java, Python, C++, React, Go, and more. This site is my digital notebook for projects and insights in AI, computer vision, game dev, and beyond.</p>
                <p>I've worked as both freelancer and employee, across backend/frontend, image processing, OCR, and puzzle games—proving I can quickly master any technology or domain, no matter my prior experience. I tackle unfamiliar challenges with confidence and deliver quality results.</p>
                <p>Outside coding, I play multiple instruments, hike, fish, birdwatch, and play chess. I'm also a Mechatronics Engineer who believes in lifelong learning and sharing knowledge.</p>
                <p>I hold a Mechatronics Engineering degree</p>
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
            
            <div class="ai-search-section">
              <div class="search-box">
                <input type="text" id="ai-search-input" name="ai-search-input" placeholder="Ask about Me to my AI assistant!" class="ai-search-input">
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
    return `
      <section class="blog-page">
        <div class="blog-header">
          <h1>Blog</h1>
          <p>Thoughts, tutorials, and insights on technology and development.</p>
        </div>
        
        <div class="blog-grid">
          ${this.blogPosts.map(post => `
            <article class="blog-card" data-post-id="${post.id}">
              <div class="blog-card-content">
                <h2 class="blog-card-title">${Utils.escapeHtml(post.title)}</h2>
                <p class="blog-card-excerpt">${Utils.escapeHtml(post.excerpt)}</p>
                <div class="blog-card-meta">
                  <span class="blog-card-date">${Utils.escapeHtml(post.date)}</span>
                  <span class="blog-card-author">By ${Utils.escapeHtml(post.author)}</span>
                  <div class="blog-card-tags">
                    ${post.tags.map(tag => `<span class="tag">${Utils.escapeHtml(tag)}</span>`).join('')}
                  </div>
                </div>
                <a href="#/blog/${post.id}" class="read-more">Read More</a>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  renderBlogPostView(postId) {
    const post = this.blogPosts.find(p => p.id == postId);
    if (!post) {
      return `
        <section class="blog-post-page">
          <div class="error-message">
            <h1>Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist.</p>
            <a href="#/blog" class="btn primary">Back to Blog</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="blog-post-page">
        <article class="blog-post">
          <header class="blog-post-header">
            <h1>${Utils.escapeHtml(post.title)}</h1>
            <div class="blog-post-meta">
              <span class="blog-post-date">${Utils.escapeHtml(post.date)}</span>
              <div class="blog-post-tags">
                ${post.tags.map(tag => `<span class="tag">${Utils.escapeHtml(tag)}</span>`).join('')}
              </div>
            </div>
          </header>
          
          <div class="blog-post-content">
            ${post.html}
          </div>
          
          <footer class="blog-post-footer">
            <a href="#/blog" class="btn secondary">← Back to Blog</a>
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
    const latestPosts = this.blogPosts.slice(0, CONFIG.BLOG.LATEST_POSTS_COUNT);
    return latestPosts.map(post => `
      <div class="blog-preview-item">
        <h3>${Utils.escapeHtml(post.title)}</h3>
        <p>${Utils.escapeHtml(post.excerpt)}</p>
        <div class="blog-preview-meta">
          <span class="blog-preview-date">${Utils.escapeHtml(post.date)}</span>
          <span class="blog-preview-author">By ${Utils.escapeHtml(post.author)}</span>
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
      Utils.setStorageItem(CONFIG.THEME.STORAGE_KEY, this.darkMode ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT);
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
      }
    } catch (error) {
      console.warn('Could not initialize Lucide icons:', error);
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


}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new App();
    window.app.init();
  } catch (error) {
    Utils.handleError(error, 'App initialization');
  }
});
