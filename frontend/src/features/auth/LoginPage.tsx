import {  useState  } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import {
  FaArrowRightToBracket,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaKey,
} from 'react-icons/fa6';
import { Card, CardBody, Button, Logo } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { loginSchema, type LoginDto } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@championsclub.com',
      password: 'Admin@12345',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);

    try {
      const { user, token } = await authService.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      login(user, token);
      toast.success(`Welcome back, ${user.name || user.firstName || 'Member'}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (email: string, password = 'Admin@12345') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    toast.success(`Loaded credentials for ${email}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      {/* Brand Header with Trophy Logo */}
      <div className="text-center mb-6">
        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm mx-auto mb-3">
          <Logo className="size-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
          Champions Club
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Sign in to your member portal and club management system
        </p>
      </div>

      <Card className="border border-base-300 shadow-xl bg-base-100">
        <CardBody className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field without inner icon/padding */}
            <div className="fieldset w-full">
              <label className="fieldset-label font-medium text-xs text-base-content/80">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                placeholder="myemail@example.com"
                autoComplete="email"
                className={cn(
                  'input input-bordered w-full text-sm',
                  errors.email && 'input-error'
                )}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-error text-xs mt-1">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field without left padding */}
            <div className="fieldset w-full">
              <div className="flex items-center justify-between mb-1">
                <label className="fieldset-label font-medium text-xs text-base-content/80">
                  Password <span className="text-error">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'input input-bordered w-full text-sm pr-10',
                    errors.password && 'input-error'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="size-4" /> : <FaEye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-xs mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-xs rounded"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-base-content/70">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold shadow-md shadow-primary/20"
              isLoading={isLoading}
              rightIcon={<FaArrowRightToBracket className="size-4" />}
            >
              Sign In to Champions Club
            </Button>
          </form>

          {/* Demo Login Quick-Fill Helper */}
          <div className="mt-5 pt-4 border-t border-base-200">
            <div className="flex items-center gap-1.5 text-[11px] text-base-content/60 mb-2 font-medium">
              <FaKey className="size-3 text-primary" />
              <span>Quick Demo Sign In:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@championsclub.com', 'Admin@12345')}
                className="btn btn-xs btn-outline rounded-lg text-[10px] font-semibold"
              >
                Club Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('rahul.gold@championsclub.com', 'Member@12345')}
                className="btn btn-xs btn-outline rounded-lg text-[10px] font-semibold"
              >
                Gold Member
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer Navigation Link */}
      <div className="text-center mt-6">
        <p className="text-xs text-base-content/70">
          Don't have a club membership yet?{' '}
          <Link
            to="/signup"
            className="font-bold text-primary hover:underline inline-flex items-center gap-1 ml-0.5"
          >
            <FaUserPlus className="size-3" />
            <span>Join Now & Sign Up</span>
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
