import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  // Negative-lookahead strictly excludes static assets and icons,
  // preventing compute burn, while aggressively locking down all UI and /api endpoints.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export function proxy(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    const expectedUser = process.env.ADMIN_USERNAME
    const expectedPwd = process.env.ADMIN_PASSWORD

    if (
      expectedUser &&
      expectedPwd &&
      user === expectedUser &&
      pwd === expectedPwd
    ) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}
