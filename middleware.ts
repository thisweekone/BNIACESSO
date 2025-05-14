import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica se existe o cookie de sessão do Supabase
  const hasSession = request.cookies.has('sb-access-token') || request.cookies.has('sb:token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!hasSession && !isAuthPage) {
    // Redireciona para login se não estiver autenticado
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Permite acesso normalmente
  return NextResponse.next();
}

// Defina as rotas privadas que devem ser protegidas
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/referencias/:path*',
    '/membros/:path*',
    '/perfil/:path*',
    '/mapa/:path*',
    '/reunioes/:path*',
    '/casos-sucesso/:path*',
    '/configuracoes/:path*'
  ],
};