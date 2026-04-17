"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open?: (url: string) => void;
      };
    };
    createLemonSqueezy?: boolean;
  }
}

type CheckoutButtonProps = {
  checkoutUrl: string;
  className?: string;
  children: React.ReactNode;
};

export function CheckoutButton({ checkoutUrl, className, children }: CheckoutButtonProps) {
  useEffect(() => {
    if (window.createLemonSqueezy) {
      return;
    }

    const scriptContent = `
      (function () {
        if (window.createLemonSqueezy) return;
        const script = document.createElement('script');
        script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
        script.defer = true;
        script.onload = function () {
          if (window.LemonSqueezy) {
            window.createLemonSqueezy = true;
          }
        };
        document.head.appendChild(script);
      })();
    `;
    const script = document.createElement("script");
    script.textContent = scriptContent;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  function handleOpenCheckout() {
    if (!checkoutUrl) {
      return;
    }

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" onClick={handleOpenCheckout} className={className} disabled={!checkoutUrl}>
      {children}
    </button>
  );
}
