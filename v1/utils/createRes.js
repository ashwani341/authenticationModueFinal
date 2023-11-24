const createRes = (messages = [], payload = [], error = false) => {
  if (error) {
    return {
      error,
      messages,
    };
  }

  return {
    error,
    messages,
    payload,
  };
};

module.exports = {
  createRes,
};
