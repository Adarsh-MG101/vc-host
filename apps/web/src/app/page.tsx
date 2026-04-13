'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/ui/Header';
import { Footer } from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { AuthCard } from '../components/ui/AuthCard';
import { authService } from '../services/auth.service';
import { validators } from '../utils/validators';

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (response.user.role === 'superadmin') {
        throw new Error('Login failed. Please check your credentials.');
      }

      router.push('/organization/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900 overflow-hidden relative">
      <Header hideNav={true} />
      
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl "
        >
          <AuthCard 
            variant="orange"
            title="Welcome !"
            subtitle="Sign in to your VerifyCerts account"
            buttonText="Login"
            linkText=""
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
