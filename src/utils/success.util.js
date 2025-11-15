export function handleGenericSuccess(res, statusCode, data, successMessage) {
  res.status(statusCode).json({
    status: "success",
    data: data,
    message: successMessage,
  });
}