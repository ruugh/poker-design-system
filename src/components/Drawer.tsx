import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import './drawer.css';

export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** one line of context under the title */
  description?: string;
  side?: 'right' | 'left';
  size?: DrawerSize;
  children?: ReactNode;
  /** action row, usually a pair of Buttons */
  footer?: ReactNode;
}

/**
 * Edge sheet for work that needs room but not a full page — connect-club requests,
 * a player's detail. Modal is for a decision; Drawer is for a task.
 * Focus trap, Esc, scroll-lock and aria wiring come from Radix Dialog.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  children,
  footer,
}: DrawerProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="pm-drawer__backdrop" />
        <Dialog.Content
          className={`pm-drawer pm-drawer--${side} pm-drawer--${size}`}
          aria-describedby={description ? undefined : ''}
        >
          <header className="pm-drawer__header">
            <div className="pm-drawer__heading">
              <Dialog.Title className="pm-drawer__title">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="pm-drawer__description">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className="pm-drawer__close" aria-label="Close">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M18 6 6 18M6 6l12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </header>
          <div className="pm-drawer__body">{children}</div>
          {footer ? <footer className="pm-drawer__footer">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
