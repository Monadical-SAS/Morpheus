import React from "react";
import Select, { ActionMeta } from "react-select";
import { ModelCategory } from "@/lib/models";
import { useController, Control } from "react-hook-form";

interface MultipleSelectProps {
  name: string;
  label: string;
  options: ModelCategory[];
  control?: Control<any>;
  rules?: any;
  isMulti?: boolean;
}

interface ArrayObjectSelectState {
  selectedCategories: ModelCategory | null;
}

type MultiValue<ModelCategory> = readonly ModelCategory[];

export default function MultipleSelect(props: MultipleSelectProps) {
  const [isClient, setIsClient] = React.useState(false);
  const [state, setState] = React.useState<ArrayObjectSelectState | null>({
    selectedCategories: null,
  });
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name: props.name,
    control: props.control,
    rules: props.rules,
  });

  React.useEffect(() => {
    const isValueEmpty =
      !value || (Array.isArray(value) && value.some((item: ModelCategory) => item.name === undefined));
    if (isValueEmpty) {
      setState(null);
    } else {
      setState({ selectedCategories: value });
    }
    setIsClient(true);
  }, [value]);

  const errorMessages = {
    required: "This field is required",
    default: "Unknown error",
  };

  const getInputError = () => {
    if (error) {
      return errorMessages[error.type as keyof typeof errorMessages] || error.message || errorMessages.default;
    }
    return null;
  };

  return (
    <div className="w-full form-control">
      <label className="label">
        <span className="label-text">
          {props.label} {props.rules && props.rules.required && "*"}
        </span>
      </label>
      {isClient && (
        <Select
          value={state ? state.selectedCategories : null}
          onChange={(
            newValue: MultiValue<ModelCategory> | ModelCategory | any,
            actionMeta: ActionMeta<ModelCategory>
          ) => {
            setState({ selectedCategories: newValue });
            onChange(newValue);
          }}
          getOptionLabel={(category: ModelCategory) => category.name}
          getOptionValue={(category: ModelCategory) => category.name}
          options={props.options}
          isClearable={false}
          backspaceRemovesValue={true}
          isMulti={props.isMulti}
          styles={colorStyles}
          menuPortalTarget={document.body}
          placeholder={"Select a category..."}
        />
      )}
      {error && (
        <label className="label">
          <span className="text-sm error text-error">{getInputError()}</span>
        </label>
      )}
    </div>
  );
}

const colorStyles = {
  control: (styles: any, { isFocused }: any) => ({
    ...styles,
    cursor: "pointer",
    userSelect: "none",
    appearance: "none",
    paddingLeft: "0.4rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    minHeight: "3rem",
    borderWidth: "0.2px",
    borderColor: "hsl(252 6% 82% /  0.2)",
    backgroundColor: "transparent",
    fontWeight: 600,
    borderRadius: "0.5rem",
    boxShadow: isFocused ? "0 0 0 2px #14172D, 0 0 0 4px hsl(252 6% 82% /  0.2)" : "",
    "&:hover": {
      borderColor: "hsl(252 6% 82% /  0.2)",
    },
  }),
  menu: (styles: any) => ({
    ...styles,
    backgroundColor: "rgb(20, 23, 45, 0.9)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
    padding: "0.5rem",
  }),
  option: (styles: any) => ({
    ...styles,
    color: "#DFDFDF",
    borderRadius: "0.5rem",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgb(40, 43, 70)",
    },
  }),
  singleValue: (styles: any) => ({
    ...styles,
    color: "#DFDFDF",
    backgroundColor: "transparent",
  }),
  multiValueLabel: (styles: any) => ({
    ...styles,
    color: "#DFDFDF",
    backgroundColor: "rgb(40, 43, 70)",
  }),
  multiValue: (styles: any) => ({
    ...styles,
    color: "#DFDFDF",
    backgroundColor: "rgb(40, 43, 70)",
  }),
  placeholder: (styles: any) => ({
    ...styles,
    color: "#DFDFDF",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};
