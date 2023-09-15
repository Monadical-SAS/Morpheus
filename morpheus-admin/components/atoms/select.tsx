import { ComponentPropsWithoutRef } from "react";

interface SelectInputProps extends ComponentPropsWithoutRef<"select"> {
  name: string;
  label: string;
  options: string[];
  register: any;
  validationSchema?: any;
  errors?: any;
}

export const Select = (props: SelectInputProps) => {
  const getInputError = () => {
    if (!props.errors) return null;
    if (props.errors.type === "required") return "This field is required";
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">
          {props.label} {props.validationSchema.required && "*"}
        </span>
      </label>

      <select
        className="select select-bordered"
        {...props.register(props.name, props.validationSchema)}
      >
        {props.options.map((option, index) => (
          <option key={`${option}-${index}`}>{option}</option>
        ))}
      </select>

      {props.errors && (
        <label className="label">
          <span className="error text-sm text-error">{getInputError()}</span>
        </label>
      )}
    </div>
  );
};
