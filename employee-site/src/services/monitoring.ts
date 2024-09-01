import * as Sentry from '@sentry/nextjs';

const reportError = (err: any) => {
  // report, fails gracefully if sentry is not initialized
  Sentry.captureException(err);
};

export { reportError };
