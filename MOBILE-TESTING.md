# Mobile Testing Checklist

Complete this checklist before submitting to app stores.

## Installation Testing

### iOS (Safari)
- [ ] App installs correctly via "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] App name displays correctly ("Forge")
- [ ] Tapping icon opens app without Safari UI
- [ ] Status bar appears in black (matches theme)
- [ ] No Safari URL bar visible when app is open

### Android (Chrome)
- [ ] "Install App" prompt appears automatically
- [ ] App installs via prompt
- [ ] App icon appears in app drawer
- [ ] App opens standalone (no browser UI)
- [ ] Navigation bar integrates properly
- [ ] Can uninstall like a native app

## Offline Functionality

- [ ] App loads when internet connection is off
- [ ] Dashboard displays cached data
- [ ] Can navigate between pages offline
- [ ] Work orders display from cache
- [ ] Jobs display from cache
- [ ] AI chat shows "Offline" message gracefully
- [ ] Data syncs when connection restored
- [ ] No error modals when offline (graceful degradation)

## Push Notifications

- [ ] Notification permission prompt works
- [ ] Can receive push notifications (test with placeholder)
- [ ] Clicking notification opens app
- [ ] Notification opens correct page/content
- [ ] Badge count updates correctly (if implemented)
- [ ] Notifications respect system settings

## Camera & Media Access

- [ ] Camera permission prompt works (if photo upload added)
- [ ] Can take photos for work orders
- [ ] Photos upload successfully
- [ ] Photos display in correct orientation
- [ ] Can select from gallery
- [ ] Photo thumbnails generate correctly

## Gestures & Touch

- [ ] Swipe gestures work smoothly
- [ ] Pull-to-refresh works (if implemented)
- [ ] Long press interactions work
- [ ] Pinch-to-zoom disabled (not needed for forms)
- [ ] Scroll momentum feels native
- [ ] Touch targets are minimum 44×44px
- [ ] No accidental touches on nearby elements
- [ ] Keyboard doesn't overlap input fields

## Persistence

- [ ] App reopens to last viewed page
- [ ] Login state persists after closing app
- [ ] Form data persists if app backgrounded
- [ ] Work order filters persist
- [ ] Dashboard preferences saved
- [ ] User settings persist
- [ ] No data loss on app close

## Responsive Design

### iPhone SE (smallest - 375×667)
- [ ] All content visible without horizontal scroll
- [ ] Bottom navigation accessible
- [ ] Forms fit on screen
- [ ] Text readable (minimum 16px)
- [ ] Buttons tappable
- [ ] Cards stack properly

### iPhone 14 Pro (standard - 393×852)
- [ ] Layout looks balanced
- [ ] AI insights panel displays correctly
- [ ] Work orders list scrolls smoothly
- [ ] Chat panel fits properly
- [ ] Modals centered

### iPhone 14 Pro Max (large - 430×932)
- [ ] Content doesn't feel stretched
- [ ] Safe areas respected
- [ ] Extra space used effectively

### iPad (tablet - 768×1024+)
- [ ] Desktop layout shows
- [ ] Sidebar accessible
- [ ] Cards use available width
- [ ] Touch targets appropriate
- [ ] Landscape orientation works

### Android Phones (various)
- [ ] Samsung Galaxy S23 (360×800)
- [ ] Google Pixel 7 (412×915)
- [ ] Large Android phones (428×926+)
- [ ] Different aspect ratios handled

## Navigation

### Bottom Nav (Mobile)
- [ ] All tabs work correctly
- [ ] Active tab highlighted
- [ ] Icons clear and tappable
- [ ] Badge counts display correctly
- [ ] Smooth transitions between tabs

### AI Chat
- [ ] Floating button visible on all pages
- [ ] Doesn't overlap content
- [ ] Chat opens smoothly from right
- [ ] Can close with swipe or button
- [ ] Messages scroll properly
- [ ] Keyboard doesn't hide input
- [ ] Example prompts tappable

### Modals & Dialogs
- [ ] Job creation modal fits screen
- [ ] Work order modal scrollable
- [ ] Keyboard shortcuts dialog displays
- [ ] Confirmation dialogs centered
- [ ] Can close with back gesture (Android)
- [ ] Backdrop dismisses properly

## Performance

- [ ] App loads in < 3 seconds on 4G
- [ ] Page transitions smooth (60fps)
- [ ] No jank when scrolling
- [ ] Images load progressively
- [ ] Animations don't stutter
- [ ] No memory leaks after 30 minutes use
- [ ] Battery drain acceptable

## Lighthouse PWA Audit

- [ ] PWA score > 90
- [ ] Performance score > 85
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### PWA Specific Checks
- [ ] ✅ Installable
- [ ] ✅ Registers a service worker
- [ ] ✅ Responds with 200 when offline
- [ ] ✅ Contains theme color meta tag
- [ ] ✅ Contains viewport meta tag
- [ ] ✅ Contains icons for add to home screen
- [ ] ✅ Configured for custom splash screen
- [ ] ✅ Sets a theme color for address bar

## Visual Consistency

- [ ] Black/white theme consistent throughout
- [ ] AI gradient features (blue-purple) display correctly
- [ ] Icons render crisp on Retina displays
- [ ] Text readable in all lighting conditions
- [ ] Color contrast passes WCAG AA
- [ ] No broken images
- [ ] Fonts load correctly

## Forms & Input

- [ ] Keyboard shows correct type (number, email, etc.)
- [ ] Date pickers work natively
- [ ] Dropdown selects work
- [ ] Text areas expandable
- [ ] Form validation shows errors
- [ ] Can submit forms
- [ ] Error messages visible
- [ ] Success toasts appear

## Authentication

- [ ] Login form works
- [ ] Email validation works
- [ ] Password visibility toggle works
- [ ] Remember me persists
- [ ] Logout works completely
- [ ] Session timeout handled gracefully

## Data Sync

- [ ] Jobs sync from Supabase
- [ ] Work orders sync from Supabase
- [ ] Real-time updates work (if implemented)
- [ ] Optimistic UI updates feel instant
- [ ] Conflicts handled gracefully
- [ ] Error states clear and actionable

## AI Features

- [ ] AI insights panel loads
- [ ] Insights update every 30 seconds
- [ ] AI chat responds to queries
- [ ] Chat shows typing indicator
- [ ] Action buttons in chat work
- [ ] Example prompts work
- [ ] No placeholder data in production

## Edge Cases

- [ ] App handles no internet gracefully
- [ ] App handles slow connection (3G)
- [ ] App handles no data/empty states
- [ ] App handles long text input
- [ ] App handles special characters
- [ ] App handles date edge cases (leap year, etc.)
- [ ] App handles large datasets (100+ work orders)

## Accessibility

- [ ] Screen reader announces pages correctly
- [ ] All buttons have labels
- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Focus visible with keyboard navigation
- [ ] Color not sole means of information
- [ ] Text resizable to 200%

## Security

- [ ] No sensitive data in console logs
- [ ] API keys not exposed in client code
- [ ] Supabase RLS policies active
- [ ] HTTPS enforced
- [ ] Credentials not stored insecurely
- [ ] XSS protection in place

## Miscellaneous

- [ ] App version number displays in About
- [ ] "Check for Updates" works
- [ ] Legal links work (Privacy, Terms)
- [ ] Support email link works
- [ ] App doesn't crash under normal use
- [ ] No critical bugs
- [ ] All placeholder content removed

---

## Testing Devices

### Minimum Test Matrix

**iOS**:
- iPhone SE (2022) - iOS 16+
- iPhone 13 - iOS 17
- iPad (9th gen) - iPadOS 16+

**Android**:
- Samsung Galaxy A-series - Android 12+
- Google Pixel 6 - Android 13+
- Large screen device - Android 13+

### Tools

- **BrowserStack**: Test on real devices remotely
- **Chrome DevTools**: Device emulation
- **Lighthouse**: PWA auditing
- **WebPageTest**: Performance testing
- **Wave**: Accessibility testing

---

## Sign Off

Testing completed by: ___________________

Date: ___________________

Ready for app store submission: ☐ Yes ☐ No

Notes:
______________________________________________________
______________________________________________________
______________________________________________________

---

## Issues Found

Track issues in GitHub/Jira and link them here:

1.
2.
3.

---

**Once all items are checked, proceed to app store submission!**
