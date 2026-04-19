'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';

interface ProtectedButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProtectedButton({ href, children, className }: ProtectedButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  function handleClick() {
    if (session?.user) {
      router.push(href);
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
      <LoginModal open={showModal} onClose={() => setShowModal(false)} redirectTo={href} />
    </>
  );
}
