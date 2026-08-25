import { forwardRef, type HTMLAttributes } from "react";

export type CardPadding = "none" | "small" | "medium" | "large";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padding = "medium", ...props },
  ref,
) {
  const classes = ["ui-card", `ui-card--padding-${padding}`, className]
    .filter(Boolean)
    .join(" ");

  return <div ref={ref} className={classes} {...props} />;
});
