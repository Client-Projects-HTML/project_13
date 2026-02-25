# Kitchen Exhaust - Commercial Kitchen Exhaust Cleaning Template

A modern, responsive HTML template for commercial kitchen exhaust cleaning businesses. Built with vanilla HTML, CSS, and JavaScript - no frameworks required.

## Features

### Core Features
- 📱 **Mobile-First Design** - Fully responsive across all devices
- 🌓 **Dark/Light Mode** - Automatic system preference detection with manual toggle
- 🌐 **RTL Support** - Full right-to-left layout support for Arabic and Hebrew
- ♿ **WCAG 2.1 AA** - Accessible and inclusive design
- 🔍 **SEO Optimized** - Proper meta tags, semantic HTML, and structured data
- ⚡ **Performance** - Optimized for fast loading (90+ PageSpeed score target)

### Pages Included
- **Home Page** - Modern landing with hero, services, testimonials, and blog
- **About Us** - Team, mission, history, and testimonials
- **Services** - Grid/list of all services offered
- **Service Details** - In-depth service description with FAQs and pricing
- **Blog** - Filterable article listing
- **Blog Details** - Full article with sidebar
- **Contact** - Form, map, and contact information
- **Admin Dashboard** - Analytics, scheduling, and management (NFPA compliance)
- **404 Page** - Custom error page
- **Pricing** - Service pricing tables
- **Login/Register** - User authentication pages
- **Coming Soon** - Maintenance/coming soon page

### Dashboard Features
- 📊 **Analytics Overview** - Stats, charts, and key metrics
- 📅 **NFPA Scheduling** - Compliance calendar and scheduling
- 🔔 **Reminder System** - Automatic compliance reminders
- 📋 **Service Reports** - Historical report tracking
- 👥 **Client Management** - Customer information and history

## File Structure

```
template-name/
├── assets/
│   ├── css/
│   │   ├── style.css      # Main styles with CSS variables
│   │   ├── dark-mode.css  # Dark mode overrides
│   │   └── rtl.css        # RTL layout support
│   ├── js/
│   │   ├── main.js        # Core functionality
│   │   ├── dashboard.js   # Dashboard-specific features
│   │   └── plugins/       # Optional plugins
│   ├── images/
│   │   └── fonts/
├── pages/
│   ├── index.html         # Home page
│   ├── about.html         # About us
│   ├── services.html      # Services listing
│   ├── service-details.html
│   ├── blog.html          # Blog listing
│   ├── blog-details.html  # Single blog post
│   ├── contact.html       # Contact form
│   ├── dashboard.html     # Admin dashboard
│   ├── 404.html           # Error page
│   ├── pricing.html       # Pricing tables
│   ├── login.html         # Login page
│   └── coming-soon.html   # Coming soon
├── documentation/
├── robots.txt
└── sitemap.xml
```

## Installation

1. **Download the template**
   ```bash
   git clone <repository-url>
   cd kitchen-exhaust-pro
   ```

2. **Customize the content**
   - Update text content in HTML files
   - Replace images in `/assets/images/`
   - Update colors in CSS variables

3. **Configuration**
   - Edit CSS variables in `assets/css/style.css`
   - Update meta tags in each HTML file
   - Configure form endpoints (Formspree, Netlify, etc.)

4. **Launch**
   - Open `pages/index.html` in browser
   - Or deploy to your hosting provider

## Customization

### Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
    --color-primary: #2563EB;
    --color-secondary: #059669;
    --color-accent: #F59E0B;
}
```

### Fonts
The template uses Google Fonts. Change in HTML head:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap" rel="stylesheet">
```

### Dark Mode
Colors are defined in CSS variables. Dark mode uses the same variables with different values.

### RTL Support
Add `dir="rtl"` to the `<html>` tag:
```html
<html lang="ar" dir="rtl">
```

## Form Integration

### Contact Form (Formspree)
```html
<form action="https://formspree.io/your-email" method="POST">
```

### Newsletter (Mailchimp)
```html
<form action="https://your-mailchimp-url" method="POST">
```

### Maps (Google Maps)
Replace the iframe in `contact.html` with your Google Maps embed code.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS (latest)
- Android (latest)

## Credits

- **Icons**: Feather Icons (feathericons.com)
- **Images**: Unsplash (unsplash.com)
- **Fonts**: Google Fonts (google.com/fonts)
- **Charts**: Chart.js (chartjs.org)

## License

This template is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact support@kitchenexhaust.com.
