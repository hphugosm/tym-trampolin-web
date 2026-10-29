/** Landing routes are rendered separately; locale is stable for this document. */
export const locale = window.location.pathname.startsWith("/cs/") ? "cs" : "en";
export const t = (cs: string, en: string): string => locale === "cs" ? cs : en;
