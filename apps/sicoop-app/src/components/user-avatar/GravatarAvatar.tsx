'use client';

import Image from 'next/image';
import { ReactNode, useEffect, useMemo, useState } from 'react';

interface GravatarAvatarProps {
  email?: string | null;
  fallback: ReactNode;
  size?: number;
  alt?: string;
  className?: string;
}

export function GravatarAvatar({
  email,
  fallback,
  size = 40,
  alt = 'Avatar do usuário',
  className,
}: GravatarAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setAvatarUrl(null);
      return;
    }

    let isMounted = true;
    const fetchAvatar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/gravatar/avatar?email=${encodeURIComponent(email)}`);
        if (!isMounted) return;

        if (response.ok) {
          const data: { avatarUrl: string | null } = await response.json();
          setAvatarUrl(data.avatarUrl);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Erro ao buscar avatar do Gravatar:', error);
        if (isMounted) {
          setAvatarUrl(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAvatar();

    return () => {
      isMounted = false;
    };
  }, [email]);

  const sizedAvatarUrl = useMemo(() => {
    if (!avatarUrl) return null;
    if (!size) return avatarUrl;

    try {
      const url = new URL(avatarUrl);
      url.searchParams.set('size', String(size));
      return url.toString();
    } catch {
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}size=${size}`;
    }
  }, [avatarUrl, size]);

  if (!email || loading) {
    return <>{fallback}</>;
  }

  if (!avatarUrl) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={sizedAvatarUrl || avatarUrl}
      alt={alt}
      width={size}
      height={size}
      className={className || 'avatar-image'}
    />
  );
}
