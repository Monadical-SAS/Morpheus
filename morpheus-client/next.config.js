const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sentry: {},
  images: {
    unoptimized: true,
    domains: [
      "https://morpheus-results-staging-253.s3.amazonaws.com/",
      "gs://morpheus-sd.appspot.com",
    ],
  },
};

const sentryWebpackPluginOptions = {
  silent: false, // Suppresses all logs
  hideSourceMaps: true,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
