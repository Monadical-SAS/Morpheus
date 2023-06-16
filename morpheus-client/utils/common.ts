export const ErrorResponse = (error: any) => {
  return { success: false, message: error, data: null };
};
