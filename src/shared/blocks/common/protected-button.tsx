'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authClient, useSession } from '@/core/auth/client';
import { Button } from '@/shared/components/ui/button';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import { SmartIcon } from '@/shared/blocks/common';

import { SignModal } from '@/shared/blocks/sign/sign-modal';

interface ProtectedButtonProps {
  url?: string;
  icon?: string;
  title: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  className?: string;
  target?: string;
}

export function ProtectedButton({
  url,
  icon,
  title,
  size = 'default',
  variant = 'default',
  className,
  target = '_self',
}: ProtectedButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { setIsShowSignModal } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (!mounted || isPending) return;

    if (session?.user) {
      // User is logged in, navigate to inspections page
      router.push('/inspections');
    } else {
      // User is not logged in, show sign modal with callback
      setIsShowSignModal(true);
    }
  };

  // Show loading state while checking auth
  if (!mounted || isPending) {
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        disabled
      >
        <span className="opacity-0">{title}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={handleClick}
      >
        {icon && <SmartIcon name={icon} className="size-4" />}
        <span>{title}</span>
      </Button>
      <SignModal callbackUrl="/inspections" />
    </>
  );
}
