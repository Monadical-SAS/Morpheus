export const generateRandomNumber = (maxAmountDigits: number) => {
  const maxValue = Math.pow(10, maxAmountDigits);
  const randomNumber = Math.floor(Math.random() * maxValue);
  const randomAmount = Math.random() * (maxAmountDigits - 1) + 1;
  return Number(String(randomNumber).slice(0, randomAmount));
};
