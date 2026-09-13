// Presentation-only mobile default. Desktop retains its current presentation.
// Never persisted in a save. Explicit legacy URL remains a recovery route.
export const FARM_MOBILE_REQUESTED = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('farmView') !== 'legacy'
  && (window.matchMedia('(max-width: 600px)').matches
    || ['mobile-v2', 'topdown-v3'].includes(new URLSearchParams(window.location.search).get('farmView') ?? ''));
