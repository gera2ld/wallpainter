function throwError(err) {
  console.error(err);
  throw err;
}

function wrapError(handle, onError = throwError) {
  async function wrapped(...args) {
    try {
      return await handle(...args);
    } catch (err) {
      return onError(err);
    }
  }
  return wrapped;
}

function ignoreErrorCode(code) {
  return err => {
    if (err && err.code !== code) throw err;
  };
}

exports.throwError = throwError;
exports.wrapError = wrapError;
exports.ignoreErrorCode = ignoreErrorCode;
