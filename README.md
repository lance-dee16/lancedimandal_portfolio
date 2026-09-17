# Lance Dimandal Portfolio — Digital 3D V4

V4 focuses on interaction quality: richer card hover personalities, a cinematic project-archive transition, and a dedicated mobile Ultimate-disc animation.

## V4 additions

### Card interaction system
- Featured project cards gain stronger depth, edge lighting, title movement, and cover-detail reactions.
- More-project cards now use pointer-following light, subtle 3D tilt/lift, animated logo/title layers, responsive tags, and faint archive sequence numbers.
- Service cards have icon rotation/lift and layered content movement.
- Metric cards push the odometer value forward as the main depth layer.
- Toolkit cards animate their technology chips at different Z-depths instead of moving as one flat block.
- Athletic cards use layered logo/name/role/copy/date depth plus a cursor-positioned ambient glow.
- Touch devices use lightweight press feedback instead of desktop hover effects.

### More Project Work archive
- The native instant `<details>` opening is replaced with a controlled GSAP expand/collapse sequence while retaining semantic `<details>/<summary>` markup.
- The archive panel animates its height and opacity instead of snapping open.
- All 16 project cards enter with perspective, stagger, scale, and depth.
- Closing uses a reversed stagger and collapses the panel cleanly before setting the details element closed.
- The trigger now has a project-archive label, animated scan line, morphing plus/minus control, state copy, and hover treatment.
- Mobile uses shorter stagger/duration values to keep the interaction responsive.

### Mobile Ultimate disc
- Phones now receive their own repeating Ultimate-disc flight rather than relying on the generic touch/tablet animation.
- The disc changes X/Y position, perspective rotation, scale, and opacity during the throw.
- The animation starts only while the Athletic section is in view and pauses when it leaves the viewport to reduce wasted rendering.
- The disc remains behind the section content and cards.

## Existing V3 scene system retained
- Floating 3D technology field in Selected Work.
- Infinite digital-break marquee.
- Toolkit background icon constellation and orbital rings.
- Desktop/tablet 3D Ultimate disc scene.
- Stable rolling odometer counters.
- Reduced-motion support.

## Deployment
Upload the complete folder. `index.html` uses cache-busted V4 references for `styles.css` and `animations.js`.
