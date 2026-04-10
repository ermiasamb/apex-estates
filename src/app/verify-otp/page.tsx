import { VerifyOtpForm } from '@/components/auth/VerifyOtpForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VerifyOtpPage() {
  return (
    <div className="container flex items-center justify-center py-20 min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Verify Your Account</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyOtpForm />
        </CardContent>
      </Card>
    </div>
  );
}
