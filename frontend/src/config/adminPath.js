// Path is base64-encoded — decoded at runtime so the literal never appears in the bundle.
const _r = import.meta.env.VITE_RP;
export const ADMIN = _r ? atob(_r) : 'admin';
