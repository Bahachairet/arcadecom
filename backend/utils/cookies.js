const setSessionCookie = (
  res,
  sessionId
) => {
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge:
      1000 *
      60 *
      60 *
      24 *
      7,
  });
};

module.exports = {
  setSessionCookie,
};