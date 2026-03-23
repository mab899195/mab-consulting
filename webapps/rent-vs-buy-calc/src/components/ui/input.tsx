import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
