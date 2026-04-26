import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleButton({ onSuccess, label = 'Continue with Google' }) {
  const btnRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized.current) return;

    const renderButton = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onSuccess(response.credential),
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: label.includes('up') ? 'signup_with' : 'signin_with',
        width: btnRef.current.offsetWidth,
      });
      initialized.current = true;
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = renderButton;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [onSuccess, label]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={btnRef} className="w-full flex justify-center" />;
}
