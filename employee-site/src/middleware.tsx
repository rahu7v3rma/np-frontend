import { NextRequest, NextResponse } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';

import { AUTH_KEY } from './utils/const';

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'he'],
  defaultLocale: 'he',
  urlMappingStrategy: 'rewrite',
  resolveLocaleFromRequest: (request) => {
    // this determines the language when an uncommitted request (aka the user
    // hasn't set their language yet) arrives and the i18n middleware will by
    // default try to match the locale to the one set on the user's computer.
    // instead, we just wat the default locale to always be Hebrew
    return 'he';
  },
});

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, origin } = nextUrl;

  if (
    request.nextUrl.pathname.startsWith(
      '/.well-known/apple-developer-merchantid-domain-association',
    )
  ) {
    if (process.env.NEXT_PUBLIC_GROW_PROD) {
      return NextResponse.rewrite(
        new URL('/.well-known/prod-apple-domain-verification.txt', request.url),
      );
    } else {
      return NextResponse.rewrite(
        new URL('/.well-known/test-apple-domain-verification.txt', request.url),
      );
    }
  }

  const campaign_code = request.cookies.get('campaign_code')?.value;

  // Redirect to root page if user is not authenticated
  const publicRoutesRegex = [
    // Login route
    /\/*\/[epai]$/,
    // Product route
    /\/.*\/product\/.*$/,
  ];
  if (!campaign_code && ['', '/'].indexOf(pathname) > -1) {
    return I18nMiddleware(request);
  }

  if (
    !campaign_code &&
    !publicRoutesRegex.some((reg) => reg.test(nextUrl.pathname))
  ) {
    return NextResponse.redirect(new URL('/', origin));
  }

  // only insert the campaign code if the client is browsing the root page
  // without any valid path
  if (campaign_code?.match(/[A-Za-z0-9]/) && ['', '/'].indexOf(pathname) > -1) {
    let redirect_path = campaign_code;
    try {
      if (pathname?.match(/^\/(en|he)/)) {
        const [_, lang, ...rest_path] = pathname?.split('/');
        redirect_path = lang + '/' + campaign_code + '/' + rest_path?.join('/');
      } else {
        redirect_path = campaign_code + pathname;
      }
    } catch {}
    return NextResponse.redirect(new URL(redirect_path, origin));
  }
  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    '/(.well-known/.*)',
    '/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)',
  ],
};
