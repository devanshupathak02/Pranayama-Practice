import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = (req.headers.get('host') || '').toLowerCase();

  // Detect App Subdomain (app.pranayamatimes.org or timer.pranayamatimes.org)
  // Also supports ?subdomain=app or header x-subdomain for testing and preview verification
  const isAppSubdomain =
    host.startsWith('app.') ||
    host.startsWith('timer.') ||
    url.searchParams.get('subdomain') === 'app' ||
    req.headers.get('x-subdomain') === 'app';

  // 1. APP SUBDOMAIN ROUTING (https://app.pranayamatimes.org)
  if (isAppSubdomain) {
    // 1. App Subdomain Root: Rewrite / to /practice (the dedicated timer app)
    if (url.pathname === '/') {
      const rewriteUrl = url.clone();
      rewriteUrl.pathname = '/practice';
      rewriteUrl.searchParams.set('_rewritten', '1');
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('x-subdomain', 'app');
      return response;
    }

    // 2. App Subdomain /practice: Redirect external direct visits to / (clean root timer URL)
    if (url.pathname === '/practice' && !url.searchParams.has('_rewritten')) {
      const cleanUrl = url.clone();
      cleanUrl.pathname = '/';
      return NextResponse.redirect(cleanUrl, 301);
    }

    // Redirect marketing content accidentally requested on app subdomain to the main website
    const marketingPaths = ['/learn', '/journal', '/about', '/contact', '/retreats', '/events'];
    if (marketingPaths.some((p) => url.pathname.startsWith(p))) {
      const mainSite = process.env.NEXT_PUBLIC_SITE_URL || 'https://pranayamatimes.org';
      return NextResponse.redirect(`${mainSite}${url.pathname}${url.search}`, 302);
    }

    const response = NextResponse.next();
    response.headers.set('x-subdomain', 'app');
    return response;
  }

  // 2. MAIN WEBSITE ROUTING (https://pranayamatimes.org)
  // Normal marketing routes pass through natively
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public audio, images, icons
     */
    '/((?!_next/static|_next/image|favicon.ico|audio/|images/|icons/).*)',
  ],
};
