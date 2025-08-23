// App.js - Main vanilla JavaScript application for traditional HTML structure
class App {
  constructor() {
    try {
      console.log('App constructor started...');
      
      // Initialize theme: use saved preference, otherwise default based on local time (night => dark)
      const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
      if (savedTheme === 'dark') {
        this.darkMode = true;
      } else if (savedTheme === 'light') {
        this.darkMode = false;
      } else {
        const hour = new Date().getHours();
        const isNight = hour >= 19 || hour < 7; // 7pm–7am considered night
        this.darkMode = isNight;
      }
      
      console.log('App constructor completed, darkMode:', this.darkMode);
    } catch (error) {
      console.error('Error in App constructor:', error);
      throw error;
    }
    
    // Centralized blog data used across list and post pages
    this.blogPosts = [
      {
        id: 1,
        title: "Building Modern Web Apps with Vanilla JavaScript",
        date: "February 20, 2025",
        author: "Your Name",
        excerpt: "Learn how to build powerful web applications using only vanilla JavaScript, HTML, and CSS.",
        categories: ["JavaScript", "Web Development", "Frontend"],
        content: `
          <p>Modern web development doesn't always require frameworks. In this post, we'll explore how to build robust web applications using only vanilla JavaScript, HTML, and CSS.</p>
          <h2>Why Vanilla JavaScript?</h2>
          <p>Vanilla JavaScript gives you full control over your code, smaller bundle sizes, and no framework dependencies. It's perfect for learning fundamentals and building lightweight applications.</p>
          <h2>Class-Based Architecture</h2>
          <p>Using ES6 classes, we can create well-structured applications with clear separation of concerns.</p>
          <pre><code class="language-javascript">class App {
  constructor() {
    this.currentPage = 'home';
    this.darkMode = false;
    this.init();
  }
  
  init() {
    this.setupRouting();
    this.render();
  }
}</code></pre>
          <p>This approach keeps our code organized and maintainable without external dependencies.</p>
          <h2>Event-Driven Development</h2>
          <p>Vanilla JavaScript excels at handling user interactions through event listeners and DOM manipulation.</p>
          <h2>State Management</h2>
          <p>Simple state management can be achieved with class properties and methods, making it easy to track application state.</p>
          <p>Stay tuned for our next post where we'll explore advanced vanilla JavaScript patterns and techniques!</p>
        `
      },
      {
        id: 2,
        title: "The Future of Web Design: Trends to Watch",
        date: "February 15, 2025",
        author: "Your Name",
        excerpt: "Explore upcoming web design trends that will shape the digital landscape in the coming year.",
        categories: ["Design", "UI/UX", "Trends"],
        content: `
          <p>Web design is constantly evolving, with new trends emerging each year. In this post, we'll explore some of the most exciting web design trends to watch in the coming months.</p>
          <h2>1. Dark Mode Everything</h2>
          <p>Dark mode has gained significant popularity across applications and websites. It not only looks sleek but also helps reduce eye strain and save battery life on OLED screens.</p>
          <h2>2. 3D Elements and Illustrations</h2>
          <p>As browsers become more powerful, we're seeing an increase in 3D elements and illustrations that add depth and interactivity to websites.</p>
          <h2>3. Micro-interactions</h2>
          <p>Small, subtle animations that provide feedback to users are becoming increasingly important in creating engaging user experiences.</p>
          <h2>4. Voice User Interface (VUI)</h2>
          <p>With the rise of smart speakers and voice assistants, designing for voice interactions is becoming a crucial skill for web designers.</p>
          <h2>5. Minimalism and Whitespace</h2>
          <p>The trend toward simplicity continues, with clean layouts and strategic use of whitespace helping to improve readability and focus.</p>
          <p>What design trends are you most excited about? Let us know in the comments!</p>
        `
      },
      {
        id: 3,
        title: "Zero‑Dependency SPA: Hash Routing, Dynamic Layout, and CSS‑Variable Theming",
        date: "August 21, 2025",
        author: "Your Name",
        excerpt: "Build modern UX without frameworks: hash routing, CSS‑variable theming, and a slick flyout menu—just vanilla JS and CSS.",
        categories: ["JavaScript", "CSS", "SPA", "Web Development"],
        image: "/placeholder-blog-3.jpg",
        content: `
          <p>Modern UX without frameworks? This personal site is a single-file JavaScript app that delivers multi-page navigation, dark/light theming, and a mobile flyout menu—entirely with vanilla JS and CSS. Here's how the core pieces fit together and a few implementation patterns you can reuse.</p>

          <h2>Hash routing that stays simple</h2>
          <p>Client-side navigation is powered by a tiny hash router. It supports deep linking like <code>#/blog/2</code>, gracefully falls back to <code>home</code>, and keeps UI state in sync when the hash changes.</p>
          <pre><code class="language-javascript">setupRouting() {
  const handleRoute = () => {
    const hash = window.location.hash || '#/home';
    const parts = hash.replace(/^#\//, '').split('/');
    const route = parts[0] || 'home';
    if (route === 'blog' && parts.length === 2) {
      this.navigateToPage('blogPost', { id: parts[1] });
    } else if (route === 'blog') {
      this.navigateToPage('blog');
    } else if (route === 'contact') {
      this.navigateToPage('contact');
    } else {
      this.navigateToPage('home');
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}</code></pre>

          <p>Navigation updates the hash only when needed, keeping the back button intuitive.</p>
          <pre><code class="language-javascript">navigateToPage(page, params = {}) {
  this.currentPage = page;
  this.currentParams = params;
  this.render();

  const routes = {
    'home': '#/home',
    'blog': '#/blog',
    'blogPost': \`#/blog/\${params.id}\`,
    'contact': '#/contact'
  };
  if (routes[page]) {
    if (window.location.hash !== routes[page]) {
      window.location.hash = routes[page];
    }
  }
}</code></pre>

          <h2>Dynamic header offset via a CSS variable</h2>
          <p>Fixed headers often cause layout shifts or hardcoded spacing. This app measures the actual header height on render and sets a global CSS variable so <code>main</code> can pad itself correctly—no magic numbers.</p>
          <pre><code class="language-javascript">updateHeaderOffset() {
  const headerEl = document.querySelector('header');
  const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 72;
  const desiredExtra = 16;
  const totalOffset = Math.max(48, Math.round(headerHeight + desiredExtra));
  document.documentElement.style.setProperty('--header-offset', \`\${totalOffset}px\`);
}</code></pre>
          <pre><code class="language-css">main {
  flex: 1;
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding-x) 2rem;
  padding-top: var(--header-offset);
}</code></pre>

          <h2>CSS‑variables first theming with a tactile toggle</h2>
          <p>Theme state is stored and restored from <code>localStorage</code>, with a time-based default. A single <code>dark-mode</code> class flips your entire palette through CSS custom properties; the toggle animates the thumb and icons for delightful feedback.</p>
          <pre><code class="language-javascript">toggleDarkMode() {
  this.darkMode = !this.darkMode;
  const themeToggle = document.querySelector('.theme-toggle');
  this.updateThemeUI(themeToggle);
  try {
    window.localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  } catch (_) {}
}

updateThemeUI(themeToggle) {
  const buttonEl = themeToggle || document.querySelector('.theme-toggle');
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
}</code></pre>
          <pre><code class="language-css">:root {
  --primary-color: #2C5AA0;
  --secondary-color: #D4AF37;
  --accent-color: #4A90E2;
  --accent-secondary: #B8860B;
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --glass-effect: rgba(255, 255, 255, 0.15);
  --glass-border: 1px solid rgba(44, 90, 160, 0.2);
  --shadow-md: 0 4px 12px rgba(44, 90, 160, 0.15);
  --container-max-width: 1400px;
  --container-padding-x: 128px;
  --header-offset: 72px;
}</code></pre>
          <pre><code class="language-css">.dark-mode {
  --text-primary: #F8F8F8;
  --text-secondary: #E0E0D6;
  --bg-primary: #101A2B;
  --bg-secondary: #18243A;
  --bg-tertiary: #222F47;
  --glass-effect: rgba(16, 26, 43, 0.92);
  --glass-border: 1px solid rgba(212, 175, 55, 0.25);
  --shadow-md: 0 4px 12px rgba(16, 26, 43, 0.5);
}</code></pre>

          <h2>A flyout hamburger that lives on the header line</h2>
          <p>Instead of a full-screen drawer, the mobile menu "flies out" inline with the header, with the hamburger morphing to an X and the links revealing in a staggered animation.</p>
          <pre><code class="language-javascript">const hamburgerButton = document.createElement('button');
hamburgerButton.className = 'hamburger-button';
hamburgerButton.setAttribute('aria-label', 'Menu');
hamburgerButton.setAttribute('aria-expanded', 'false');
hamburgerButton.innerHTML = \`
  <span class="hamburger-lines">
    <span class="line line1"></span>
    <span class="line line2"></span>
    <span class="line line3"></span>
  </span>
\`;
hamburgerButton.addEventListener('click', (e) => {
  e.preventDefault();
  this.toggleMobileMenu();
  hamburgerButton.setAttribute('aria-expanded', String(this.isMenuOpen));
});</code></pre>
          <pre><code class="language-javascript">const flyout = document.createElement('div');
flyout.className = 'hamburger-flyout';
const flyoutList = document.createElement('ul');
navItems.forEach((item, index) => {
  const li = document.createElement('li');
  li.style.setProperty('--item-index', String(index));
  const a = document.createElement('a');
  a.className = 'nav-link';
  a.href = \`#\/\${item.page}\`;
  a.innerHTML = \`<span class=\"nav-icon\" data-lucide=\"\${item.icon}\"></span><span class=\"nav-text\">\${item.text}<\/span>\`;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    this.navigateToPage(item.page);
    this.closeMobileMenu();
  });
  li.appendChild(a);
  flyoutList.appendChild(li);
});
flyout.appendChild(flyoutList);
this.hamburgerFlyoutEl = flyout;
this.hamburgerButtonEl = hamburgerButton;</code></pre>
          <pre><code class="language-javascript">openMobileMenu() {
  this.isMenuOpen = true;
  if (this.hamburgerFlyoutEl) this.hamburgerFlyoutEl.classList.add('open');
  if (this.hamburgerButtonEl) this.hamburgerButtonEl.classList.add('active');
  document.body.classList.add('menu-open');
}

closeMobileMenu() {
  this.isMenuOpen = false;
  if (this.hamburgerFlyoutEl) this.hamburgerFlyoutEl.classList.remove('open');
  if (this.hamburgerButtonEl) this.hamburgerButtonEl.classList.remove('active');
  document.body.classList.remove('menu-open');
}

toggleMobileMenu() {
  if (this.isMenuOpen) {
    this.closeMobileMenu();
  } else {
    this.openMobileMenu();
  }
}</code></pre>
          <pre><code class="language-css">.hamburger-container { grid-column: 1; justify-self: start; display: none; align-items: center; position: relative; }
.hamburger-button { width: 40px; height: 40px; border: none; background: transparent; display: none; align-items: center; justify-content: center; position: relative; z-index: 1301; }
.hamburger-lines { position: relative; width: 24px; height: 18px; display: inline-block; }
.hamburger-lines .line { position: absolute; left: 0; width: 100%; height: 2px; background-color: var(--text-primary); transition: transform 0.3s ease, opacity 0.2s ease, background-color 0.3s ease; }
.hamburger-lines .line1 { top: 0; }
.hamburger-lines .line2 { top: 8px; }
.hamburger-lines .line3 { top: 16px; }
.hamburger-button.active .line1 { transform: translateY(8px) rotate(45deg); }
.hamburger-button.active .line2 { opacity: 0; }
.hamburger-button.active .line3 { transform: translateY(-8px) rotate(-45deg); }

.hamburger-flyout { position: absolute; top: 50%; left: 56px; transform: translateY(-50%); pointer-events: none; z-index: 1200; }
.hamburger-flyout.open { pointer-events: auto; }
.hamburger-flyout ul { display: flex; flex-direction: row; gap: 1.25rem; align-items: center; }
.hamburger-flyout li { transform-origin: left center; transform: translateX(-8px); opacity: 0; transition: transform 220ms ease, opacity 180ms ease; }
.hamburger-flyout.open li { pointer-events: auto; transform: translateX(0); opacity: 1; }
.hamburger-flyout.open li:nth-child(1) { transition-delay: 40ms; }
.hamburger-flyout.open li:nth-child(2) { transition-delay: 80ms; }
.hamburger-flyout li:nth-child(3) { transition-delay: 120ms; }</code></pre>

          <h2>Search and filter UX with clickable category tags</h2>
          <p>The blog page wires up search and category filtering with minimal code. Category tags act as filters you can jump to with a single tap.</p>
          <pre><code class="language-javascript">setupBlogEventListeners() {
  if (this.blogSearchInput && this.categoryFilterSelect) {
    this.blogSearchInput.addEventListener('input', () => this.filterBlogPosts());
    this.categoryFilterSelect.addEventListener('change', () => this.filterBlogPosts());
    this.filterBlogPosts();
  }
}</code></pre>
          <pre><code class="language-javascript">filterBlogPosts() {
  const searchTerm = this.blogSearchInput.value.toLowerCase();
  const category = this.categoryFilterSelect.value;

  const filteredPosts = this.blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                          post.excerpt.toLowerCase().includes(searchTerm);
    const matchesCategory = category === '' || post.categories.includes(category);
    return matchesSearch && matchesCategory;
  });

  this.renderBlogPosts(filteredPosts);
}</code></pre>
          <pre><code class="language-javascript">const blogCategories = document.createElement('div');
blogCategories.className = 'blog-categories';
post.categories.forEach(cat => {
  const categoryTag = document.createElement('span');
  categoryTag.className = 'category-tag';
  categoryTag.textContent = cat;
  categoryTag.addEventListener('click', () => {
    this.categoryFilterSelect.value = cat;
    this.filterBlogPosts();
  });
  blogCategories.appendChild(categoryTag);
});</code></pre>

          <h2>Small dev ergonomics that matter</h2>
          <p>During development, the site proactively unregisters any service workers and clears caches to avoid confusing stale assets—a common gotcha with static hosts.</p>
          <pre><code class="language-markup">&lt;script&gt;
// Aggressively remove any service workers and caches in dev
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs){
    regs.forEach(function(r){ r.unregister(); });
  });
}
if (window.caches && caches.keys) {
  caches.keys().then(function(keys){ keys.forEach(function(k){ caches.delete(k); }); });
}
&lt;/script&gt;</code></pre>

          <h2>Takeaways</h2>
          <ul>
            <li>Build a robust SPA without frameworks by pairing hash routing with DOM-rendered pages.</li>
            <li>Use measured layout + CSS variables to eliminate header overlap and magic spacing.</li>
            <li>Theme your entire site by flipping a single class and letting CSS variables cascade.</li>
            <li>Prefer subtle, inline mobile navs when a full-screen drawer is overkill.</li>
            <li>Tiny UX touches—animated toggles, staggered links—add polish without bloat.</li>
          </ul>

          <p><strong>Short social blurb</strong> — Building a zero‑dependency SPA: hash routing, CSS‑variable theming, and a slick flyout menu—no frameworks, just modern JS + CSS. Code + patterns inside.</p>
        `
      }
    ];
    
    this.isMenuOpen = false;
    this.hamburgerFlyoutEl = null;
    this.hamburgerButtonEl = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPageSpecificFunctionality();
    this.updateHeaderOffset();
    
    // Initialize Lucide icons
    this.initializeIcons();
  }

  setupEventListeners() {
    // Theme toggle event listener
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
    // Sync initial UI with current darkMode state
    this.updateThemeUI(themeToggle);

    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDarkMode();
      });
    }

    // Mobile menu event listeners
    const hamburgerButton = document.querySelector('.hamburger-button');
    const hamburgerFlyout = document.querySelector('.hamburger-flyout');
    
    if (hamburgerButton) {
      // Store references for toggling across renders
    this.hamburgerButtonEl = hamburgerButton;
      this.hamburgerFlyoutEl = hamburgerFlyout;
      
      hamburgerButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
        hamburgerButton.setAttribute('aria-expanded', String(this.isMenuOpen));
      });
    }

    // Update current year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  }

  setupPageSpecificFunctionality() {
    // Get current page from URL path
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'home':
        this.setupHomePage();
        break;
      case 'blog':
        this.setupBlogPage();
        break;
      case 'blog-post':
        this.setupBlogPostPage();
        break;
      case 'contact':
        this.setupContactPage();
        break;
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('blog.html')) {
      return 'blog';
    } else if (path.includes('contact.html')) {
      return 'contact';
    } else if (path.includes('home.html') || path === '/' || path === '') {
      return 'home';
    } else if (path.includes('blog-post')) {
      return 'blog-post';
    }
    return 'home';
  }

  setupHomePage() {
    // Populate latest posts section
    const latestPostsContainer = document.getElementById('latest-posts-container');
    if (latestPostsContainer) {
      this.renderLatestPosts(latestPostsContainer);
    }
  }

  setupBlogPage() {
    // Populate category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      this.populateCategoryFilter(categoryFilter);
    }

    // Render all blog posts
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid) {
      this.renderBlogPosts(this.blogPosts);
    }

    // Set up search and filter event listeners
    this.setupBlogEventListeners();
  }

  setupBlogPostPage() {
    // Get post ID from URL or create a default post view
    const postId = this.getPostIdFromURL();
    if (postId) {
      this.renderBlogPost(postId);
    }
  }

  setupContactPage() {
    // Set up contact form event listeners
    this.setupContactEventListeners();
  }

  getPostIdFromURL() {
    // Extract post ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 1; // Default to first post
  }

  renderLatestPosts(container) {
    container.innerHTML = '';
    
    this.blogPosts.slice(0, 2).forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      
      const h3 = document.createElement('h3');
      h3.textContent = post.title;
      
      const date = document.createElement('p');
      date.className = 'date';
      date.textContent = post.date;
      
      const content = document.createElement('p');
      content.textContent = post.excerpt;

      // Make entire card clickable (with keyboard support)
      postCard.setAttribute('role', 'link');
      postCard.setAttribute('tabindex', '0');
      postCard.addEventListener('click', () => {
        window.location.href = `blog-post.html?id=${post.id}`;
      });
      postCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = `blog-post.html?id=${post.id}`;
        }
      });
      
      postCard.appendChild(h3);
      postCard.appendChild(date);
      postCard.appendChild(content);
      container.appendChild(postCard);
    });
  }

  populateCategoryFilter(select) {
    const categories = Array.from(new Set(this.blogPosts.flatMap(p => p.categories))).sort();
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  }

  setupBlogEventListeners() {
    const searchInput = document.getElementById('blog-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput && categoryFilter) {
      searchInput.addEventListener('input', () => this.filterBlogPosts());
      categoryFilter.addEventListener('change', () => this.filterBlogPosts());
    }
  }

  filterBlogPosts() {
    const searchInput = document.getElementById('blog-search');
    const categoryFilter = document.getElementById('category-filter');
    const blogGrid = document.getElementById('blog-grid');
    
    if (!searchInput || !categoryFilter || !blogGrid) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filteredPosts = this.blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                            post.excerpt.toLowerCase().includes(searchTerm);
      const matchesCategory = category === '' || post.categories.includes(category);
      return matchesSearch && matchesCategory;
    });
    
    this.renderBlogPosts(filteredPosts);
  }

  renderBlogPosts(posts) {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;
    
    blogGrid.innerHTML = '';
    
    if (posts.length === 0) {
      const noPosts = document.createElement('div');
      noPosts.className = 'no-posts';
      
      const p = document.createElement('p');
      p.textContent = 'No blog posts found. Try adjusting your search or category filter.';
      
      noPosts.appendChild(p);
      blogGrid.appendChild(noPosts);
      return;
    }
    
    posts.forEach(post => {
      const article = document.createElement('article');
      article.className = 'blog-card';
      article.setAttribute('role', 'link');
      article.setAttribute('tabindex', '0');
      article.addEventListener('click', () => {
        window.location.href = `blog-post.html?id=${post.id}`;
      });
      article.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = `blog-post.html?id=${post.id}`;
        }
      });
      
      const blogContent = document.createElement('div');
      blogContent.className = 'blog-content';
      
      const blogCategories = document.createElement('div');
      blogCategories.className = 'blog-categories';
      
      post.categories.forEach(cat => {
        const categoryTag = document.createElement('span');
        categoryTag.className = 'category-tag';
        categoryTag.textContent = cat;
        categoryTag.addEventListener('click', (e) => {
          e.stopPropagation();
          const categoryFilter = document.getElementById('category-filter');
          if (categoryFilter) {
            categoryFilter.value = cat;
            this.filterBlogPosts();
          }
        });
        categoryTag.addEventListener('keydown', (e) => {
          // Prevent card activation when focusing tag and pressing Enter/Space
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
          }
        });
        blogCategories.appendChild(categoryTag);
      });
      
      const h2 = document.createElement('h2');
      h2.textContent = post.title;
      
      const blogDate = document.createElement('p');
      blogDate.className = 'blog-date';
      blogDate.textContent = post.date;
      
      const blogExcerpt = document.createElement('p');
      blogExcerpt.className = 'blog-excerpt';
      blogExcerpt.textContent = post.excerpt;
      
      blogContent.appendChild(blogCategories);
      blogContent.appendChild(h2);
      blogContent.appendChild(blogDate);
      blogContent.appendChild(blogExcerpt);
      
      article.appendChild(blogContent);
      blogGrid.appendChild(article);
    });
  }

  renderBlogPost(postId) {
    const container = document.getElementById('blog-post-content');
    if (!container) return;
    
    const post = this.blogPosts.find(p => String(p.id) === String(postId));
    
    if (!post) {
      container.innerHTML = `
        <div class="not-found">
          <h1>Blog Post Not Found</h1>
          <p>Sorry, the blog post you're looking for doesn't exist.</p>
          <button class="btn primary" onclick="window.location.href='blog.html'">Back to Blog</button>
        </div>
      `;
      return;
    }
    
    const postHeader = document.createElement('div');
    postHeader.className = 'post-header';
    
    const backLink = document.createElement('a');
    backLink.href = 'blog.html';
    backLink.className = 'back-link';
    backLink.textContent = '← Back to All Posts';
    
    const h1 = document.createElement('h1');
    h1.textContent = post.title;
    
    const postMeta = document.createElement('div');
    postMeta.className = 'post-meta';
    
    const postDate = document.createElement('span');
    postDate.className = 'post-date';
    postDate.textContent = post.date;
    
    const postAuthor = document.createElement('span');
    postAuthor.className = 'post-author';
    postAuthor.textContent = `By ${post.author}`;
    
    postMeta.appendChild(postDate);
    postMeta.appendChild(postAuthor);
    
    const postCategories = document.createElement('div');
    postCategories.className = 'post-categories';
    
    post.categories.forEach(category => {
      const categoryTag = document.createElement('span');
      categoryTag.className = 'category-tag';
      categoryTag.textContent = category;
      postCategories.appendChild(categoryTag);
    });
    
    postHeader.appendChild(backLink);
    postHeader.appendChild(h1);
    postHeader.appendChild(postMeta);
    postHeader.appendChild(postCategories);
    
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    postContent.innerHTML = post.content;
    
    // Ensure legacy code blocks (without language classes) are prepared for Prism
    this.ensureCodeBlockLanguages(postContent);
    
    // Highlight with Prism
    if (window.Prism && typeof window.Prism.highlightAllUnder === 'function') {
      window.Prism.highlightAllUnder(postContent);
    }
    
    const postFooter = document.createElement('div');
    postFooter.className = 'post-footer';
    
    const shareButtons = document.createElement('div');
    shareButtons.className = 'share-buttons';
    
    const shareH3 = document.createElement('h3');
    shareH3.textContent = 'Share this post';
    
    const socialButtons = document.createElement('div');
    socialButtons.className = 'social-buttons';
    
    const socialPlatforms = ['Twitter', 'Facebook', 'LinkedIn'];
    socialPlatforms.forEach(platform => {
      const button = document.createElement('button');
      button.className = `btn ${platform.toLowerCase()}`;
      button.textContent = platform;
      socialButtons.appendChild(button);
    });
    
    shareButtons.appendChild(shareH3);
    shareButtons.appendChild(socialButtons);
    
    const postNavigation = document.createElement('div');
    postNavigation.className = 'post-navigation';
    
    if (parseInt(postId) > 1) {
      const prevPost = document.createElement('a');
      prevPost.href = `blog-post.html?id=${parseInt(postId) - 1}`;
      prevPost.className = 'prev-post';
      prevPost.textContent = '← Previous Post';
      postNavigation.appendChild(prevPost);
    }
    
    if (parseInt(postId) < this.blogPosts.length) {
      const nextPost = document.createElement('a');
      nextPost.href = `blog-post.html?id=${parseInt(postId) + 1}`;
      nextPost.className = 'next-post';
      nextPost.textContent = 'Next Post →';
      postNavigation.appendChild(nextPost);
    }
    
    postFooter.appendChild(shareButtons);
    postFooter.appendChild(postNavigation);
    
    container.appendChild(postHeader);
    container.appendChild(postContent);
    container.appendChild(postFooter);
  }

  ensureCodeBlockLanguages(containerEl) {
    if (!containerEl) return;
    const pres = Array.from(containerEl.querySelectorAll('pre'));
    pres.forEach((pre) => {
      let codeEl = pre.querySelector('code');
      if (!codeEl) {
        const raw = pre.textContent || '';
        codeEl = document.createElement('code');
        codeEl.textContent = raw;
        pre.textContent = '';
        pre.appendChild(codeEl);
      }
      const hasLanguage = Array.from(codeEl.classList).some((c) => c.startsWith('language-'));
      if (!hasLanguage) {
        const raw = (codeEl.textContent || '').trim();
        const lang = (/^</.test(raw) || /&lt;/.test(raw)) ? 'markup' : 'javascript';
        codeEl.classList.add(`language-${lang}`);
      }
    });
  }

  setupContactEventListeners() {
    const contactForm = document.getElementById('contact-form-element');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }
  }

  handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Simple validation
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.email.trim()) errors.email = 'Email is required';
    if (!data.subject.trim()) errors.subject = 'Subject is required';
    if (!data.message.trim()) errors.message = 'Message is required';
    
    if (Object.keys(errors).length > 0) {
      // Show errors (you can implement error display)
      console.log('Validation errors:', errors);
      return;
    }
    
    // Simulate form submission
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
      console.log('Form submitted:', data);
      
      // Show success message
      const contactForm = document.getElementById('contact-form');
      contactForm.innerHTML = `
        <div class="success-message">
          <h2>Thank You!</h2>
          <p>Your message has been sent successfully. I'll get back to you as soon as possible.</p>
          <button class="btn primary" onclick="window.location.reload()">Send Another Message</button>
        </div>
      `;
    }, 1500);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const themeToggle = document.querySelector('.theme-toggle');
    this.updateThemeUI(themeToggle);
    try {
      window.localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    } catch (_) {}
  }

  updateThemeUI(themeToggle) {
    const buttonEl = themeToggle || document.querySelector('.theme-toggle');
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
  }

  updateHeaderOffset() {
    const headerEl = document.querySelector('header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 72;
    const desiredExtra = 16; // small breathing room below header
    const totalOffset = Math.max(48, Math.round(headerHeight + desiredExtra));
    document.documentElement.style.setProperty('--header-offset', `${totalOffset}px`);
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    if (this.hamburgerFlyoutEl) this.hamburgerFlyoutEl.classList.add('open');
    if (this.hamburgerButtonEl) this.hamburgerButtonEl.classList.add('active');
    document.body.classList.add('menu-open');
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    if (this.hamburgerFlyoutEl) this.hamburgerFlyoutEl.classList.remove('open');
    if (this.hamburgerButtonEl) this.hamburgerButtonEl.classList.remove('active');
    document.body.classList.remove('menu-open');
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
