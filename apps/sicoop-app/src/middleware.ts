import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders, getCorsHeaders } from './lib/security-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestOrigin = request.headers.get('origin') || '';
  
  // Criar resposta base
  let response: NextResponse;
  
  // Tratar requisições OPTIONS (preflight CORS)
  if (request.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 200 });
    response = applyCorsHeaders(response, requestOrigin);
    return response;
  }
  
  // Para requisições de API, aplicar CORS
  if (pathname.startsWith('/api/')) {
    response = NextResponse.next();
    response = applyCorsHeaders(response, requestOrigin);
  } else {
    // Para outras requisições, apenas aplicar headers de segurança
    response = NextResponse.next();
  }
  
  // Aplicar headers de segurança em todas as respostas
  response = applySecurityHeaders(response);
  
  return response;
}

// Função para aplicar headers de segurança
function applySecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Função para aplicar headers de CORS
function applyCorsHeaders(response: NextResponse, origin: string): NextResponse {
  const corsHeaders = getCorsHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon files
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
