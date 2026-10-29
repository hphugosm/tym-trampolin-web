// The review Site keeps its own metadata. The production package rewrites this
// exact origin to productionOrigin while preserving standalone games and admin.
export const previewOrigin='https://tym-trampolin-editorial.woodsy-toast-3721.chatgpt.site';
export const productionOrigin='https://tymtrampolin.cz';
export const siteOrigin=(process.env.SITE_ORIGIN || previewOrigin).replace(/\/$/,'');
