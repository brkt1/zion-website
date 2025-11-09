import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { SWRConfig } from 'swr';
import App from './App';
import './index.css';

const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          shouldRetryOnError: true,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
        }}
      >
        <App />
      </SWRConfig>
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);
