function HttpError(code, msg) {
  this.message = msg;
  this.statusCode = code;
  this.name = 'HttpError';
  const err = Error(msg); // http://es5.github.io/#x15.11.1
  this.stack = err.stack;
}

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;

export { HttpError };
