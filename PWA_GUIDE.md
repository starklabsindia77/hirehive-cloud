# HireHive PWA Guide

## Progressive Web App Features

Your recruitment platform is now a fully functional Progressive Web App (PWA) with the following capabilities:

### ✅ Installable
- Users can install the app on their devices (desktop, mobile, tablet)
- Works like a native app with its own icon and window
- No app store required

### ✅ Offline Support
- Service worker caches essential assets
- App continues to work without internet connection
- Automatic sync when connection is restored

### ✅ App-Like Experience
- Full-screen mode on mobile devices
- Custom splash screen
- Native-like navigation and interactions

### ✅ Push Notifications (Ready)
- Infrastructure in place for push notifications
- Can notify users about new candidates, interviews, etc.

### ✅ Background Sync
- Actions performed offline are synced when online
- No data loss when working without internet

## How to Install

### Desktop (Chrome, Edge, Brave)
1. Visit your deployed app
2. Look for the install icon in the address bar
3. Click "Install" or use the in-app install prompt
4. App will be added to your applications

### Mobile (iOS Safari)
1. Visit your deployed app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"

### Mobile (Android Chrome)
1. Visit your deployed app
2. Tap the three-dot menu
3. Select "Add to Home Screen" or use the in-app prompt
4. Confirm installation

## Features Implemented

### 1. Service Worker (`public/sw.js`)
- Caches app shell and assets
- Provides offline functionality
- Handles background sync
- Manages push notifications

### 2. Web App Manifest (`public/manifest.json`)
- Defines app metadata
- Sets app icons and colors
- Configures display mode
- Includes app shortcuts

### 3. PWA Utilities (`src/utils/pwa.ts`)
- Service worker registration
- Install prompt handling
- Notification management
- Update checking

### 4. UI Components
- **PWAInstallPrompt**: Prompts users to install the app
- **PWAUpdatePrompt**: Notifies when updates are available
- **OnlineStatus**: Shows connection status

### 5. Icons and Assets
- App icons (192x192 and 512x512)
- Screenshots for app stores
- Offline fallback page

## Testing PWA Features

### Local Testing
1. Build the app: `npm run build`
2. Serve with HTTPS (required for PWA)
3. Open Chrome DevTools > Application > Service Workers
4. Test offline mode by checking "Offline" in DevTools

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit to check PWA compliance

## Customization

### Update App Colors
Edit `public/manifest.json`:
```json
{
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff"
}
```

### Change App Name
Update in `public/manifest.json` and `index.html`

### Add More Shortcuts
Edit the `shortcuts` array in `manifest.json`:
```json
{
  "name": "New Feature",
  "url": "/feature",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }]
}
```

### Modify Caching Strategy
Edit `public/sw.js` to change what gets cached:
```javascript
const urlsToCache = [
  '/',
  '/index.html',
  // Add more URLs to cache
];
```

## Deployment Requirements

### HTTPS Required
- PWA requires HTTPS (except localhost)
- Lovable automatically provides HTTPS
- Custom domains must have SSL certificate

### Headers (Optional)
For better PWA experience, consider adding these headers:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Monitoring

### Service Worker Status
Check service worker status in browser:
- Chrome: `chrome://serviceworker-internals/`
- Firefox: `about:serviceworkers`
- Safari: Develop > Service Workers

### Cache Storage
View cached resources:
- Chrome DevTools > Application > Cache Storage
- See what's cached and clear if needed

## Best Practices

1. **Update Strategy**: Always test updates before deploying
2. **Cache Size**: Keep cached resources under 50MB
3. **Offline UX**: Provide clear offline indicators
4. **Update Prompts**: Don't force updates, let users choose
5. **Icons**: Use high-quality icons for all sizes

## Troubleshooting

### App Won't Install
- Check HTTPS is enabled
- Verify manifest.json is accessible
- Ensure icons exist and are correct size
- Check browser console for errors

### Service Worker Not Registering
- Clear browser cache
- Check for JavaScript errors
- Verify sw.js is in public folder
- Check service worker scope

### Offline Mode Not Working
- Service worker must be active
- Check cache configuration
- Verify network requests are intercepted
- Test in private/incognito mode first

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Training](https://web.dev/learn/pwa/)
- [PWA Builder](https://www.pwabuilder.com/)

## Next Steps

1. Test the PWA on multiple devices
2. Run Lighthouse audit and fix any issues
3. Configure push notifications (requires backend)
4. Add offline data persistence
5. Submit to app stores (optional)

Your app is now ready to be used as a Progressive Web App! 🎉
