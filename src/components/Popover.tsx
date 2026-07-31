import * as RadixPopover from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import './popover.css';

export interface PopoverProps {
  /** the control that opens it — rendered as-is, so it keeps its own styling */
  trigger: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** leave undefined to let the popover manage its own open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Anchored panel for content you can interact with — a filter set, a quick edit.
 * Tooltip is a label you read; Popover is a surface you use, so it takes focus.
 */
export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  open,
  onOpenChange,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className="pm-popover"
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
        >
          {children}
          <RadixPopover.Arrow className="pm-popover__arrow" width={12} height={6} />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
