export const articleId='the-ai-trick-that-works-by-refusing-to-help-you';
export const articleSlugs={en:articleId,cs:'ai-ktera-pomaha-tim-ze-neporadi'};
export const articleSlug=(locale,id)=>Object.values(articleSlugs).includes(id)?articleSlugs[locale]:id;
