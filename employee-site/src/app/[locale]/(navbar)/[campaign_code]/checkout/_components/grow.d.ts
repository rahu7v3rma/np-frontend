// types for the grow sdk which is loaded via a script tag

interface GrowConfig {
  environment: 'DEV' | 'PRODUCTION';
  version: number;
  events: {
    // callback payload types are unclear, so marked as `any`
    onSuccess?: (res: any) => void;
    onFailure?: (res: any) => void;
    onError?: (res: any) => void;
    onTimeout?: (res: any) => void;
    onWalletChange?: (res: any) => void;
  };
}

declare global {
  var growPayment: {
    // init actually returns a promise, but since it loads further scripts via
    // ugly dynamically-created script tags the sdk is not actually ready when
    // the promise is resolved, so it's not noted here to avoid some confusion
    init: (config: GrowConfig) => void;

    renderPaymentOptions: (authCode: string) => void;
  };
}

export {};
