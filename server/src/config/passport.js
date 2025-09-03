const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;
          if (!email) return done(new Error('No email from Google'));

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ email, name, googleId });
          } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
} else {
  console.warn('Google client ID/secret not set—Google auth disabled');
}
