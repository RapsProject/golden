# Project Structure - SabiAcademia ITB Preparation Platform

## Overview
This is a landing page for an IUP ITB entrance exam preparation platform, built with React, Vite, and Tailwind CSS.

## Tech Stack
- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Fonts**: 
  - Headings: Merriweather (serif)
  - Body: Inter (sans-serif)

## Color Palette
The following custom colors are configured in `tailwind.config.js`:

| Color | Hex | Usage |
|-------|-----|-------|
| `brand-dark` | #09637E | Headings, Active States, Footer Background |
| `brand-primary` | #088395 | Primary Buttons, Links, Brand Elements |
| `brand-secondary` | #7AB2B2 | Borders, Secondary Buttons, Icons, Subtitles |
| `brand-light` | #EBF4F6 | Page Background, Section Backgrounds |

## Folder Structure

```
src/
├── components/
│   ├── ui/                    # Reusable atomic components
│   │   ├── Button.tsx         # Button component with variants
│   │   ├── Container.tsx      # Max-width container wrapper
│   │   ├── Badge.tsx          # Badge/pill component
│   │   └── index.ts           # Barrel exports
│   ├── layout/                # Layout components
│   │   └── Navbar.tsx         # Sticky navigation with mobile menu
│   └── sections/              # Page sections
│       └── Hero.tsx           # Hero section with CTA
├── lib/
│   └── utils.ts               # Utility functions (cn helper)
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
└── index.css                  # Global styles + Tailwind directives
```

## Components Built

### Layout
- ✅ **Navbar** (`components/layout/Navbar.tsx`)
  - Sticky/fixed navigation with backdrop blur
  - Mobile hamburger menu
  - Desktop menu items: Features, Pricing, Testimonials
  - CTA buttons: Login (outline) and Get Started (primary)

### Sections
- ✅ **Hero** (`components/sections/Hero.tsx`)
  - Badge: "#1 IUP ITB Preparation Platform"
  - Main headline with serif font
  - Subheading in Indonesian
  - Two CTA buttons with icons
  - Trust indicators (stats)
  - Interactive dashboard mockup visualization

### UI Components
- ✅ **Button** - Multiple variants (primary, secondary, outline, ghost) and sizes
- ✅ **Container** - Responsive max-width wrapper
- ✅ **Badge** - Pill-shaped badges for highlights

## Sections Pending Implementation
- [ ] Problem Statement
- [ ] Interactive Demo
- [ ] Features Grid
- [ ] Testimonials
- [ ] Pricing
- [ ] FAQ
- [ ] Footer

## Development

### Start Development Server
```bash
npm run dev
```
Server will be available at `http://localhost:5173/` (or next available port)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Design Principles
- **Mobile First**: All layouts start with mobile (flex-col) and adapt to desktop
- **Generous Spacing**: py-20 or py-24 between sections
- **Clean & Academic**: Professional vibe with serif headings
- **Accessible**: Proper semantic HTML and ARIA labels

## Next Steps
1. ✅ Scaffold project structure
2. ✅ Setup Tailwind with custom colors
3. ✅ Build Layout (Navbar)
4. ✅ Build Hero section
5. Build remaining sections (Problem Statement, Demo, Features, etc.)
6. Add animations and interactions
7. Optimize for performance
