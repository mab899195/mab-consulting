import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  rangeClassName?: string
  thumbClassName?: string
}

function Slider({ className, rangeClassName, thumbClassName, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-zinc-800">
        <SliderPrimitive.Range
          className={cn('absolute h-full bg-indigo-500', rangeClassName)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-[14px] w-[14px] rounded-full border-2 border-indigo-500 bg-zinc-950 shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 hover:scale-110',
          thumbClassName
        )}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
