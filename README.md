# Lance Dimandal — Web Developer Portfolio

A personal portfolio showcasing my experience as a web developer, the websites I’ve worked on, the technologies I use, and selected projects from my professional work.

The portfolio was designed to reflect both my technical background and my interest in creating modern, interactive, and visually engaging web experiences.

---

## About Me

I'm Lance Dimandal, a web developer specializing primarily in WordPress development.

My work focuses on building, maintaining, improving, and optimizing websites while balancing performance, usability, responsive design, and visual quality.

Alongside WordPress, I also work with Shopify, HubSpot, custom front-end development, and various tools commonly used in modern web development.

I enjoy transforming designs into fully functional websites and continuously exploring new technologies, animation techniques, and development workflows.

---

## Personal Project — ForgePress

**ForgePress** is my ongoing Gutenberg-native WordPress framework and visual-building system. It is designed to provide Elementor-level flexibility while staying aligned with native WordPress architecture and avoiding proprietary builder lock-in.

The architecture separates responsibilities across a parent theme, child theme, and ForgePress Core plugin. Current and planned capabilities include responsive container controls, Grid/Flex/Stack layouts, theme.json-based design tokens, custom Gutenberg blocks, scalable navigation and mega menus, dynamic data, REST foundations, plus a planned ACF-like data layer for custom fields, post types, taxonomies, relationships, queries, forms, and integrations.

---

## Work Experience

My professional experience includes working in an agency environment where I handle website development, maintenance, landing pages, performance improvements, responsive implementation, and ongoing client website updates.

My work includes:

- WordPress website development
- Elementor development
- Custom HTML, CSS, JavaScript, and PHP
- Responsive and mobile-first development
- Landing page development
- Website maintenance and content updates
- Website performance optimization
- PageSpeed and Lighthouse improvements
- Contact Form 7 customization and integrations
- Custom email template implementation
- GSAP animations and interactive web experiences
- Shopify website management and customization
- HubSpot website and landing page work
- ACF implementation
- Gutenberg customization
- Design-to-development implementation from Figma
- Website troubleshooting and debugging
- Cross-device and cross-browser optimization
- SFTP-based website deployment and development

Over the course of my work, I have developed and maintained multiple client websites across different industries while continuously improving my front-end development and UI implementation skills.

---

## Technologies & Tools

### Development

- HTML5
- CSS3 / SCSS
- JavaScript
- PHP
- GSAP
- Git

### CMS & Platforms

- WordPress
- Elementor
- Gutenberg
- Advanced Custom Fields
- Shopify
- Liquid
- HubSpot

### Design & Workflow

- Figma
- Responsive Web Design
- Mobile-First Development
- UI Implementation
- Website Performance Optimization
- SFTP / FTP
- Browser Developer Tools

---

## About This Portfolio

This portfolio is built as more than a traditional developer website.

It is a 2D, black-and-gold, editorial layout with a precise motion language: smooth settling eases, no bounce.

The portfolio includes:

- A gold-seamed curtain that carries the first visit and every navigation jump, showing the target section's index and title
- Headlines that come into focus word by word out of a blur
- Image plates that open from a rounded, inset frame while the image settles
- Featured projects on a pinned horizontal scroll: the centred card is in focus, the others step back and dim
- Count-up stats under rules that draw across
- A marquee that speeds up, skews and changes direction with your scroll
- A hero spotlight that follows the pointer, a ring that draws around the portrait and a rotating scroll badge
- Archive and experience rows that lean in on a gold edge, with a floating logo preview that trails the cursor
- Graphic design filters with a sliding underline and tiles that deal back in one by one
- A scroll-linked process line with a glowing head that signs off each service
- A draggable skills ticker with inertia
- A header that hides on scroll down and returns on scroll up
- A circular mobile-menu reveal from the menu button
- A closing gold contact panel that pulls up over the page, flattening its corners as it arrives
- Fully responsive layouts (desktop, tablet, mobile) with touch-friendly fallbacks
- Reduced-motion support: no curtain, no pinning, content shown as-is

Everything runs on vanilla JavaScript with no animation libraries.

---

## Project Structure

```
index.html              Single-page site (Hero → Work → Graphic design → Services → About → Experience → Skills → Athletic → Contact)
css/
  styles.css            All styles, grouped into numbered sections (see the table of contents at the top)
js/
  main.js               All behaviour: curtain, reveals, horizontal projects, filters, lightbox, tickers, cursor, mobile menu
images/
  profile/              Portrait photo
  clients/              Client and project logos used in the Work section
  graphics/             Graphic design posters (full size + -thumb versions for the gallery grid)
  organizations/        Employer, school and team logos (Experience & Athletic)
```

**Reveal attributes:** add `data-r="lines"` (split into words), `rise`, `fade`, `line`, `plate` (with optional `data-from="up|right"`), `stagger` or `rows` to any element, plus an optional `style="--d:.2s"` delay.

**Adding a project to the archive:** copy an `.irow` inside `#irows` in `index.html` (use `<a>` when there is a live site, `<div>` when there isn't) and put its logo in `images/clients/`. The count and the "Show all" label update automatically.

**Adding a poster:** export it to `images/graphics/` as `name.webp` (max 1800px) plus `name-thumb.webp` (720px wide), then copy a `.tile` in the Graphic design section and set its `data-category` (events, campus, editorial, typography or dost). Filter counts are calculated automatically.

**Search engines:** the site is intentionally hidden from search through the `robots` meta tag in `index.html` and the `X-Robots-Tag` header in `vercel.json`. Remove both to allow indexing again.

**Cache busting:** when you change `css/styles.css` or `js/main.js`, bump the `?v=` date on its `<link>`/`<script>` tag in `index.html`.

---

## Selected Work

The portfolio contains selected websites and development projects that I have worked on professionally.

Each project represents different areas of my experience, including:

- Corporate websites
- Landing pages
- Marketing websites
- WordPress development
- Elementor development
- Shopify
- HubSpot
- Website redesigns
- Performance optimization
- Responsive implementation
- Interactive front-end development

Additional projects can also be viewed through the interactive Project Archive inside the portfolio.

---

## Development Philosophy

I aim to build websites that are not only visually polished but also functional, responsive, maintainable, and enjoyable to use.

My approach combines:

**Design × Development × Performance × Interaction**

I believe small details—from responsive spacing and animation timing to loading performance and hover interactions—can significantly improve the overall experience of a website.

---

## Portfolio

Designed and developed by **Lance Dimandal**.

Built using HTML, CSS, vanilla JavaScript, and modern front-end techniques.

© Lance Dimandal. All rights reserved.
