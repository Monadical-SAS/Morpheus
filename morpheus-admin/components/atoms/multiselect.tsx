import React from "react";
import Select, { ActionMeta } from "react-select";


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
    backgroundColor: "rgb(40, 43, 70)",
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

interface Option {
  name: string;
}

type MultiValue<Option> = readonly Option[];

interface MultipleSelectProps {
  name: string;
  label: string;
  options: any[];
  selectedValues?: string[];
  value?: MultiValue<Option> | null;
  onChange: React.Dispatch<React.SetStateAction<MultiValue<Option>>>;
  errors?: any;
  setValue?: any;
}

const onChangeValue = (newValue: MultiValue<Option>): MultiValue<Option> => {
    return newValue || [];
};

export default function MultipleSelect(props: MultipleSelectProps) {
  const [isClient, setIsClient] = React.useState(false);
  
  const onChange = (newValue: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
    const convertedValue: MultiValue<Option> = onChangeValue(newValue);
    props.onChange(convertedValue);
    props.setValue(props.name, convertedValue);
  };

  const getInputError = () => {
    if (!props.errors) return null;
    if (props.errors.type === "required") return "This field is required";
  };

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full form-control">
      <label className="label">
        <span className="label-text">
          {props.label} {"*"}
        </span>
      </label>
      {isClient && (
        <Select
          inputId="categories"
          name="categories"
          value={props.value || []}
          onChange={onChange}
          getOptionLabel={(option: Option) => option.name}
          getOptionValue={(option: Option) => option.name}
          options={props.options}
          isClearable={false}
          backspaceRemovesValue={true}
          isMulti={true}
          styles={colorStyles}
        />
      )}

      {props.errors && (
        <label className="label">
          <span className="text-sm error text-error">{getInputError()}</span>
        </label>
      )}
    </div>
  );
}
