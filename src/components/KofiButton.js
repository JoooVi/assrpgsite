// KofiButton.js

import { useEffect } from 'react';
import PropTypes from 'prop-types';

const KofiButton = ({ 
  username = 'jooovi',
  buttonText = 'Support me',
  backgroundColor = '#d9534f',
  textColor = '#fff'
}) => {
  // KofiButton.js

useEffect(() => {
  const kofiScriptUrl = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
  let idleId;
  let timeoutId;

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

  const loadWidget = () => {
    const existingScript = document.querySelector(`script[src="${kofiScriptUrl}"]`);
    if (existingScript) {
      drawWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = kofiScriptUrl;
    script.async = true;
    script.onload = drawWidget;
    script.onerror = () => console.error('Failed to load Ko-fi widget script');
    document.body.appendChild(script);
  };

  const scheduleWidget = () => {
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(loadWidget, { timeout: 5000 });
    } else {
      timeoutId = window.setTimeout(loadWidget, 2500);
    }
  };

  if (document.readyState === 'complete') scheduleWidget();
  else window.addEventListener('load', scheduleWidget, { once: true });

  return () => {
    window.removeEventListener('load', scheduleWidget);
    if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };

}, [username, buttonText, backgroundColor, textColor]);

  return null; // O componente não renderiza nada visível por si só
};

KofiButton.propTypes = {
  username: PropTypes.string,
  buttonText: PropTypes.string,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string
};

export default KofiButton;
