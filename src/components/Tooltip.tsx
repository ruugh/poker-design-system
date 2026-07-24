import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactElement } from 'react';
import './tooltip.css';

export interface TooltipProps {
  label: string;
  children: ReactElement;
  /** delay before showing on hover, ms */
  delayDuration?: number;
}

// Hover + focus triggering, open delay, collision-aware positioning and aria-describedby
// are handled by Radix Tooltip. Keyboard users get it on focus; touch is handled too.
export function Tooltip({ label, children, delayDuration = 200 }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="pm-tooltip__bubble" sideOffset={6}>
            {label}
            <RadixTooltip.Arrow className="pm-tooltip__arrow" width={10} height={5} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
