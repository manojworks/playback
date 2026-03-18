## Plan: Build Web-Based Music Player with Feature-Based Architecture

TL;DR: Develop a standalone music player as the main app component, using Angular's feature-based architecture with a Core module for services (audio, playlist, storage), Shared module for common components, and lazy-loaded feature modules. Since the music player replaces the default app component and no additional features (login/dashboard/user management) are needed, focus on core player functionality with extensible architecture.

**Steps**
1. **Set up Core directory and services** - Create `src/app/core/` directory with injectable services: AudioService (handles HTML5 audio playback), PlaylistService (manages track queue and state), StorageService (persists playlist to localStorage). Configure services as singleton providers in app.config.ts.
2. **Create Shared module** - Establish `src/app/shared/` with common components like buttons, progress bars, and icons. Create a SharedModule with declarations and exports for reusable UI elements.
3. **Build Music Player feature module** - Develop `src/app/features/music-player/` as a lazy-loaded module containing player components (PlayerComponent, PlaylistComponent, ControlsComponent). Configure routing for lazy loading at root path.
4. **Implement player UI components** - Create responsive player interface with play/pause controls, progress bar, volume slider, playlist display, and track info. Use Shared module components where possible.
5. **Integrate audio functionality** - Wire AudioService to HTML5 Audio API for playback, seeking, and volume control. Handle audio events (ended, error, timeupdate).
6. **Add playlist management** - Implement add/remove tracks, reorder via drag-drop, shuffle/repeat modes. Persist state via StorageService.
7. **Style and polish** - Apply modern dark theme styling consistent with existing CSS variables. Ensure responsive design for mobile/desktop.
8. **Testing and validation** - Add unit tests for services and components. Test audio playback, playlist persistence, and UI interactions.

**Relevant files**
- `src/app/core/services/audio.service.ts` — Audio playback logic
- `src/app/core/services/playlist.service.ts` — Track queue management
- `src/app/core/services/storage.service.ts` — LocalStorage persistence
- `src/app/shared/shared.module.ts` — Common components module
- `src/app/features/music-player/music-player.module.ts` — Feature module
- `src/app/app.routes.ts` — Lazy loading configuration
- `src/app/app.config.ts` — Service providers

**Verification**
1. Run `ng serve` and verify app loads without errors; music player displays at root route
2. Test audio playback: Upload/select tracks, play/pause, seek via progress bar, adjust volume
3. Test playlist: Add multiple tracks, reorder, enable shuffle/repeat, verify persistence on reload
4. Run `ng test` to ensure all services and components pass unit tests
5. Test responsive design on different screen sizes

**Decisions**
- Music player as main app (replaces app.component) per user clarification — keeps the UI focused and removes unneeded navigation complexity.
- No login/dashboard/user management features needed — keeps the scope small and minimizes unnecessary state.
- Use localStorage for persistence (simple, no backend required) — enables offline playback and keeps setup lightweight.
- Feature-based architecture with lazy loading for scalability — makes the app modular and keeps initial bundle size small.
- Use standalone components everywhere (no NgModules required) — reduces boilerplate and aligns with Angular’s modern best practices.
- Use Angular Signals + computed() for state management (avoid RxJS Subjects/Observables in component logic) — provides reactive state with less boilerplate and better performance.
- Avoid manual RxJS subscriptions; use `effect()` and signal getters instead — prevents memory leaks and simplifies lifecycle management.
- Keep strict TypeScript mode enabled and avoid `any`/untyped errors for maximum safety — catches issues at compile time and improves maintainability.
- Use Tailwind CSS for utility-first styling and responsive layout — enables rapid UI iteration with consistent spacing and breakpoints.
- Use Angular Material components + themes for consistent UI design and built-in accessibility — reduces custom styling effort while keeping a polished look.

**Further Considerations**
1. File upload support: Implement drag-drop or file picker for local music files
2. Audio formats: Support common formats (MP3, WAV, OGG) via HTML5 Audio
3. Error handling: Add user-friendly messages for unsupported files or playback errors
4. Accessibility: Ensure keyboard navigation and screen reader support for controls
