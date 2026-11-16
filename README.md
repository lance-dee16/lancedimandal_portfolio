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

It is a 2D, black-and-gold, editorial layout with an iOS-inspired motion language: spring physics with a slight, natural overshoot, frosted glass and continuous rounded corners.

The portfolio includes:

- Spring-based motion throughout (CSS `linear()` spring curves with cubic-bezier fallbacks)
- A first-visit splash that zooms through while the page scales up into place
- Section jumps that zoom the page out and spring the new view back in, like switching apps
- A header that springs into a floating frosted pill once you scroll, Dynamic Island-style
- A mobile menu that opens as a bottom sheet, pushes the page back into a rounded card and can be swiped down to close
- Graphic design posters that zoom out of their thumbnail like Photos, with swipe-down to dismiss
- An iOS-style segmented control for the design filters, with a spring thumb
- Press feedback: buttons, cards and tiles give slightly when tapped
- Headlines that come into focus word by word out of a blur
- Featured projects on a pinned horizontal scroll (stacked on phones and short screens)
- Count-up stats, a scroll-velocity marquee, a hero spotlight and portrait ring
- Archive and experience rows with an iOS list highlight and a floating logo preview that trails the cursor
- Toolkit cards with a pointer-following spotlight and lit border, a spring lift, staggered tool chips and sibling focus dimming; the ticker eases to a stop on hover, speeds up with scroll and can be dragged with inertia
- Athletic cards with the same glow treatment and an app-icon spring on the team logo, plus a gold frisbee thrown across the section as you scroll
- A thin, warm scrollbar site-wide and an iOS-style fading scroll indicator inside the mobile menu sheet
- A closing wordmark whose letters rise into place as you reach the bottom of the page
- A closing gold contact panel that pulls up over the page, flattening its corners as it arrives
- Fully responsive layouts (desktop, tablet, mobile, short windows)
- Reduced-motion support: no zooms, no pinning, content shown as-is

Everything runs on vanilla JavaScript with no animation libraries.

---

## Project Structure

```
index.html              Single-page site (Hero → Work → Graphic design → Services → About → Experience → Skills → Athletic → Contact)
css/
  styles.css            All styles, grouped into numbered sections (see the table of contents at the top)
js/
  main.js               All behaviour: splash, zoom jumps, header island, bottom sheet, reveals, horizontal projects, filters, lightbox, tickers, cursor, mobile menu
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
