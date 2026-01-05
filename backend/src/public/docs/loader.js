/**
 * @file loader.js
 * @description AsyncAPI Studio iframe loader script.
 * Dynamically loads the AsyncAPI Studio with the WebSocket spec in read-only mode.
 */

/* eslint-env browser */

// Build the iframe URL with the AsyncAPI spec in read-only mode
const specUrl = encodeURIComponent(
  window.location.origin + "/api-docs/websocket/spec"
);
const studioUrl =
  "https://studio.asyncapi.com/?url=" + specUrl + "&readOnly=true";

// Load the iframe with the AsyncAPI Studio URL
const iframe = document.getElementById("asyncapi-frame");
if (iframe) {
  iframe.src = studioUrl;
}
