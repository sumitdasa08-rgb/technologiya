
# Instant Update on Page Load

## Overview
Change the update strategy so that users always get the latest version when they **open** your website, but won't be interrupted with auto-refresh banners while browsing. This provides a cleaner experience.

## How It Will Work
1. When a user opens your website/app, the service worker will immediately check for updates
2. If a new version is available, it will automatically activate and refresh the page once (silently on initial load)
3. Users who are already browsing won't be interrupted - they'll get the new version next time they open the app
4. No countdown banner or manual refresh buttons needed

## Technical Changes

### 1. Simplify UpdatePrompt Component
Remove the visible banner, countdown, and periodic update checks. Instead:
- Check for updates only on initial page load
- If a new service worker is waiting, immediately activate it and refresh
- This happens so fast on page load that users won't notice

### 2. Update Strategy
- Remove the 30-second interval checking
- Remove the countdown UI and "Refresh Now" button
- Keep the cache-clearing logic for a clean refresh
- Trigger refresh immediately when a new version is detected on page load

### 3. Service Worker Behavior
The existing `skipWaiting: true` and `clientsClaim: true` in `vite.config.ts` will continue to ensure the new service worker takes over immediately.

## Files to Modify
| File | Change |
|------|--------|
| `src/components/UpdatePrompt.tsx` | Simplify to silent auto-refresh on page load only |

## Result
- **Opening the app**: Always gets the latest version (auto-refresh if needed)
- **Already browsing**: No interruptions, gets update on next visit
- **No visible UI**: The update happens silently during page load
