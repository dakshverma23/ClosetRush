const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Configure Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (email) {
          user = await User.findOne({ email });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        // Note: For Google OAuth, we need to handle missing required fields
        // In a real implementation, you'd redirect to a profile completion page
        user = await User.create({
          name: profile.displayName,
          email: email || `${profile.id}@google.oauth`,
          mobile: '0000000000', // Placeholder - should be collected later
          address: 'Not provided', // Placeholder - should be collected later
          googleId: profile.id,
          authProvider: 'google',
          userType: 'individual'
        });

        done(null, user);

      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
