import type { HTMLAttributes } from 'react';
import './avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** full name or handle — used for initials and the accessible label */
  name: string;
  src?: string;
  size?: AvatarSize;
}

function initials(name: string): string {
  const parts = name.replace(/[_.]/g, ' ').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className, ...rest }: AvatarProps) {
  const cls = ['pm-avatar', `pm-avatar--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} role="img" aria-label={name} title={name} {...rest}>
      {src ? (
        <img className="pm-avatar__img" src={src} alt="" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
