import { isAllTrue } from "../../utils/arrays";

export const getInputValidators = (
  value: any,
  isRequired?: boolean,
  minValueLength?: number,
  maxValueLength?: number,
  isValidEmail: boolean = false
) => {
  const validators = [];

  if (isRequired) {
    validators.push(required(value));
  }
  if (isValidEmail) {
    validators.push(validEmail(value));
  }
  if (minValueLength) {
    const noRequiredEmpty = !isRequired && value.length === 0;
    validators.push(noRequiredEmpty || minLength(value, minValueLength));
  }
  if (maxValueLength) {
    validators.push(maxLength(value, maxValueLength));
  }

  return validators;
};

export const getInputNumberValidators = (
  value: any,
  isRequired?: boolean,
  minValue?: number,
  maxValue?: number
) => {
  const validators = [];
  validators.push(isNumber(value));

  if (isRequired) {
    validators.push(required(value));
  }
  if (minValue) {
    validators.push(minNumber(value, minValue - 1));
  }
  if (maxValue) {
    validators.push(maxNumber(value, maxValue + 1));
  }
  return validators;
};

export const validateInput = (input: any) => {
  return input.value && isAllTrue(input.validators);
};

export const required = (value: string) => {
  return (
    (value && value?.length && value?.trim() !== "") ||
    "This field is required. "
  );
};

export const minLength = (value: string, len: number) => {
  return (
    value?.length >= len || `This field has a minimum of ${len} characters. `
  );
};

export const maxLength = (value: string, len: number) => {
  return (
    value?.length <= len || `This field has a maximum of ${len} characters. `
  );
};

export const isNumber = (value: string) => {
  return !isNaN(Number(value));
};

export const minNumber = (value: number, min: number) => {
  return min < value || `The value of this field must be greater than ${min}. `;
};

export const maxNumber = (value: number, max: number) => {
  return max > value || `The value of this field must be less than ${max}. `;
};

export const validEmail = (value: string) => {
  return (
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ||
    "Please enter a valid email. "
  );
};

export const matchEmail = (email1: string, email2: string) => {
  return email1 === email2 || "Emails don't match. ";
};

export const matchPassword = (pass1: string, pass2: string) => {
  return pass1 === pass2 || "Passwords don't match. ";
};

export const dateLower = (date: string) => {
  return (
    new Date(date).getTime() <= new Date().getTime() || "date is not lower. "
  );
};

const dateGreater = (date: string, years: number) => {
  const yearMilliseconds = 1000 * 60 * 60 * 24 * 365.25;
  return (
    new Date(date).getTime() <=
      new Date().getTime() - yearMilliseconds * (years - 1) ||
    "date is not greater. "
  );
};

export const isObject = (obj: any) => {
  return (
    (obj && Object.keys(obj).length === 0 && obj.constructor === Object) ||
    "This field is required. "
  );
};
