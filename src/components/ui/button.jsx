import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:   'bg-[#50cfff] text-[#01172b] hover:bg-[#7cdbff]',
        secondary: 'bg-[#1a2a3a] text-slate-200 hover:bg-[#243347] border border-[#2a3a4a]',
        ghost:     'text-slate-400 hover:text-slate-200 hover:bg-[#1a2a3a]',
        outline:   'border border-[#2a3a4a] text-slate-300 hover:bg-[#1a2a3a]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-11 md:h-9 px-4 py-2',
        sm:      'h-7 px-3 text-xs',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export function Button({ className, variant, size, children, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
