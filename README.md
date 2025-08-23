# Personal Website

A personal portfolio and blog website built with vanilla JavaScript, HTML, and CSS.

## Features

- **Responsive Design**: Modern, mobile-first design with glass morphism effects
- **Dark/Light Mode**: Toggle between dark and light themes
- **Multi-page Navigation**: Home, Blog, and Contact pages with client-side routing
- **Blog System**: Searchable blog posts with category filtering
- **Contact Form**: Functional contact form with validation
- **AI Search Section**: Placeholder for future AI chatbot integration

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables and Flexbox/Grid
- **Build Tool**: None required (pure vanilla JS)
- **Server**: Simple HTTP server for development

## Project Structure

```
personal-website/
├── index.html              # Main HTML file
├── src/
│   ├── App.js             # Main JavaScript application
│   ├── App.css            # All styles
│   └── assets/            # Images, fonts, and icons
│       ├── favicon.ico
│       ├── logo192.png
│       ├── logo512.png
│       ├── logo.png
│       ├── me.jpeg
│       ├── bg3.jpg
│       └── fonts/
├── vendor/                 # Third-party libraries
│   └── lucide.js          # Icon library
└── package.json            # Project configuration
```

## Getting Started

### Prerequisites

- Modern web browser
- Local HTTP server (optional, for development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd personal-website
   ```

2. No dependencies to install - this is a pure vanilla JavaScript project!

### Development

Simply open `index.html` in your browser, or use a local server:

**Option 1: Direct file opening**
- Open `index.html` directly in your browser

**Option 2: Local server (recommended for development)**
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have it)
npx http-server . -p 8000
```

The application will be available at `http://localhost:8000`

### Production

For production deployment, simply upload all files to your web hosting service. No build step is required.

## Key Components

### App Class
The main application class (`src/App.js`) handles:
- Client-side routing
- Page rendering
- State management (dark mode)
- Event handling

### Routing
- `/` - Home page
- `/blog` - Blog listing
- `/blog/:id` - Individual blog post
- `/contact` - Contact page

### Styling
The CSS uses:
- CSS Custom Properties for theming
- Flexbox and Grid for layouts
- Glass morphism effects
- Responsive design with mobile-first approach

## Future Enhancements

- **AI Chatbot**: Integration with local LLM for personalized responses
- **Blog CMS**: Backend for managing blog content
- **Performance**: Image optimization and lazy loading
- **SEO**: Meta tag optimization and sitemap generation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.
