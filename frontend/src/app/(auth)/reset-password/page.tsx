import { ResetPasswordForm } from '@/app/(auth)/reset-password/reset-password-form';
function ResetPasswordError() {
  return (
    <div className="flex items-center justify-center pb-20">
      <p>Invalid or missing token.</p>
    </div>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; code?: string }>;
}) {
  const { code, token } = await searchParams;

  if (!code && !token) return <ResetPasswordError />;

  return <ResetPasswordForm token={token || code || ''} />;
}
