import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (static files)
    // - _vercel (Vercel specifics)
    // - All files in the public folder (e.g. favicon.ico)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match all pathnames within a locale, even those with a dot
    '/(zh|en)/:path*',
    // Explicitly match the root
    '/'
  ]
};

