import { ComponentPropsWithoutRef } from "react";

interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  register: any;
  validationSchema?: any;
  errors?: any;
}

export const TextInput = (props: TextInputProps) => {
  const getInputError = () => {
    if (!props.errors) return null;
    if (props.errors.type === "required") return "This field is required";
    if (props.errors.type === "minLength") return "Min length is 5";
    if (props.errors.type === "maxLength") return "Max length is 20";
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">
          {props.label} {props.validationSchema.required && "*"}
        </span>
      </label>

      <input
        name={props.name}
        type={props.type || "text"}
        placeholder={props.placeholder}
        className="input input-bordered w-full"
        {...props.register(props.name, props.validationSchema)}
      />

      {props.errors && (
        <label className="label">
          <span className="error text-sm text-error">{getInputError()}</span>
        </label>
      )}
    </div>
  );
};
