import React from 'react';

const TestErrorComponent = () => {
  throw new Error("This is a test error for Sentry!");
  // return <div>This will not be rendered.</div>;
};

export default TestErrorComponent;
