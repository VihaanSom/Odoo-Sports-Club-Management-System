import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({
  className,
  alt = 'Champions Club Logo',
}: LogoProps) => {
  return (
    <img
      src="/favicon.svg"
      alt={alt}
      className={cn('size-7 object-contain select-none', className)}
    />
  );
};

export default Logo;
