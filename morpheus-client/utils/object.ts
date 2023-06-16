export const isEmptyObject = (object: any) => {
  if (!object) return true;
  return Object.keys(object).length === 0;
};

export const checkIfValueInEnum = (enumObject: any, value: any) => {
  if (!enumObject || !value) return false;
  return Object.values(enumObject).includes(value);
};

export const filterObjectsByProperty = (
  objectList: any[],
  property: string,
  value: any
) => {
  if (!objectList || !property || !value) return [];
  if (!Array.isArray(objectList)) return [];
  return objectList.filter((object) => object[property] === value);
};
