import type { AriaAttributes, MouseEventHandler, ReactNode, Ref } from "react";

type ButtonVariant = "primary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg";
type ButtonWidth = "auto" | "sm" | "md" | "lg" | "full";

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  ghost: "btn--ghost",
  danger: "btn--danger",
  accent: "btn--accent",
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg",
};

const BUTTON_WIDTH_CLASS: Record<ButtonWidth, string> = {
  auto: "",
  sm: "btn--w-sm",
  md: "btn--w-md",
  lg: "btn--w-lg",
  full: "btn--w-full",
};

type ButtonProps = {
  id?: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  className?: string;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaHasPopup?: AriaAttributes["aria-haspopup"];
  ariaExpanded?: boolean;
  autoFocus?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
};

type IconButtonProps = {
  id?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
  ariaLabel: string;
  ariaPressed?: boolean;
  ariaHasPopup?: AriaAttributes["aria-haspopup"];
  ariaExpanded?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
};

/**
 * Shared React button component using the project's CSS design tokens/variants.
 */
export function Button(props: ButtonProps) {
  const {
    id,
    type = "button",
    variant = "ghost",
    size = "md",
    width = "auto",
    className = "",
    disabled = false,
    title,
    ariaLabel,
    ariaPressed,
    ariaHasPopup,
    ariaExpanded,
    autoFocus,
    buttonRef,
    onClick,
    children,
  } = props;

  const variantClass = BUTTON_VARIANT_CLASS[variant];
  const sizeClass = BUTTON_SIZE_CLASS[size];
  const widthClass = BUTTON_WIDTH_CLASS[width];

  return (
    <button
      id={id}
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      autoFocus={autoFocus}
      ref={buttonRef}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Icon-only button variant.
 */
export function IconButton(props: IconButtonProps) {
  const {
    id,
    className = "",
    disabled = false,
    title,
    ariaLabel,
    ariaPressed,
    ariaHasPopup,
    ariaExpanded,
    onClick,
    children,
  } = props;

  return (
    <button
      id={id}
      type="button"
      className={`iconBtn ${className}`.trim()}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
