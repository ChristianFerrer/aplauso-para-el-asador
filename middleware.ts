import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Keep middleware minimal: only handle i18n routing.
// Auth protection is done inside each page via supabase.auth.getUser().
// @supabase/ssr uses Node.js APIs incompatible with Edge Runtime.
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
