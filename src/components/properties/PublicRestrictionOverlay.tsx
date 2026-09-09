'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PublicRestrictionOverlayProps {
  children?: React.ReactNode;
  message?: string;
  showContent?: boolean;
}

export function PublicRestrictionOverlay({
  children,
  message = 'Sign in to view this information',
  showContent = false,
}: PublicRestrictionOverlayProps) {
  return (
    <div className="relative">
      {children && (
        <div className={showContent ? '' : 'blur-sm opacity-30 pointer-events-none select-none'}>
          {children}
        </div>
      )}
      {!showContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-2">
          <div className="bg-card/95 backdrop-blur rounded-xl shadow-sm border p-3 md:p-4 max-w-sm w-full text-center space-y-4 flex cols-2 items-center  gap-3">
            <div className="w-10 h-10 p-2 rounded-full bg-primary/10 flex  ">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div  className="flex-4">
              <div  className="flex flex-col  items-start text-start">
                <h3 className="font-headline font-semibold text-lg">
                  Login for Free to Access
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {message}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline"  size="sm" className="flex-1">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}