export const isAllTrue = (array: any[] | undefined) => {
  if (!array) return false;
  return array.every((value) => value === true);
};

export const sortArrayNumbers = (array: number[]) => {
  return array.sort((a, b) => a - b);
};

export const findObjectWithMinValue = (data: any[], property: string) => {
  if (data.length === 0) return undefined;
  return data.reduce((prev, current) => {
    return prev[property] < current[property] ? prev : current;
  });
};

export const findObjectWithMaxValue = (data: any[], property: string) => {
  if (data.length === 0) return undefined;
  return data.reduce((prev, current) => {
    return prev[property] > current[property] ? prev : current;
  });
};

export const chooseNRandomElementsWithRepetition = (
  array: any[],
  n: number
) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    result.push(array[randomIndex]);
  }
  return result.join("");
};

export const chooseNRandomElementsWithoutRepetition = (
  array: any[],
  n: number
) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    result.push(array[randomIndex]);
    array.splice(randomIndex, 1);
  }
  return result;
};

export const getRandomStringFromArray = (array: Array<string>) => {
  if (array.length === 0) {
    return "";
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};