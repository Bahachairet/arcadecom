const passport = require(
  "passport"
);

const GoogleStrategy =
  require(
    "passport-google-oauth20"
  ).Strategy;

const authService =
  require(
    "../modules/auth/auth.service"
  );

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env
          .GOOGLE_CLIENT_ID,

      clientSecret:
        process.env
          .GOOGLE_CLIENT_SECRET,

      callbackURL:
        "http://localhost:5000/api/auth/google/callback",
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const result =
          await authService.googleLogin(
            profile
          );

        return done(
          null,
          result
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;