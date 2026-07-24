import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './modal.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** action row, usually a pair of Buttons */
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not(:disabled),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? dialogRef.current;
    node?.focus();
    return () => restoreRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="pm-modal__viewport">
      <div className="pm-modal__backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        className="pm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={children ? bodyId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <h2 className="pm-modal__title" id={titleId}>
          {title}
        </h2>
        {children && (
          <div className="pm-modal__body" id={bodyId}>
            {children}
          </div>
        )}
        {footer && <div className="pm-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
