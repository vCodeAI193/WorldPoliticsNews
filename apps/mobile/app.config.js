const base = require('./app.json').expo;

module.exports = {
  expo: {
    ...base,
    extra: {
      ...base.extra,
      // Override API_URL via environment variable for local development.
      // Android emulator reaches the host machine via 10.0.2.2, not localhost.
      // Usage:  API_URL=http://10.0.2.2:3001 npx expo run:android
      API_URL: process.env.API_URL || base.extra.API_URL,
    },
  },
};
