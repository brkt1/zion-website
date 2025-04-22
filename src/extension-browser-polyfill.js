/**
 * Polyfill for the "browser" namespace in Chrome extensions.
 * Defines "browser" as "chrome" if "browser" is undefined.
 * This allows code using "browser" namespace to work in Chrome.
 */
if (typeof browser === "undefined") {
  var browser = chrome;
}
