import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaArrowLeft,
  FaArrowRightToBracket,
} from 'react-icons/fa6';
import { Card, CardBody, Button, DatePicker, Logo } from '@/components/ui';
import { TierSelector, PaymentMethodSection, PasswordStrength } from './components';
import { signupSchema, type SignupDto, MEMBERSHIP_TIERS } from '@/types';
import { authService } from '@/services/authService';
import { INDIAN_STATES } from '@/config/indiaStates';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type SignupStep = 1 | 2 | 3;

export const SignupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SignupDto>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '2000-01-01',
      password: '',
      confirmPassword: '',
      addrLine1: '',
      addrLine2: '',
      city: '',
      state: 'Gujarat',
      pincode: '',
      tier: 'Gold',
      paymentMethod: 'cash',
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardCvv: '',
    },
  });

  const selectedTier = watch('tier');
  const selectedPaymentMethod = watch('paymentMethod');
  const passwordValue = watch('password');
  const cardNumberValue = watch('cardNumber');
  const cardHolderValue = watch('cardHolder');
  const cardExpiryValue = watch('cardExpiry');
  const cardCvvValue = watch('cardCvv');

  const currentTierInfo = MEMBERSHIP_TIERS.find((t) => t.id === selectedTier) || MEMBERSHIP_TIERS[0];

  // Navigate to next step after validating current step fields
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger([
        'firstName',
        'lastName',
        'email',
        'phone',
        'dob',
        'password',
        'confirmPassword',
      ]);
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await trigger(['addrLine1', 'city', 'state', 'pincode']);
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SignupStep);
    }
  };

  const onSubmit = async (data: SignupDto) => {
    setIsLoading(true);

    try {
      const { user, token } = await authService.signup(data);
      login(user, token);
      toast.success(`Welcome to Champions Club, ${user.name}!`);

      if (data.paymentMethod === 'cash') {
        toast('Your membership is active! Please settle cash at counter.', {
          icon: 'ℹ️',
          duration: 4000,
        });
      } else if (data.paymentMethod === 'upi') {
        toast.success('UPI Payment recorded successfully!');
      } else {
        toast.success('Card processed successfully!');
      }

      // Redirect to dashboard
      navigate('/', { replace: true });
    } catch {
      toast.error('Registration failed. Please check form fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    1: 'Personal & Account Details',
    2: 'Address Details',
    3: 'Membership Tier & Payment',
  };

  const progressPercentage = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto my-6"
    >
      {/* Brand Header with Trophy Logo */}
      <div className="text-center mb-6">
        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm mx-auto mb-3">
          <Logo className="size-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
          Join Champions Club
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Create your member profile and activate club membership
        </p>
      </div>

      <Card className="border border-base-300 shadow-xl bg-base-100">
        <CardBody className="p-6 sm:p-8">
          {/* Incremental Progress Bar at the Top */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-base-content">
                Step {currentStep} of 3: {stepTitles[currentStep]}
              </span>
              <span className="font-mono text-base-content/60 font-semibold">{progressPercentage}%</span>
            </div>
            <progress
              className="progress progress-primary w-full h-2 rounded-full"
              value={progressPercentage}
              max="100"
            />

            {/* Step Indicators */}
            <div className="grid grid-cols-3 text-[11px] font-semibold text-center pt-1 text-base-content/60">
              <span className={cn(currentStep >= 1 && 'text-primary font-bold')}>1. Account</span>
              <span className={cn(currentStep >= 2 && 'text-primary font-bold')}>2. Address</span>
              <span className={cn(currentStep >= 3 && 'text-primary font-bold')}>3. Tier & Pay</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* ========================================================= */}
              {/* STEP 1: Personal and Account Details                      */}
              {/* ========================================================= */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        First Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John"
                        className={cn(
                          'input input-bordered w-full text-sm',
                          errors.firstName && 'input-error'
                        )}
                        {...register('firstName')}
                      />
                      {errors.firstName && (
                        <span className="text-error text-xs mt-1">{errors.firstName.message}</span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Last Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hackathon"
                        className={cn(
                          'input input-bordered w-full text-sm',
                          errors.lastName && 'input-error'
                        )}
                        {...register('lastName')}
                      />
                      {errors.lastName && (
                        <span className="text-error text-xs mt-1">{errors.lastName.message}</span>
                      )}
                    </div>

                    {/* Email Address */}
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

                    {/* Phone */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        className={cn(
                          'input input-bordered w-full text-sm',
                          errors.phone && 'input-error'
                        )}
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <span className="text-error text-xs mt-1">{errors.phone.message}</span>
                      )}
                    </div>

                    {/* Date of Birth with Modern DatePicker */}
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date of Birth (DOB)"
                          required
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select date of birth"
                          maxDate={new Date().toISOString().split('T')[0]}
                          error={errors.dob?.message}
                          className="sm:col-span-2"
                        />
                      )}
                    />

                    {/* Password */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Password <span className="text-error">*</span>
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 chars"
                          className={cn(
                            'input input-bordered w-full text-sm pr-10',
                            errors.password && 'input-error'
                          )}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                          aria-label="Toggle password"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="size-3.5" />
                          ) : (
                            <FaEye className="size-3.5" />
                          )}
                        </button>
                      </div>
                      <PasswordStrength password={passwordValue} />
                      {errors.password && (
                        <span className="text-error text-xs mt-1">{errors.password.message}</span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Confirm Password <span className="text-error">*</span>
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat password"
                          className={cn(
                            'input input-bordered w-full text-sm pr-10',
                            errors.confirmPassword && 'input-error'
                          )}
                          {...register('confirmPassword')}
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
                      {errors.confirmPassword && (
                        <span className="text-error text-xs mt-1">
                          {errors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNextStep}
                      rightIcon={<FaArrowRight className="size-4" />}
                      className="font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 2: Address Details                                   */}
              {/* ========================================================= */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Address Line 1 */}
                    <div className="fieldset w-full sm:col-span-2">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Address Line 1 <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="House / Flat / Street Name"
                        className={cn(
                          'input input-bordered w-full text-sm',
                          errors.addrLine1 && 'input-error'
                        )}
                        {...register('addrLine1')}
                      />
                      {errors.addrLine1 && (
                        <span className="text-error text-xs mt-1">{errors.addrLine1.message}</span>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div className="fieldset w-full sm:col-span-2">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Apartment, suite, landmark, floor"
                        className="input input-bordered w-full text-sm"
                        {...register('addrLine2')}
                      />
                    </div>

                    {/* City */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        City <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        className={cn(
                          'input input-bordered w-full text-sm',
                          errors.city && 'input-error'
                        )}
                        {...register('city')}
                      />
                      {errors.city && (
                        <span className="text-error text-xs mt-1">{errors.city.message}</span>
                      )}
                    </div>

                    {/* State Dropdown */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        State / UT <span className="text-error">*</span>
                      </label>
                      <select
                        className={cn(
                          'select select-bordered w-full text-sm',
                          errors.state && 'select-error'
                        )}
                        {...register('state')}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="text-error text-xs mt-1">{errors.state.message}</span>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="fieldset w-full">
                      <label className="fieldset-label font-medium text-xs text-base-content/80">
                        Pincode (6 Digits) <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className={cn(
                          'input input-bordered w-full font-mono text-sm',
                          errors.pincode && 'input-error'
                        )}
                        {...register('pincode')}
                      />
                      {errors.pincode && (
                        <span className="text-error text-xs mt-1">{errors.pincode.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      leftIcon={<FaArrowLeft className="size-3.5" />}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNextStep}
                      rightIcon={<FaArrowRight className="size-4" />}
                      className="font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 3: Membership Tier & Payment Options                 */}
              {/* ========================================================= */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Membership Tier */}
                  <Controller
                    name="tier"
                    control={control}
                    render={({ field }) => (
                      <TierSelector
                        selectedTier={field.value}
                        onSelectTier={(tier) => field.onChange(tier)}
                        error={errors.tier?.message}
                      />
                    )}
                  />

                  {/* Payment Method */}
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <PaymentMethodSection
                        selectedMethod={field.value}
                        onSelectMethod={(method) => field.onChange(method)}
                        selectedTier={selectedTier}
                        cardNumber={cardNumberValue}
                        onCardNumberChange={(val) => setValue('cardNumber', val, { shouldValidate: true })}
                        cardHolder={cardHolderValue}
                        onCardHolderChange={(val) => setValue('cardHolder', val, { shouldValidate: true })}
                        cardExpiry={cardExpiryValue}
                        onCardExpiryChange={(val) => setValue('cardExpiry', val, { shouldValidate: true })}
                        cardCvv={cardCvvValue}
                        onCardCvvChange={(val) => setValue('cardCvv', val, { shouldValidate: true })}
                        cardErrors={{
                          cardNumber: errors.cardNumber?.message,
                          cardHolder: errors.cardHolder?.message,
                          cardExpiry: errors.cardExpiry?.message,
                          cardCvv: errors.cardCvv?.message,
                        }}
                        onSimulateUpiSuccess={() => {
                          toast.success('UPI Payment Simulated & Confirmed!');
                        }}
                      />
                    )}
                  />

                  <div className="pt-4 border-t border-base-200 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      leftIcon={<FaArrowLeft className="size-3.5" />}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="font-bold shadow-md shadow-primary/20"
                      isLoading={isLoading}
                      rightIcon={<FaArrowRight className="size-4" />}
                    >
                      {selectedPaymentMethod === 'cash'
                        ? `Complete Registration (Pay ₹${currentTierInfo.pricePerMonth.toLocaleString('en-IN')} at Counter)`
                        : `Pay ₹${currentTierInfo.pricePerMonth.toLocaleString('en-IN')} & Join Club`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardBody>
      </Card>

      {/* Footer Navigation Link */}
      <div className="text-center mt-6">
        <p className="text-xs text-base-content/70">
          Already a club member?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline inline-flex items-center gap-1 ml-0.5"
          >
            <FaArrowRightToBracket className="size-3" />
            <span>Sign In to Your Account</span>
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignupPage;
