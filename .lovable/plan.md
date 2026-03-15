

## Problem

The `onHoverStart`/`onHoverEnd` from Framer Motion on the `TableUnit` wrapper are being intercepted by the `Tooltip` + `TooltipTrigger` wrapping. The tooltip's internal pointer event handling prevents framer-motion's hover detection from firing reliably, so `hovered` never becomes `true` and chairs don't animate.

## Fix

Replace `onHoverStart`/`onHoverEnd` (Framer Motion hover events) with standard React `onMouseEnter`/`onMouseLeave` on the outer `motion.div` inside `TableUnit`. These DOM events fire regardless of the tooltip's event handling.

### Change in `FloorMap.tsx` (lines 108-115)

Replace:
```tsx
<motion.div
  ...
  onHoverStart={() => isSelectable && setHovered(true)}
  onHoverEnd={() => setHovered(false)}
```

With:
```tsx
<motion.div
  ...
  onMouseEnter={() => isSelectable && setHovered(true)}
  onMouseLeave={() => setHovered(false)}
```

This is a 2-line change. Everything else stays the same.

