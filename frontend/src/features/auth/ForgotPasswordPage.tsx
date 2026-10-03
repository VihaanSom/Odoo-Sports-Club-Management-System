import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  FaTrophy,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
  FaRotateRight,
} from 'react-icons/fa6';
import { Card, CardBody, Button } from '@/components/ui';
import { OtpInput, PasswordStrength } from './components';
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  type ForgotPasswordEmailDto,
  type ResetPasswordDto,
} from '@/types';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export const ForgotPasswordPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [userEmail, setUserEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Form for Step 1: Email
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordEmailDto>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  // Form for Step 3: New Password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<ResetPasswordDto>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watchPassword('newPassword');

  // Step 1: Submit Email
  const onEmailSubmit = async (data: ForgotPasswordEmailDto) => {
    setIsSendingCode(true);
    setInfoMessage(null);

    try {
      const res = await authService.requestPasswordReset(data.email);
      setUserEmail(data.email);
      setInfoMessage(res.message);
      toast.success('Reset code requested!');
      setResendCooldown(30);

      // Start resend countdown
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Move to Step 2
      setCurrentStep(2);
    } catch {
      toast.error('Could not process request. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP code');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await authService.verifyOtp(userEmail, otpValue);
      if (res.verified) {
        toast.success('OTP code verified successfully!');
        setCurrentStep(3);
      } else {
        setOtpError(res.message || 'Verification failed. Please enter valid code (use 123456).');
        toast.error('Invalid OTP code');
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !userEmail) return;
    try {
      await authService.requestPasswordReset(userEmail);
      toast.success('A new OTP has been sent!');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error('Failed to resend OTP.');
    }
  };

  // Step 3: Submit New Password
  const onPasswordSubmit = async (data: ResetPasswordDto) => {
    setIsResettingPassword(true);

    try {
      await authService.resetPassword(userEmail, data.newPassword);
      toast.success('Password updated successfully! Please sign in with your new password.', {
        duration: 4500,
      });

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto my-6"
    >
      {/* Brand Header with Trophy Logo */}
      <div className="text-center mb-6">
        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mx-auto mb-3">
          <FaTrophy className="size-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
          Reset Password
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Champions Club account recovery
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        <ul className="steps steps-horizontal w-full text-xs font-semibold">
          <li className={cn('step', currentStep >= 1 && 'step-primary')}>Email</li>
          <li className={cn('step', currentStep >= 2 && 'step-primary')}>Verify OTP</li>
          <li className={cn('step', currentStep >= 3 && 'step-primary')}>New Password</li>
        </ul>
      </div>

      <Card className="border border-base-300 shadow-xl bg-base-100">
        <CardBody className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* ========================================================= */}
            {/* STEP 1: Ask for Email                                     */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4">
                  <h3 className="font-black text-base text-base-content">Forgot your password?</h3>
                  <p className="text-xs text-base-content/70 mt-1">
                    Enter the email address registered with your club account.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
                  <div className="fieldset w-full">
                    <label className="fieldset-label font-medium text-xs text-base-content/80">
                      Registered Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. member@championsclub.com"
                      autoFocus
                      className={cn(
                        'input input-bordered w-full text-sm',
                        emailErrors.email && 'input-error'
                      )}
                      {...registerEmail('email')}
                    />
                    {emailErrors.email && (
                      <span className="text-error text-xs mt-1">{emailErrors.email.message}</span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold shadow-md shadow-primary/20"
                    isLoading={isSendingCode}
                    rightIcon={<FaArrowRight className="size-4" />}
                  >
                    Send Verification OTP
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: Enter OTP & Verify                                */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Notice message per user prompt */}
                <div className="rounded-xl border border-info/30 bg-info/10 p-3.5 flex items-start gap-3">
                  <FaKey className="size-4 text-info mt-0.5 shrink-0" />
                  <div className="text-xs text-base-content/80">
                    <p className="font-semibold text-info">
                      {infoMessage || 'If an account exists with this email address, we have sent a 6-digit OTP code.'}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-base-content/70">
                      Sent to: <span className="font-bold">{userEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-black text-base text-base-content">Enter Verification Code</h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    Enter the 6-digit OTP. Demo code: <span className="badge badge-neutral badge-xs font-mono font-bold">123456</span>
                  </p>
                </div>

                <form onSubmit={onVerifyOtp} className="space-y-4">
                  <div className="py-2">
                    <OtpInput
                      value={otpValue}
                      onChange={(val) => {
                        setOtpValue(val);
                        if (otpError) setOtpError(null);
                      }}
                      hasError={Boolean(otpError)}
                      disabled={isVerifyingOtp}
                    />
                  </div>

                  {otpError && (
                    <div className="rounded-lg bg-error/10 border border-error/20 p-2.5 flex items-center gap-2 text-xs text-error font-medium animate-in fade-in">
                      <FaCircleExclamation className="size-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold shadow-md shadow-primary/20"
                    isLoading={isVerifyingOtp}
                    rightIcon={<FaCircleCheck className="size-4" />}
                  >
                    Verify OTP Code
                  </Button>

                  {/* Resend & Change Email Actions */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-base-content/60 hover:text-base-content inline-flex items-center gap-1"
                    >
                      <FaArrowLeft className="size-3" />
                      <span>Change email</span>
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className={cn(
                        'inline-flex items-center gap-1 font-semibold',
                        resendCooldown > 0
                          ? 'text-base-content/40 cursor-not-allowed'
                          : 'text-primary hover:underline'
                      )}
                    >
                      <FaRotateRight className="size-3" />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: Enter New Password, Confirm Password              */}
            {/* ========================================================= */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Verified success notification banner */}
                <div className="rounded-xl border border-success/30 bg-success/10 p-3 flex items-center gap-3">
                  <FaCircleCheck className="size-4 text-success shrink-0" />
                  <span className="text-xs text-success font-bold">
                    OTP verified. Create your new password below.
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="font-black text-base text-base-content">Create New Password</h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    At least 8 characters with letters and numbers.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div className="fieldset w-full">
                    <label className="fieldset-label font-medium text-xs text-base-content/80">
                      New Password <span className="text-error">*</span>
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="At least 8 chars"
                        className={cn(
                          'input input-bordered w-full text-sm pr-10',
                          passwordErrors.newPassword && 'input-error'
                        )}
                        {...registerPassword('newPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                        aria-label="Toggle password"
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="size-3.5" />
                        ) : (
                          <FaEye className="size-3.5" />
                        )}
                      </button>
                    </div>
                    <PasswordStrength password={newPasswordValue} />
                    {passwordErrors.newPassword && (
                      <span className="text-error text-xs mt-1">
                        {passwordErrors.newPassword.message}
                      </span>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="fieldset w-full">
                    <label className="fieldset-label font-medium text-xs text-base-content/80">
                      Confirm New Password <span className="text-error">*</span>
                    </label>
                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat new password"
                        className={cn(
                          'input input-bordered w-full text-sm pr-10',
                          passwordErrors.confirmPassword && 'input-error'
                        )}
                        {...registerPassword('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                        aria-label="Toggle confirm password"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="size-3.5" />
                        ) : (
                          <FaEye className="size-3.5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <span className="text-error text-xs mt-1">
                        {passwordErrors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold shadow-md shadow-primary/20"
                    isLoading={isResettingPassword}
                    rightIcon={<FaCircleCheck className="size-4" />}
                  >
                    Reset Password & Sign In
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>

      {/* Footer Navigation Link */}
      <div className="text-center mt-6">
        <Link
          to="/login"
          className="text-xs font-semibold text-base-content/70 hover:text-primary inline-flex items-center gap-1.5 transition-colors"
        >
          <FaArrowLeft className="size-3" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
