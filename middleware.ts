import { clerkMiddleware } from '@clerk/nextjs/server'

// Use Clerk middleware in non-blocking mode.
// Auth state is attached to the request for client-side
// SignedIn/SignedOut components to use, but unauthenticated
// requests are NOT blocked at the server level.
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
