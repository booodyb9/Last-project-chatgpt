import React, { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AILeadAssistant = React.lazy(() => import('./AILeadAssistant'));
const SmartLeadPrompt = React.lazy(() => import('./SmartLeadPrompt'));

type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function DeferredPublicEnhancements() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) {
      setReady(false);
      return;
    }

    const idleWindow = window as IdleWindow;
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const enable = () => setReady(true);

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(enable, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(enable, 1200);
    }

    return () => {
      if (idleId !== undefined && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [isDashboard, location.pathname]);

  if (isDashboard || !ready) return null;

  return (
    <Suspense fallback={null}>
      <AILeadAssistant />
      <SmartLeadPrompt />
    </Suspense>
  );
}
