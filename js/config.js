// Configuration file - Centralized constants and settings

const CONFIG = {
  // Application metadata
  APP: {
    NAME: 'Personal Portfolio',
    AUTHOR: 'Emin Yorgun',
    VERSION: '1.0.0',
    DESCRIPTION: 'Personal portfolio and blog website built with vanilla JavaScript'
  },

  // Layout constants
  LAYOUT: {
    HEADER_HEIGHT: 72,
    MIN_HEADER_OFFSET: 48,
    EXTRA_HEADER_SPACING: 16,
    CONTAINER_MAX_WIDTH: 1400,
    CONTAINER_PADDING_X: 128,
    PROFILE_IMAGE_BORDER_WIDTH: 3,
    MOBILE_BREAKPOINT: 768,
    SMALL_MOBILE_BREAKPOINT: 480
  },

  // Theme constants
  THEME: {
    STORAGE_KEY: 'theme',
    DARK: 'dark',
    LIGHT: 'light',
    NIGHT_START_HOUR: 19,
    NIGHT_END_HOUR: 7
  },

  // Animation constants
  ANIMATION: {
    MENU_DELAY: 40,
    FORM_SUBMISSION_DELAY: 1500,
    TRANSITION_DURATION: 200,
    HOVER_TRANSFORM_Y: -2,
    HOVER_TRANSFORM_Y_LARGE: -10,
    HOVER_TRANSFORM_Y_SMALL: -5
  },

  // Default values
  DEFAULTS: {
    PAGE: 'home',
    HASH: '#/home',
    LATEST_POSTS_COUNT: 3,
    POSTS_PER_PAGE: 10
  },

  // CSS Selectors
  SELECTORS: {
    APP_CONTAINER: '#app',
    THEME_TOGGLE: '.theme-toggle',
    HAMBURGER_BUTTON: '.hamburger-button',
    HAMBURGER_CONTAINER: '.hamburger-container',
    HAMBURGER_FLYOUT: '.hamburger-flyout',
    NAV_LINKS: '.nav-link',
    CONTACT_FORM: '#contact-form',
    CURRENT_YEAR: '#current-year',
    LATEST_POSTS_CONTAINER: '#latest-posts-container'
  },

  // Routes
  ROUTES: {
    HOME: 'home',
    BLOG: 'blog',
    BLOG_POST: 'blogPost',
    CONTACT: 'contact'
  },

  // Social media links
  SOCIAL_LINKS: {
    LINKEDIN: 'https://linkedin.com/in/eminyorgun',
    GITHUB: 'https://github.com/eminyorgun',
    INSTAGRAM: 'https://instagram.com/yourusername',
    TWITTER: 'https://twitter.com/yourusername'
  },

  // Contact information
  CONTACT_INFO: {
    EMAIL: 'eminyorgun.developer@gmail.com',
    LOCATION: 'Charleston, SC, United States'
  },

  // Blog configuration
  BLOG: {
    LATEST_POSTS_COUNT: 3,
    POSTS_PER_PAGE: 10,
    EXCERPT_MAX_LENGTH: 10
  },

  // Form validation
  VALIDATION: {
    MIN_NAME_LENGTH: 1,
    MIN_MESSAGE_LENGTH: 1,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // Error messages
  ERRORS: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    MIN_LENGTH: 'This field must be at least {min} characters long',
    FETCH_FAILED: 'Failed to fetch data',
    RENDER_FAILED: 'Failed to render content'
  },

  // Success messages
  SUCCESS: {
    FORM_SUBMITTED: 'Your message has been sent successfully. I\'ll get back to you as soon as possible.',
    THEME_CHANGED: 'Theme changed successfully'
  },

  // CSS Custom Properties
  CSS_VARS: {
    HEADER_OFFSET: '--header-offset',
    CONTAINER_MAX_WIDTH: '--container-max-width',
    CONTAINER_PADDING_X: '--container-padding-x'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
