// Presentation-only opt-in while the representative art and catalog are pending.
// Never persisted in a save, never enabled by a failed asset load.
export const FARM_MOBILE_REQUESTED = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).get('farmView') === 'mobile-v2';
