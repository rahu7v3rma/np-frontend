/** @type {import('next').NextConfig} */

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
const backendParsedUrl = backendBaseUrl ? new URL(backendBaseUrl) : null;

const imagesRemotePatterns = [];

if (process.env.NODE_ENV === 'development') {
  imagesRemotePatterns.push({
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/open/**',
  });
}

if (backendParsedUrl !== null) {
  imagesRemotePatterns.push({
    protocol: backendParsedUrl.protocol.replace(':', ''),
    hostname: backendParsedUrl.hostname,
    pathname: '/image/**',
  });
}

module.exports = {
  images: {
    remotePatterns: imagesRemotePatterns
  },
  output: 'standalone',
}


// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: 'beehive-software',
    project: 'np-frontend-employee-site',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
