const pool = require("../../config/db");

const createUser = async (
  client,
  email,
  displayName
) => {
  const result = await client.query(
    `
    INSERT INTO users (
      email,
      display_name
    )
    VALUES ($1, $2)
    RETURNING *
    `,
    [email, displayName]
  );

  return result.rows[0];
};

const findGoogleAccount = async (
  googleId
) => {
  const result = await pool.query(
    `
    SELECT
      u.*
    FROM auth_accounts a
    JOIN users u
      ON u.id = a.user_id
    WHERE
      a.provider = 'google'
      AND a.provider_user_id = $1
    `,
    [googleId]
  );

  return result.rows[0];
};
const findUserByEmail = async (
  email
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
};
const createGoogleAccount = async (
  client,
  userId,
  googleId
) => {
  await client.query(
    `
    INSERT INTO auth_accounts (
      user_id,
      provider,
      provider_user_id
    )
    VALUES (
      $1,
      'google',
      $2
    )
    `,
    [userId, googleId]
  );
};
const createAuthAccount = async (
  client,
  userId,
  passwordHash,
  email
) => {
  await client.query(
    `
    INSERT INTO auth_accounts (
      user_id,
      provider,
      provider_user_id,
      password_hash
    )
    VALUES (
      $1,
      'local',
      $2,
      $3
    )
    `,
    [userId, email, passwordHash]
  );
};

const findLocalUserByEmail = async (
  email
) => {
  const result = await pool.query(
    `
    SELECT
      u.*,
      a.password_hash
    FROM users u
    JOIN auth_accounts a
      ON a.user_id = u.id
    WHERE
      a.provider = 'local'
      AND a.provider_user_id = $1
    `,
    [email]
  );

  return result.rows[0];
};

const createSession = async (
  userId,
  sessionId,
  expiresAt
) => {
  await pool.query(
    `
    INSERT INTO sessions (
      id,
      user_id,
      expires_at
    )
    VALUES ($1,$2,$3)
    `,
    [sessionId, userId, expiresAt]
  );
};

const findSession = async (
  sessionId
) => {
  const result = await pool.query(
    `
    SELECT
      s.*,
      u.id as user_id,
      u.email,
      u.display_name,
      u.role,
      u.status
    FROM sessions s
    JOIN users u
      ON s.user_id = u.id
    WHERE s.id = $1
      AND s.expires_at > NOW()
    `,
    [sessionId]
  );

  return result.rows[0];
};

const deleteSession = async (
  sessionId
) => {
  await pool.query(
    `
    DELETE FROM sessions
    WHERE id = $1
    `,
    [sessionId]
  );
};

module.exports = {
  createUser,
  createAuthAccount,
  findLocalUserByEmail,
  createSession,
  findSession,
  deleteSession,
  findGoogleAccount,
  findUserByEmail,
  createGoogleAccount,
};

