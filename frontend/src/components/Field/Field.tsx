import { ChangeEvent, forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import type { Option } from "../../utils/constants";

const control =
  "w-full rounded-md border border-ash bg-canvas px-[15px] text-body text-ink outline-none placeholder:text-ash focus:border-2 focus:border-ink focus:ring-4 focus:ring-focus disabled:bg-card";

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
}

interface ShellProps extends BaseProps {
  htmlFor?: string;
  children: ReactNode;
}

const Shell = ({ label, error, hint, children, htmlFor }: ShellProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={htmlFor} className="text-small font-semibold text-ink">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p role="alert" className="text-caption text-error">
        {error}
      </p>
    ) : (
      hint && <p className="text-caption text-mute">{hint}</p>
    )}
  </div>
);

type TextLike = HTMLInputElement | HTMLTextAreaElement;

const withFilter =
  <T extends TextLike>(filter: ((v: string) => string) | undefined, onChange: ((e: ChangeEvent<T>) => void) | undefined) =>
  (e: ChangeEvent<T>) => {
    if (filter) e.target.value = filter(e.target.value);
    onChange?.(e);
  };

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  filter?: (v: string) => string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, filter, onChange, maxLength, id, className = "", ...rest },
  ref
) {
  const fieldId = id || rest.name;
  return (
    <Shell label={label} error={error} hint={hint} htmlFor={fieldId}>
      <input
        id={fieldId}
        ref={ref}
        maxLength={maxLength}
        onChange={withFilter(filter, onChange)}
        aria-invalid={!!error}
        className={`h-11 ${control} ${error ? "border-error" : ""} ${className}`}
        {...rest}
      />
    </Shell>
  );
});

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & BaseProps;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, error, hint, maxLength = 64, id, ...rest },
  ref
) {
  const [show, setShow] = useState(false);
  const fieldId = id || rest.name;
  return (
    <Shell label={label} error={error} hint={hint} htmlFor={fieldId}>
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          type={show ? "text" : "password"}
          maxLength={maxLength}
          aria-invalid={!!error}
          className={`h-11 pr-12 ${control} ${error ? "border-error" : ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-mute"
        >
          {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
        </button>
      </div>
    </Shell>
  );
});

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {
  filter?: (v: string) => string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, error, hint, filter, onChange, maxLength, id, rows = 4, ...rest },
  ref
) {
  const fieldId = id || rest.name;
  return (
    <Shell label={label} error={error} hint={hint} htmlFor={fieldId}>
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        onChange={withFilter(filter, onChange)}
        aria-invalid={!!error}
        className={`resize-none py-3 ${control} ${error ? "border-error" : ""}`}
        {...rest}
      />
    </Shell>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
  options: Option[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, options, placeholder, id, className = "", ...rest },
  ref
) {
  const fieldId = id || rest.name;
  return (
    <Shell label={label} error={error} hint={hint} htmlFor={fieldId}>
      <select id={fieldId} ref={ref} aria-invalid={!!error} className={`h-11 cursor-pointer ${control} ${error ? "border-error" : ""} ${className}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
});
