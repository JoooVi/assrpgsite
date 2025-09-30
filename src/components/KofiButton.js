// KofiButton.js

import { useEffect } from 'react';
import PropTypes from 'prop-types';

const KofiButton = ({ 
  username = 'jooovi',
  buttonText = 'Support me',
  backgroundColor = '#d9534f',
  textColor = '#fff'
}) => {
  const kofiScriptUrl = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';

  // KofiButton.js

useEffect(() => {
  const kofiScriptUrl = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';

  const drawWidget = () => {
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw(username, {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': buttonText,
        'floating-chat.donateButton.background-color': backgroundColor,
        'floating-chat.donateButton.text-color': textColor
      });
    }
  };

  const existingScript = document.querySelector(`script[src="${kofiScriptUrl}"]`);

  if (existingScript) {
    drawWidget();
    return;
  }
  
  try {
    const script = document.createElement('script');
    script.src = kofiScriptUrl;
    script.async = true;
    script.onload = drawWidget;
    script.onerror = () => console.error('Failed to load Ko-fi widget script');
    document.body.appendChild(script);
  } catch (error) {
    console.error('Error initializing Ko-fi widget:', error);
  }

  // --- CORRECTION IS HERE ---
  // The cleanup function should NOT try to delete the global object.
  // An empty return is the safest approach.
  return () => {};

}, [username, buttonText, backgroundColor, textColor]); // Manter as dependências

  return null; // O componente não renderiza nada visível por si só
};

KofiButton.propTypes = {
  username: PropTypes.string,
  buttonText: PropTypes.string,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string
};

export default KofiButton;