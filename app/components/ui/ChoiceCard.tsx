import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export interface ChoiceCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-checked"> {
  active: boolean;
  label?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export const ChoiceCard = forwardRef<HTMLButtonElement, ChoiceCardProps>(
  function ChoiceCard(
    {
      active,
      label,
      description,
      icon,
      children,
      className,
      type = "button",
      role = "radio",
      ...props
    },
    ref,
  ) {
    const classes = [
      "choice-card",
      active ? "choice-card--active" : undefined,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        role={role}
        aria-checked={active}
        className={classes}
      >
        {icon ? <span className="choice-card__icon">{icon}</span> : null}
        {label || description ? (
          <span className="choice-card__content">
            {label ? <span className="choice-card__label">{label}</span> : null}
            {description ? (
              <span className="choice-card__description">{description}</span>
            ) : null}
          </span>
        ) : null}
        {children}
      </button>
    );
  },
);
