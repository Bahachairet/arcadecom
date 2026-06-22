const { v4: uuidv4 } = require("uuid");

const createSessionData = () => {
  return {
    id: uuidv4(),
    expiresAt: new Date(
      Date.now() +
        1000 *
          60 *
          60 *
          24 *
          7
    ),
  };
};

module.exports = {
  createSessionData,
};