'use client';

export function trackEvent(event: string, metadata?: Record<string, unknown>) {
  const data: Record<string, unknown> = {
    event,
    path: window.location.pathname,
    referrer: document.referrer || '',
    metadata: metadata || {},
  };

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    keepalive: true,
  }).catch(() => {});
}
