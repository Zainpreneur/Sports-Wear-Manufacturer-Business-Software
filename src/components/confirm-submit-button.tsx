"use client";

import type { ButtonHTMLAttributes } from "react";

/**
 * A submit button for a <form action={serverAction}> that asks for
 * confirmation before letting the (irreversible) submit go through.
 */
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string }) {
  return (
    <button
      {...props}
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
