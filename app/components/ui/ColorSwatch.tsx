import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ColorSwatchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-checked"> {
  active: boolean;
  color: string;
  label: string;
}

export const ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>(
  function ColorSwatch(
    {
      active,
      color,
      label,
      className,
      type = "button",
      role = "radio",
      ...props
    },
    ref,
  ) {
    const classes = [
      "color-swatch",
      active ? "color-swatch--active" : undefined,
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
        aria-label={label}
        title={props.title ?? label}
        className={classes}
      >
        <span
          className="color-swatch__color"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="color-swatch__label">{label}</span>
      </button>
    );
  },
);
