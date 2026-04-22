

## Revert Landing Page Hero to Static Image (No 3D)

Replace the interactive 3D hero scene on the landing page with a static, full-bleed restaurant photo (the uploaded candlelit dining image). Keep the existing heading, tagline, and CTA buttons fully visible on top.

### Changes

1. **Add the uploaded image as a project asset**
   - Copy `user-uploads://download.jpg` → `src/assets/restaurant-hero.jpg`.

2. **Rewrite hero section in `src/pages/Index.tsx`**
   - Remove `HeroScene` import and its usage entirely (no 3D on landing page anymore).
   - Replace the two-column hero layout with a single-column, centered hero that uses the restaurant image as the background:
     - `<img>` (or div with `bg-[url()]`) absolutely positioned, `object-cover`, full width/height of the hero section.
     - Dark gradient overlay on top (`bg-gradient-to-b from-background/70 via-background/50 to-background`) so the heading, tagline, and buttons remain legible (WCAG AA contrast).
   - Restore the original centered hero copy:
     - "Premium Dining Experience" tagline with star icons
     - `Your Table Awaits` heading with gold gradient on "Awaits"
     - Subtitle paragraph
     - `Reserve Now` + `Sign In` buttons (unchanged styles)
   - Keep Framer Motion entrance animations on the text block.

3. **Leave the rest of the page intact**
   - Features grid, CTA card, footer — unchanged.
   - `FloatingFoodDecor` on non-hero sections — unchanged (still appears on Book/MyReservations/Profile/Auth/ChatSupport per existing rule). User only asked to change the landing hero, so decor on other pages stays.

4. **Keep `HeroScene.tsx` file in repo but unused**
   - Not deleted (in case the user wants it back), simply no longer imported by `Index.tsx`.

### Files

- `src/assets/restaurant-hero.jpg` — new (copied from upload)
- `src/pages/Index.tsx` — rewrite hero section: remove `HeroScene`, add static background image + overlay, restore single-column centered copy

### Visibility safeguards

- Dark gradient overlay tuned so heading/tagline/buttons remain crisp against the warm candlelit photo.
- Hero text block constrained to `max-w-3xl` and centered, so it sits clearly over the darker upper portion of the image.
- No `pointer-events` traps — buttons are fully clickable.

