import type { ButtonHTMLAttributes } from "react";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "destructive" };
export function Button({ variant = "primary", ...rest }: Props) {
  return <button data-variant={variant} className="ds-btn" {...rest} />;
}
