import type { HTMLAttributes, ReactNode } from "react";

export interface PriceSummaryRow {
  label: ReactNode;
  value: ReactNode;
  emphasized?: boolean;
}
export interface PriceSummaryProps extends HTMLAttributes<HTMLElement> {
  rows: readonly PriceSummaryRow[];
  total: ReactNode;
  totalLabel?: ReactNode;
  note?: ReactNode;
}

export function PriceSummary({
  rows,
  total,
  totalLabel = "Gesamtpreis",
  note,
  className,
  ...props
}: PriceSummaryProps) {
  const classes = ["price-summary", className].filter(Boolean).join(" ");

  return (
    <section className={classes} {...props}>
      <dl className="price-summary__rows">
        {rows.map((row, index) => (
          <div
            className={[
              "price-summary__row",
              row.emphasized ? "price-summary__row--emphasized" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
            key={index}
          >
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        <div className="price-summary__total">
          <dt>{totalLabel}</dt>
          <dd>{total}</dd>
        </div>
      </dl>
      {note ? <p className="price-summary__note">{note}</p> : null}
    </section>
  );
}
