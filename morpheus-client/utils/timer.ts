export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimestamp = () => {
  return new Date().getTime();
};

export const exponentialDelay = (retryCount: number) => {
  return new Promise((resolve) => setTimeout(resolve, 2 ** retryCount));
};
