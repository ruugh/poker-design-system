import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import './modal.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** action row, usually a pair of Buttons */
  footer?: ReactNode;
}

// Focus trap, focus restore, Esc, scroll-lock and aria wiring are handled by Radix
// Dialog — a maintained, screen-reader-tested primitive — instead of hand-rolled.
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="pm-modal__backdrop" />
        <Dialog.Content className="pm-modal" aria-describedby={children ? undefined : ''}>
          <Dialog.Title className="pm-modal__title">{title}</Dialog.Title>
          {children ? (
            <Dialog.Description asChild>
              <div className="pm-modal__body">{children}</div>
            </Dialog.Description>
          ) : null}
          {footer && <div className="pm-modal__footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
