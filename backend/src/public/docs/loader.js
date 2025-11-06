/* eslint-env browser */
// Construire l'URL de l'iframe avec la spec AsyncAPI en mode lecture seule
const specUrl = encodeURIComponent(window.location.origin + '/api-docs/websocket/spec');
const studioUrl = 'https://studio.asyncapi.com/?url=' + specUrl + '&readOnly=true';

// Charger l'iframe
const iframe = document.getElementById('asyncapi-frame');
if (iframe) {
  iframe.src = studioUrl;
}
