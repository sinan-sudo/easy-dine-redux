

## Redirect Auth Page to Landing on Refresh

When the user refreshes the browser while on `/auth` (sign in / sign up page), they should land on `/` (the landing page) instead of staying on `/auth`.

### Approach

Add a one-time redirect inside `src/pages/Auth.tsx` that runs on mount. If the user arrived at `/auth` via a fresh browser load (refresh, typed URL, bookmark) rather than via in-app navigation, send them to `/`.

Detection method: use the Performance Navigation API.

```ts
useEffect(() => {
  const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const isReload = navEntry?.type === "reload";
  // Also catch first-paint / direct loads where there is no in-app history
  const isDirectLoad = window.history.length <= 1;
  if (isReload || isDirectLoad) {
    navigate("/", { replace: true });
  }
}, []);
```

- `replace: true` so the back button doesn't bounce back to `/auth`.
- Runs once on mount (empty dep array). Does NOT run on internal navigation from Navbar's "Sign In" link, because in that case `navigation.type === "navigate"` and history length > 1.
- Existing logic that redirects authenticated users to `/book` stays unchanged and runs after this check (it's a separate effect tied to `user`).

### Files

- `src/pages/Auth.tsx` — add the refresh-detection `useEffect` near the top of the component, before the existing `user` redirect effect.

### Notes

- No router-level change needed; scoping to `Auth.tsx` keeps the rule local and doesn't affect other deep-linkable pages (Book, Profile, MyReservations, Admin) which should still allow refresh.
- No changes to `App.tsx`, Navbar, or backend.

