export const Logo = () => <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#56CCF2"/>
      <stop offset="100%" stop-color="#2F80ED"/>
    </linearGradient>
    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2F80ED"/>
      <stop offset="100%" stop-color="#1E6091"/>
    </linearGradient>
  </defs>
  
  <circle cx="100" cy="100" r="90" fill="url(#gradient1)" opacity="0.1"/>
  
  <circle cx="100" cy="50" r="12" fill="url(#gradient1)"/>
  <circle cx="150" cy="100" r="12" fill="url(#gradient2)"/>
  <circle cx="100" cy="150" r="12" fill="url(#gradient1)"/>
  <circle cx="50" cy="100" r="12" fill="url(#gradient2)"/>
  
  <circle cx="100" cy="100" r="18" fill="url(#gradient2)"/>
  
  <path d="M100 62 L100 82" stroke="#56CCF2" stroke-width="3" stroke-linecap="round"/>
  <path d="M138 100 L118 100" stroke="#56CCF2" stroke-width="3" stroke-linecap="round"/>
  <path d="M100 138 L100 118" stroke="#56CCF2" stroke-width="3" stroke-linecap="round"/>
  <path d="M62 100 L82 100" stroke="#56CCF2" stroke-width="3" stroke-linecap="round"/>
  
  <path d="M112 88 L138 88" stroke="#2F80ED" stroke-width="2" opacity="0.6"/>
  <path d="M112 112 L138 112" stroke="#2F80ED" stroke-width="2" opacity="0.6"/>
  <path d="M88 88 L62 88" stroke="#2F80ED" stroke-width="2" opacity="0.6"/>
  <path d="M88 112 L62 112" stroke="#2F80ED" stroke-width="2" opacity="0.6"/>
  
  <circle cx="75" cy="75" r="4" fill="#56CCF2" opacity="0.8"/>
  <circle cx="125" cy="75" r="4" fill="#56CCF2" opacity="0.8"/>
  <circle cx="125" cy="125" r="4" fill="#56CCF2" opacity="0.8"/>
  <circle cx="75" cy="125" r="4" fill="#56CCF2" opacity="0.8"/>
</svg>
