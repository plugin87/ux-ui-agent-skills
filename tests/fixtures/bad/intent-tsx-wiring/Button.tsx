// The call site is right (variant="destructive"); the variant map is not:
// destructive is wired to the same blue as primary.
import { cva } from "class-variance-authority";

export const button = cva("inline-flex rounded-md px-4 py-2", {
  variants: {
    variant: {
      primary: "bg-blue-600 text-white",
      destructive: "bg-blue-600 text-white",
      secondary: "bg-transparent text-slate-900",
    },
  },
  defaultVariants: { variant: "primary" },
});

export function Button({ variant, ...rest }: { variant?: "primary" | "destructive" | "secondary" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={button({ variant })} {...rest} />;
}
