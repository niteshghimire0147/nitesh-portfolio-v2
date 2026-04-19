// The admin path is stored as char codes — the actual URL string never
// appears as a literal anywhere in the source or built bundle.
const _r = import.meta.env.VITE_RP;
export const ADMIN = _r
  ? _r.split(',').map(Number).map(c => String.fromCharCode(c)).join('')
  : 'admin'; // safe fallback — real security is JWT + 2FA, not path obscurity
