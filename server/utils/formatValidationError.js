export function formatValidationError(err) {
  return {
    error: "Validation failed",
    details: Object.entries(err.errors || {}).map(
      ([field, validationError]) => ({
        field,
        message: validationError.message,
      })
    ),
  };
}
