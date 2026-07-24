import { useId, useState } from 'react';
import type { ReactElement } from 'react';
import './tooltip.css';

export interface TooltipProps {
  label: string;
  children: ReactElement;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="pm-tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id}>{children}</span>
      {open && (
        <span role="tooltip" id={id} className="pm-tooltip__bubble">
          {label}
        </span>
      )}
    </span>
  );
}
