import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
export type ButtonVariantsType = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

export const buttonVariants = cva(
  'font-sans inline-flex flex-shrink-0 items-center justify-center whitespace-nowrap rounded-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 duration-300',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/60',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/50 disabled:hover:bg-destructive',
        outline: 'bg-accent border border-accent text-text hover:border-text',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/60',
        ghost:
          'border border-secondary dark:border-dark_secondary text-text dark:text-dark_text hover:bg-secondary dark:hover:bg-primary hover:text-dark_text dark:hover:text-dark_text',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-9 px-5 text-sm',
        lg: 'h-11 px-8 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}>
        <div className="relative flex items-center justify-center">
          {loading && <Loader2 className="absolute m-2 h-6 w-6 animate-spin" />}
          <span className={loading ? 'invisible' : ''}>{children}</span>
        </div>
      </Comp>
    );
  }
);

Button.displayName = 'Button';
