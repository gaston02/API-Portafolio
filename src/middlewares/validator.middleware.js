import { ZodError } from "zod";

export const validateSchema = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);

    req.body = parsed;

    next();
  } catch (error) {
    let errorMessage;

    if (error instanceof ZodError && error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }

    return res.status(400).json({ error: errorMessage });
  }
};

export const validateSchemaParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params);
    next();
  } catch (error) {
    let errorMessage;
    if (error.errors && error.errors.length > 0 && error.errors[0].message) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }
    res.status(400).json({ error: errorMessage });
  }
};
