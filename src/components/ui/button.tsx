import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className, children, disabled, type = "button", ...props
}, ref) => {
    return (
        <button
            ref={ref}
            className={cn(`
                inline-flex items-center justify-center w-auto rounded-full bg-primary border-transparent px-5 py-3 font-semibold text-primary-foreground
                disabled:cursor-not-allowed disabled:opacity-50 btn-press hover:cursor-pointer
            `, className)}
            disabled={disabled}
            type={type}
            {...props}
        >
            {children}
        </button>
    )
});

Button.displayName = "Button";

export default Button;