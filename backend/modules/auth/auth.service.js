const prisma = require("../../prisma/prisma");

const {
  createUser,
  createGoogleUser,
  createAuthAccount,
  findLocalUserByEmail,
  createSession,
  findSession,
  deleteSession,
  findGoogleAccount,
  findUserByEmail,
  createGoogleAccount,
  updateLastLoginAt,
} = require("./auth.repository");

const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const {
  createSessionData,
} = require("../../utils/session");

const register = async ({
  email,
  password,
  displayName,
}) => {
  const existingUser =
    await findLocalUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        displayName,
      },
    });

    await tx.authAccount.create({
      data: {
        userId: newUser.id,
        provider: "local",
        providerUserId: email,
        passwordHash,
      },
    });

    return newUser;
  });

  return user;
};

const login = async ({ email, password }) => {
  const authAccount = await findLocalUserByEmail(email);

  if (!authAccount) {
    throw new Error("Invalid credentials");
  }

  const valid = await comparePassword(
    password,
    authAccount.passwordHash
  );

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  await updateLastLoginAt(authAccount.userId);

  const session = createSessionData();

  await createSession(
    authAccount.userId,
    session.id,
    session.expiresAt
  );

  return {
    user: authAccount.user,
    sessionId: session.id,
  };
};

const googleLogin = async (profile) => {
  const googleId = profile.id;
  const email = profile.emails[0].value;
  const displayName = profile.displayName;
  const avatar = profile.photos?.[0]?.value || null;

  // CASE 1: Google account already linked
  const existingGoogle = await findGoogleAccount(googleId);

  if (existingGoogle) {
    await updateLastLoginAt(existingGoogle.userId);

    const session = createSessionData();

    await createSession(
      existingGoogle.userId,
      session.id,
      session.expiresAt
    );

    return {
      user: existingGoogle.user,
      sessionId: session.id,
    };
  }

  // CASE 2: User exists with same email
  const existingEmailUser = await findUserByEmail(email);

  if (existingEmailUser) {
    await prisma.$transaction(async (tx) => {
      await tx.authAccount.create({
        data: {
          userId: existingEmailUser.id,
          provider: "google",
          providerUserId: googleId,
        },
      });
    });

    await updateLastLoginAt(existingEmailUser.id);

    const session = createSessionData();

    await createSession(
      existingEmailUser.id,
      session.id,
      session.expiresAt
    );

    return {
      user: existingEmailUser,
      sessionId: session.id,
    };
  }

  // CASE 3: Completely new user
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        displayName,
        avatarUrl: avatar,
      },
    });

    await tx.authAccount.create({
      data: {
        userId: newUser.id,
        provider: "google",
        providerUserId: googleId,
      },
    });

    return newUser;
  });

  const session = createSessionData();

  await createSession(
    user.id,
    session.id,
    session.expiresAt
  );

  return {
    user,
    sessionId: session.id,
  };
};

module.exports = {
  register,
  login,
  googleLogin,
  findSession,
  deleteSession,
};
