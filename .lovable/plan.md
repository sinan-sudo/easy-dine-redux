

## Interactive 360° Hero + Floating Food Across All Pages

Two coordinated changes: a new interactive 3D hero on the landing page, and subtle floating food decorations on every other page.

### 1. New landing page hero — interactive 360° model

Replace `HeroScene.tsx` with a new scene built around a single hero object the user can rotate.

- **Object**: a beautifully plated dish on a round restaurant table, built procedurally with three.js primitives (round wooden table, ceramic plate, garnished food mound, two wine glasses, cutlery). No external GLB needed — keeps load fast and reliable.
- **Interaction**: `OrbitControls` from `@react-three/drei` configured with:
  - `enableZoom={false}`, `enablePan={false}`
  - Full 360° rotation on X and Y (`minPolarAngle={0}`, `maxPolarAngle={Math.PI}`)
  - `autoRotate` on with slow speed (~0.6); auto-rotation pauses while the user is dragging and resumes ~2s after they release (tracked via `onStart` / `onEnd` handlers + timer)
  - `enableDamping` for smooth inertia
  - Touch drag works automatically via OrbitControls (mobile support built-in)
- **Lighting**: warm restaurant ambience — ambient light (`#f0c098`), key directional light, two warm point lights (`#ff9040`, `#d4824a`), and a flickering candle point light (existing `CandleGlow` logic reused).
- **Background**: transparent canvas (`alpha: true`) layered over the page's existing `bg-gradient-dark` so it blends with the dark warm theme.
- **Hint**: small centered text below canvas — "Drag to rotate · Auto-rotates when idle" — with subtle pulse animation, dismissible (or auto-fading after first interaction; tracked via local state).
- **Performance**: `dpr={[1, 1.75]}`, `frameloop="demand"` is NOT used (we need continuous render for auto-rotate), but geometry is low-poly and there are no shadows or post-processing. `Suspense` fallback keeps initial paint fast.

### 2. Hero text/button visibility

Currently the hero overlays text on the canvas. With an interactive object, pointer events on the canvas would block OrbitControls. New layout for `Index.tsx` hero:
- **Two-column on desktop (md+)**: left column = heading + subtitle + Reserve/Sign In buttons; right column = the 3D canvas with OrbitControls (gets all pointer events).
- **Stacked on mobile**: heading + buttons on top, 3D canvas below (~60vh) so it doesn't fight with scrolling. Use `touch-action: none` only on the canvas itself.
- Keep Framer Motion entrance animations on text. Remove the scroll parallax that hides the scene (it conflicted with interaction).
- Maintain the gold gradient heading and existing "Premium Dining Experience" tagline.

### 3. Floating food on all other pages

Create a new lightweight component `src/components/FloatingFoodDecor.tsx` that places 2–3 food images (wine, pizza/pasta, "dynamite chicken" — represented by the existing `food-steak.png` re-used as a spicy plated dish, OR a newly generated `food-chicken.png`) as fixed-position decorative elements behind page content.

- **Implementation**: pure CSS/HTML (not a 3D canvas) — fixed-position `<img>` elements with:
  - `pointer-events: none` so they never block clicks
  - `opacity` ~0.12–0.18, slight blur (`blur-sm`) for depth
  - Subtle CSS keyframe float animation (translateY + rotate, 8–12s loop)
  - `z-index: 0`, behind all content (page content sits on `z-10`)
  - Hidden on small screens (`hidden md:block`) to keep mobile clean and performant
- **Per-page placement**: corners chosen to avoid form/table content — e.g. top-right + bottom-left on `Book`, `MyReservations`, `Profile`, `Auth`, `ChatSupport`. **Excluded** from `Admin` (matches existing rule that admin views stay clean).
- **Asset for chicken**: generate one new transparent PNG `src/assets/food-chicken.png` (plated spicy dynamite chicken) so the trio is wine + pasta + chicken as requested. Pasta = generate `food-pasta.png` (replacing the burger usage in decor; burger asset stays in repo but isn't used by the new decor).

### 4. Visibility safeguards

- Added `relative z-10` wrapper around primary page content so floating decor never overlaps interactive elements.
- Decor opacity tuned low enough that text contrast (WCAG AA) remains intact on the dark gradient background.
- The hero canvas column is sized so heading + CTAs are always fully visible above the fold on the current 878×678 viewport and on mobile.

### Files

- `src/components/HeroScene.tsx` — rewrite: single 360° interactive plated-dish + table scene with OrbitControls, warm lights, auto-rotate, hint text.
- `src/pages/Index.tsx` — restructure hero into two-column layout; remove scroll-fade parallax on the scene; add `FloatingFoodDecor` to non-hero sections.
- `src/components/FloatingFoodDecor.tsx` — new: fixed, low-opacity floating food images with CSS animation.
- `src/assets/food-chicken.png` — new asset (transparent plated dynamite chicken).
- `src/assets/food-pasta.png` — new asset (transparent plated pasta).
- `src/pages/Book.tsx`, `src/pages/MyReservations.tsx`, `src/pages/Profile.tsx`, `src/pages/Auth.tsx`, `src/pages/ChatSupport.tsx` — add `<FloatingFoodDecor />` and ensure main content wrapper has `relative z-10`.
- `src/pages/Admin.tsx` — unchanged (admin stays clean per existing rule).
- `src/index.css` — add `@keyframes floatDecor` used by the decor component.

### Technical notes

- Versions already installed: `@react-three/fiber@^8.18`, `@react-three/drei@^9.122`, `three`. No new deps.
- OrbitControls auto-rotate pause logic:
  ```ts
  const controlsRef = useRef<any>();
  const resumeTimer = useRef<number>();
  const onStart = () => { controlsRef.current.autoRotate = false; clearTimeout(resumeTimer.current); };
  const onEnd = () => { resumeTimer.current = window.setTimeout(() => { controlsRef.current.autoRotate = true; }, 2000); };
  ```
- Hint dismissal: `localStorage.setItem('hero-hint-seen','1')` after first `onStart`.

