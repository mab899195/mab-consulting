import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-600 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_rgba(99,102,241,0.2)] hover:bg-indigo-500',
        ghost:
          'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
        outline:
          'border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
        segment:
          'rounded-lg text-zinc-500 hover:text-zinc-200 data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:shadow-[0_0_0_1px_rgba(99,102,241,0.4)]',
      },
      size: {
        default: 'h-9 px-4',
        sm:      'h-7 px-3 text-xs',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
