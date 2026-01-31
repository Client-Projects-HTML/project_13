# Customization Guide

## Table of Contents
1. [Colors & Theme](#colors--theme)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Components](#components)
5. [Adding New Pages](#adding-new-pages)

---

## Colors & Theme

### Primary Colors
The template uses CSS variables for consistent theming. Edit `assets/css/style.css`:

```css
:root {
    /* Primary Brand Color */
    --color-primary: #2563EB;
    --color-primary-light: #3B82F6;
    --color-primary-dark: #1D4ED8;
    
    /* Secondary Brand Color */
    --color-secondary: #059669;
    --color-secondary-light: #10B981;
    --color-secondary-dark: #047857;
    
    /* Accent Color */
    --color-accent: #F59E0B;
    --color-accent-light: #FBBF24;
    --color-accent-dark: #D97706;
}
```

### Dark Mode
Dark mode colors are in `assets/css/dark-mode.css`:

```css
[data-theme="dark"] {
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
}
```

---

## Typography

### Font Families
The template uses a maximum of 2-3 font families:

```css
:root {
    --font-primary: 'Inter', sans-serif;      /* Body text */
    --font-heading: 'Inter', sans-serif;      /* Headings */
}
```

### Font Sizes
```css
:root {
    --font-size-xs: 0.75rem;   /* 12px */
    --font-size-sm: 0.875rem;  /* 14px */
    --font-size-base: 1rem;    /* 16px */
    --font-size-lg: 1.125rem;  /* 18px */
    --font-size-xl: 1.25rem;   /* 20px */
    --font-size-2xl: 1.5rem;   /* 24px */
    --font-size-3xl: 1.875rem; /* 30px */
    --font-size-4xl: 2.25rem;  /* 36px */
    --font-size-5xl: 3rem;     /* 48px */
}
```

---

## Spacing System

The template uses an 8px base unit:

```css
:root {
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
}
```

### Utility Classes
```html
<!-- Margins -->
<div class="mt-4">Margin top 16px</div>
<div class="mb-6">Margin bottom 24px</div>
<div class="ml-2">Margin left 8px</div>
<div class="mr-4">Margin right 16px</div>

<!-- Padding -->
<div class="p-4">Padding all 16px</div>
<div class="px-6">Padding horizontal 24px</div>
<div class="py-8">Padding vertical 32px</div>
```

---

## Components

### Buttons
```html
<!-- Primary -->
<button class="btn btn-primary">Primary Button</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary Button</button>

<!-- Outline -->
<button class="btn btn-outline">Outline Button</button>

<!-- Sizes -->
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-sm">Small</button>
```

### Cards
```html
<div class="card">
    <div class="card-header">Header</div>
    <div class="card-body">Content</div>
    <div class="card-footer">Footer</div>
</div>
```

### Forms
```html
<div class="form-group">
    <label class="form-label" for="email">Email</label>
    <input type="email" class="form-control" id="email" placeholder="Enter email">
</div>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

---

## Adding New Pages

1. **Create the HTML file** in the `pages/` directory
2. **Copy the header/footer** from an existing page
3. **Update meta tags**:
```html
<title>Page Title - Kitchen Exhaust Pro</title>
<meta name="description" content="Page description for SEO">
```
4. **Add to navigation** in the header of all pages
5. **Update sitemap.xml** with the new page

---

## RTL Support

To enable RTL:

1. Add `dir="rtl"` to `<html>`:
```html
<html lang="ar" dir="rtl">
```

2. Include RTL stylesheet:
```html
<link rel="stylesheet" href="assets/css/rtl.css">
```

The RTL stylesheet automatically adjusts:
- Text alignment
- Margins and paddings
- Flex direction
- Border radii
- Transforms

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 639px) { ... }

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) and (max-width: 1279px) { ... }

/* Large */
@media (min-width: 1280px) { ... }
```

---

## Form Validation

Add `data-validate` attribute to forms:

```html
<form id="contact-form" data-validate>
    <input type="email" class="form-control" required>
    <input type="text" minlength="2" required>
</form>
```

The JavaScript automatically validates:
- Required fields
- Email format
- Min/max length
- Custom patterns

---

## JavaScript Modules

### Main Module (main.js)
- Theme toggle
- Mobile navigation
- Form validation
- Smooth scrolling
- Lazy loading
- Animations
- Counter animations

### Dashboard Module (dashboard.js)
- Statistics counters
- Charts (requires Chart.js)
- Data tables with sorting
- NFPA scheduling
- Reminder system
- Service reports
- Export functionality

---

## Performance Optimization

### Images
- Use WebP format
- Lazy load images: `<img loading="lazy" src="image.webp">`
- Specify dimensions: `<img width="800" height="600" src="image.webp">`

### CSS
- Minify in production
- Use CSS variables for consistency
- Avoid unused styles

### JavaScript
- Defer loading: `<script defer src="main.js"></script>`
- Remove console logs in production
- Use module pattern

---

## SEO Checklist

- [ ] Unique title tags (60 chars max)
- [ ] Meta descriptions (150-160 chars)
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Alt text for images
- [ ] Structured data (JSON-LD)
- [ ] XML sitemap
- [ ] robots.txt
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] SSL certificate
