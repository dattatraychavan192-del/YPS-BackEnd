function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        message: "Request body contains invalid JSON.",
        details: { body: "Provide a valid JSON object." },
      },
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const labels = { email: "email address", phone: "phone number" };
    return res.status(409).json({
      error: {
        message: `A student with this ${labels[field] || "value"} is already registered.`,
        details: field ? { [field]: "This value is already registered." } : {},
      },
    });
  }

  if (error.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]),
    );
    return res.status(400).json({
      error: { message: "Student details are invalid.", details },
    });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({
    error: { message: "An unexpected server error occurred." },
  });
}

module.exports = { errorHandler };
