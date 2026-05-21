const VID = "cl_vid";
const SID = "cl_sid";

export function getVisitorCookies(): {
  visitorId: string | null;
  sessionId: string | null;
} {
  if (typeof document === "undefined") {
    return { visitorId: null, sessionId: null };
  }
  const get = (name: string) => {
    const m = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
      )
    );
    return m ? decodeURIComponent(m[1]!) : null;
  };
  return { visitorId: get(VID), sessionId: get(SID) };
}

export function getUtmFromSearch(search: string) {
  const p = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );
  return {
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
  };
}
