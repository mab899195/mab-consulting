import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-md shadow-[0_4px_32px_rgba(0,0,0,0.4)] text-zinc-100',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  )
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-semibold leading-none tracking-tight text-zinc-100', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent }
