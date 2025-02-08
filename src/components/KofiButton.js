import { useEffect } from 'react';

const KofiButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;
    
    script.onload = () => {
      // eslint-disable-next-line no-undef
      window.kofiWidgetOverlay?.draw('jooovi', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#d9534f',
        'floating-chat.donateButton.text-color': '#fff'
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default KofiButton;