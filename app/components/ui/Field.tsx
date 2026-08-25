import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

interface FieldChromeProps {
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  containerClassName?: string;
}

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "aria-invalid">,
    FieldChromeProps {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
}

export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "aria-invalid">,
    FieldChromeProps {
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
}

function getDescribedBy(
  hintId: string | undefined,
  errorId: string | undefined,
  describedBy: string | undefined,
) {
  return [describedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    id,
    label,
    hint,
    error,
    className,
    containerClassName,
    required,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const invalid = ariaInvalid ?? Boolean(error);
  const classes = ["ui-field__control", className].filter(Boolean).join(" ");
  const containerClasses = ["ui-field", containerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <label className="ui-field__label" htmlFor={fieldId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        {...props}
        ref={ref}
        id={fieldId}
        required={required}
        className={classes}
        aria-invalid={invalid}
        aria-describedby={getDescribedBy(hintId, errorId, describedBy)}
      />
      {hint ? (
        <span id={hintId} className="ui-field__hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="ui-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  {
    id,
    label,
    hint,
    error,
    className,
    containerClassName,
    required,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const invalid = ariaInvalid ?? Boolean(error);
  const classes = ["ui-field__control", "ui-field__textarea", className]
    .filter(Boolean)
    .join(" ");
  const containerClasses = ["ui-field", containerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <label className="ui-field__label" htmlFor={fieldId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <textarea
        {...props}
        ref={ref}
        id={fieldId}
        required={required}
        className={classes}
        aria-invalid={invalid}
        aria-describedby={getDescribedBy(hintId, errorId, describedBy)}
      />
      {hint ? (
        <span id={hintId} className="ui-field__hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="ui-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
