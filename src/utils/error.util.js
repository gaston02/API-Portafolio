export function handleGenericError(res, statusCode, errorMessage) {
  res.status(statusCode).json({
    status: "error",
    message: errorMessage,
  });
}