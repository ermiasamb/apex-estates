'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(result.message);
        toast({
          title: 'Email Verified',
          description: result.message,
        });
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.');
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: error.message,
        });
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <div className="container flex items-center justify-center py-20 min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your email has been successfully verified.'}
            {status === 'error' && 'We encountered an issue verifying your email.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            )}
          </div>

          <p className="text-muted-foreground mb-6">{message}</p>

          {status === 'success' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Proceed to Login
            </Button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                If you need a new verification link, please log in and request a new one from your account settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
