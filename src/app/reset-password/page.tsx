import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense } from 'react';

function ResetPasswordContent() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">Reset Your Password</CardTitle>
        <CardDescription>
          Choose a new, strong password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center py-20 min-h-[calc(100vh-200px)]">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
