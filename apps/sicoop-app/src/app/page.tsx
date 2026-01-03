import { redirect } from 'next/navigation';
import SicoopDashboard from '@/components/SicoopDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

interface HomeProps {
  searchParams: Promise<{
    token?: string;
    token_hash?: string;
    type?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Intercept Supabase recovery links
  const params = await searchParams;
  const token = params.token || params.token_hash;
  
  if (token && params.type === 'recovery') {
    const urlParams = new URLSearchParams({
      token_hash: token,
      type: 'recovery',
      next: '/auth/reset-password',
    });
    redirect(`/auth/confirm?${urlParams.toString()}`);
  }

  return (
    <ProtectedRoute>
      <SicoopDashboard />
    </ProtectedRoute>
  );
}
