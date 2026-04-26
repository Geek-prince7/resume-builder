import { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const SHOW_PLACEHOLDER = import.meta.env.VITE_AD_PLACEHOLDER === 'true';

function loadAdSenseScript(clientId) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-adsense-loader="true"]');
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = 'anonymous';
    script.dataset.adsenseLoader = 'true';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function AdSlot({
  slot,
  format = 'auto',
  fullWidthResponsive = true,
  className = '',
  minHeight = 90,
}) {
  const adRef = useRef(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot || requestedRef.current) return;

    let cancelled = false;
    loadAdSenseScript(ADSENSE_CLIENT_ID)
      .then(() => {
        if (cancelled || !adRef.current || requestedRef.current) return;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        requestedRef.current = true;
      })
      .catch(() => {
        // Ignore ad load failures in UI.
      });

    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ADSENSE_CLIENT_ID || !slot) {
    if (!SHOW_PLACEHOLDER) return null;
    return (
      <div
        className={`rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-xs flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        Ad placeholder
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
