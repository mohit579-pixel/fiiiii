import ApiError from './ApiError.js';

export const handleAsyncError = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

class AppError extends Error{
    constructor(message,statusCode){
        super(message);

        this.statusCode=statusCode;

        Error.captureStackTrace(this,this.constructor);
    }
}

export default AppError;