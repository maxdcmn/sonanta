'use client';
import { useState } from 'react';
import { LoginForm } from '@/app/(public)/login/login-form';
import { ForgotPasswordForm } from '@/app/(public)/login/forgot-password-form';

export default function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);

  return showForgot ? (
    <ForgotPasswordForm onBack={() => setShowForgot(false)} />
  ) : (
    <LoginForm onForgotPassword={() => setShowForgot(true)} />
  );
}
