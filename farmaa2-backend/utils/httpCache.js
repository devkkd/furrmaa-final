/** Short CDN/browser cache for public GET responses */
export function setPublicCache(res, seconds = 300) {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=60`);
}

export function cachePublic(seconds = 300) {
  return (req, res, next) => {
    if (req.method === 'GET') setPublicCache(res, seconds);
    next();
  };
}
