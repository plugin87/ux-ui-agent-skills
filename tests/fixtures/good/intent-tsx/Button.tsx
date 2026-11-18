import { cva } from "class-variance-authority";
export const button = cva("ds-btn", {
  variants: { variant: { primary: "ds-btn--primary", destructive: "ds-btn--danger", ghost: "ds-btn--ghost" } },
  defaultVariants: { variant: "primary" },
});
export function Button({ variant, ...rest }: { variant?: "primary" | "destructive" | "ghost" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={button({ variant })} {...rest} />;
}
