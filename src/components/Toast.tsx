import * as RadixToast from '@radix-ui/react-toast';
import type { ReactNode } from 'react';
import './toast.css';

export type ToastTone = 'info' | 'success' | 'danger';

export interface ToastProviderProps {
  children: ReactNode;
  /** how long a toast stays before it dismisses itself */
  duration?: number;
}

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone?: ToastTone;
  /**
   * The result, in the same words as the control that caused it — "Publish" the button,
   * "Published" the toast. A toast that renames the action makes the user re-read it.
   */
  title: string;
  children?: ReactNode;
  /** a single recovery action, e.g. Undo */
  action?: { label: string; onAction: () => void };
}

/** Wraps the app once and hosts the viewport every Toast renders into. */
export function ToastProvider({ children, duration = 5000 }: ToastProviderProps) {
  return (
    <RadixToast.Provider duration={duration} swipeDirection="right">
      {children}
      <RadixToast.Viewport className="pm-toast__viewport" />
    </RadixToast.Provider>
  );
}

/** Transient confirmation. Anything the owner must act on belongs in a Banner instead. */
export function Toast({ open, onOpenChange, tone = 'info', title, children, action }: ToastProps) {
  return (
    <RadixToast.Root
      className={`pm-toast pm-toast--${tone}`}
      open={open}
      onOpenChange={onOpenChange}
    >
      <span className="pm-toast__dot" aria-hidden="true" />
      <div className="pm-toast__text">
        <RadixToast.Title className="pm-toast__title">{title}</RadixToast.Title>
        {children ? (
          <RadixToast.Description className="pm-toast__body">{children}</RadixToast.Description>
        ) : null}
      </div>
      {action ? (
        <RadixToast.Action
          className="pm-toast__action"
          altText={action.label}
          onClick={action.onAction}
        >
          {action.label}
        </RadixToast.Action>
      ) : null}
      <RadixToast.Close className="pm-toast__close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M18 6 6 18M6 6l12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
