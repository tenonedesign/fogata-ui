// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production

// update 12/22, approved pools are dynamically loaded, so I think this needs to be false now
export const prerender = false;
