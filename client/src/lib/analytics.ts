type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    __pptvAnalyticsEvents__?: Array<{
      name: string;
      payload: AnalyticsPayload;
      timestamp: string;
    }>;
  }
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const event = {
    name,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.__pptvAnalyticsEvents__ = window.__pptvAnalyticsEvents__ ?? [];
  window.__pptvAnalyticsEvents__.push(event);
  window.dispatchEvent(new CustomEvent("pptv:track", { detail: event }));

  if (import.meta.env.DEV) {
    console.info("[analytics]", name, payload);
  }
}
