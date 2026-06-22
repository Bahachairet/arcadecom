const pool = require("../../config/db");

const {
  createUser,
  createAuthAccount,
  findLocalUserByEmail,
  createSession,
  findSession,
  deleteSession,
  findGoogleAccount,
  findUserByEmail,
  createGoogleAccount,
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
    throw new Error(
      "Email already exists"
    );
  }

  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    const user =
      await createUser(
        client,
        email,
        displayName
      );

    const passwordHash =
      await hashPassword(password);

    await createAuthAccount(
      client,
      user.id,
      passwordHash,
      email
    );

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const login = async ({
  email,
  password,
}) => {
  const user =
    await findLocalUserByEmail(email);

  if (!user) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const valid =
    await comparePassword(
      password,
      user.password_hash
    );

  if (!valid) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const session =
    createSessionData();

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

const googleLogin = async (
  profile
) => {
  const googleId = profile.id;

  const email =
    profile.emails[0].value;

  const displayName =
    profile.displayName;

  const avatar =
    profile.photos?.[0]?.value ||
    null;

  // CASE 1:
  // Google account already linked

  const existingGoogle =
    await findGoogleAccount(
      googleId
    );

  if (existingGoogle) {
    const session =
      createSessionData();

    await createSession(
      existingGoogle.id,
      session.id,
      session.expiresAt
    );

    return {
      user: existingGoogle,
      sessionId: session.id,
    };
  }

  // CASE 2:
  // User exists with same email

  const existingEmailUser =
    await findUserByEmail(email);

  if (existingEmailUser) {
    const client =
      await pool.connect();

    try {
      await client.query("BEGIN");

      await createGoogleAccount(
        client,
        existingEmailUser.id,
        googleId
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );
      throw error;
    } finally {
      client.release();
    }

    const session =
      createSessionData();

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

  // CASE 3:
  // Completely new user

  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    const result =
      await client.query(
        `
        INSERT INTO users (
          email,
          display_name,
          avatar_url
        )
        VALUES ($1,$2,$3)
        RETURNING *
        `,
        [
          email,
          displayName,
          avatar,
        ]
      );

    const user =
      result.rows[0];

    await createGoogleAccount(
      client,
      user.id,
      googleId
    );

    await client.query("COMMIT");

    const session =
      createSessionData();

    await createSession(
      user.id,
      session.id,
      session.expiresAt
    );

    return {
      user,
      sessionId: session.id,
    };
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  findSession,
  deleteSession,
};