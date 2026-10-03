import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { FaVolleyball, FaArrowRightToBracket } from 'react-icons/fa6';
import { Card, CardBody, Input, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@odoosports.club');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, token } = await authService.login({ email, password });
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch {
      toast.error('Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mx-auto mb-3">
          <FaVolleyball className="size-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Odoo Sports Club</h1>
        <p className="text-xs text-base-content/60 mt-1">Sign in to your administration portal</p>
      </div>

      <Card className="border border-base-300 shadow-xl">
        <CardBody>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Staff / Member Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<FaArrowRightToBracket className="size-4" />}
            >
              Sign In to Club ERP
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
