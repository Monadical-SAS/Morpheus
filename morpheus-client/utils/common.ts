export const ErrorResponse = (
  message: string = "An unexpected error occurred during the operation"
) => {
  return { success: false, message: message, data: null };
};

export const SuccessResponse = (
  data: any,
  message: string = "Operation completed successfully"
) => {
  return { success: true, data: data, message: message };
};
