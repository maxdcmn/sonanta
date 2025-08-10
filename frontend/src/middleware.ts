import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/auth/callback' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/auth/callback') {
    const code = searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
        supabaseResponse.cookies.getAll().forEach((c) => {
          redirectResponse.cookies.set(c);
        });
        return redirectResponse;
      }
    }
  }

  if (pathname === '/reset-password') {
    const code = searchParams.get('code');
    if (code && !user) {
      await supabase.auth.exchangeCodeForSession(code).catch(() => undefined);
    }
  }

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/voice');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/auth/callback';

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && user) {
    if (pathname === '/reset-password') {
      const token = searchParams.get('token') || searchParams.get('code');
      if (!token) {
        return NextResponse.redirect(new URL('/voice/notes', request.url));
      }
    } else {
      return NextResponse.redirect(new URL('/voice/notes', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
