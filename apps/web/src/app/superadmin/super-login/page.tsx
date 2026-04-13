'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '../../../services/auth.service';
import { AuthCard } from '../../../components/ui/AuthCard';
import { validators } from '../../../utils/validators';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Initial Form Validation
    if (!validators.validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.user.role !== 'superadmin') {
        throw new Error('Unauthorized: This portal is for superadmins only.');
      }

      router.push('/superadmin/organizations');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative z-10 selection:bg-orange-100 selection:text-orange-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <AuthCard 
          variant="navy"
          title="Super Admin"
          subtitle="Sign in to your VerifyCerts account"
          buttonText="Login"
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      </motion.div>
    </main>
  );
}
