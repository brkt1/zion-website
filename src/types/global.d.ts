/**
 * Global type declarations
 */

import * as Sentry from '@sentry/react';

declare global {
  interface Window {
    Sentry?: typeof Sentry;
  }
}

export { };

