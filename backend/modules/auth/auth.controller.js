const authService = require("./auth.service");

const { setSessionCookie } = require("../../utils/cookies");

const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const user = await authService.register({
      email,
      password,
      displayName,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({
      email,
      password,
    });

    setSessionCookie(res, result.sessionId);

    return res.json({
      message: "Logged in successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    await authService.deleteSession(sessionId);
  }

  res.clearCookie("sessionId");

  return res.json({
    message: "Logged out successfully",
  });
};

const me = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  const session = await authService.findSession(sessionId);

  if (!session) {
    return res.status(401).json({
      message: "Session expired",
    });
  }

  return res.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      role: session.user.role,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  me,
};
