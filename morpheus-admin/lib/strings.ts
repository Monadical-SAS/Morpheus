export const buildStringFromArray = (array: any[] | undefined) => {
  if (!array) return "";
  const cleanedArray = array.filter((value) => typeof value === "string");
  return cleanedArray.join("");
};

export const buildStringFromObject = (object: any) => {
  if (!object) return "";
  const cleanedObject = Object.values(object).filter(
    (value) => typeof value === "string"
  );
  return cleanedObject.join(" ");
};

export const capitalize = (text: string) => {
  return text && text.replace(/\b\w/g, (l: string) => l.toUpperCase());
};

export const removeDashAndCapitalize = (text: string) => {
  if (!text) return "";
  return text
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
};

export const capitalizeFirstLetter = (string: any) => {
  if (typeof string !== "string") return;
  return string && string[0].toUpperCase() + string.slice(1);
};
