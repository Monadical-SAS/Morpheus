import { ComponentPropsWithoutRef } from "react";

interface SelectInputProps extends ComponentPropsWithoutRef<"select"> {
  name: string;
  label: string;
  options: string[];
  register?: any;
  onChange?: any;
  validationSchema?: any;
  errors?: any;
  selectedValues?: string[]; // Changed to an array
}

export const Select = (props: SelectInputProps) => {
  const getInputError = () => {
    if (!props.errors) return null;
    if (props.errors.type === "required") return "This field is required";
  };

  return (
    <div className="w-full form-control">
      <label className="label">
        <span className="label-text">
          {props.label} {props.validationSchema?.required && "*"}
        </span>
      </label>

      <select
        className="select select-bordered"
        name={props.name}
        {...(props.register
          ? props.register(props.name, props.validationSchema)
          : {})}
        value={props.selectedValues} // Updated to handle array
        onChange={props?.onChange}
      >
        {props.options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>

      {props.errors && (
        <label className="label">
          <span className="text-sm error text-error">{getInputError()}</span>
        </label>
      )}
    </div>
  );
};
