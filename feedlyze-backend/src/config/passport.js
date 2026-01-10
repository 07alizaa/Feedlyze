const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Business = require('../models/Business');
const logger = require('../utils/logger');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      logger.info(`Google OAuth login attempt: ${profile.emails[0].value}`);

      // 1. Check if user exists by Google ID
      let business = await Business.findByGoogleId(profile.id);

      if (business) {
        logger.info(`Found existing Google user: ${business.email}`);
        return done(null, business);
      }

      // 2. Check if user exists by email (Link account)
      const email = profile.emails[0].value;
      business = await Business.findByEmail(email);

      if (business) {
        logger.info(`Linking Google account to existing user: ${email}`);
        business = await Business.linkGoogleAccount(business.id, profile.id);
        return done(null, business);
      }

      // 3. Create new user
      logger.info(`Creating new Google user: ${email}`);
      business = await Business.createGoogleUser({
        business_name: profile.displayName,
        email: email,
        google_id: profile.id,
        email_verified: true
      });

      return done(null, business);
    } catch (err) {
      logger.error('Google OAuth error:', err);
      return done(err, null);
    }
  }
));

module.exports = passport;
