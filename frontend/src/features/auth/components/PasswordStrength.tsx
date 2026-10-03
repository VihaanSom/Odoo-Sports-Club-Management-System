import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength = ({ password = '' }: PasswordStrengthProps) => {
  if (!password) return null;

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-error text-error', width: 'w-1/4' };
      case 2:
        return { label: 'Fair', color: 'bg-warning text-warning', width: 'w-2/4' };
      case 3:
        return { label: 'Good', color: 'bg-info text-info', width: 'w-3/4' };
      case 4:
        return { label: 'Strong', color: 'bg-success text-success', width: 'w-full' };
      default:
        return { label: 'Too short', color: 'bg-error text-error', width: 'w-1/12' };
    }
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-base-content/60">Password strength:</span>
        <span className={cn('font-bold', strength.color.split(' ')[1])}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', strength.color.split(' ')[0], strength.width)}
        />
      </div>
    </div>
  );
};
