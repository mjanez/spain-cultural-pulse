import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function Tooltip({ content, children, side = 'top', align = 'start' }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger 
          asChild
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
          onPointerDown={(e) => {
            // Prevenir comportamiento por defecto en touch
            if (e.pointerType === 'touch') {
              e.preventDefault();
            }
          }}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            onPointerDownOutside={() => setOpen(false)}
            className="z-50 max-w-xs overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs text-gray-300 shadow-xl break-words animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
