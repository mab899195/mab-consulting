import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1 gap-0.5',
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold text-zinc-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_2px_8px_rgba(99,102,241,0.25)]',
        'hover:text-zinc-300',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('focus-visible:outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
