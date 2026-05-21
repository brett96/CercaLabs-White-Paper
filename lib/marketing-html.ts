import fs from "fs";
import path from "path";

export function loadMarketingHtml(filename: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "content", filename),
    "utf8"
  );
}

export function splitAtMount(
  html: string,
  mountId: string
): { before: string; after: string } {
  const marker = `<div id="${mountId}"></div>`;
  const idx = html.indexOf(marker);
  if (idx === -1) {
    return { before: html, after: "" };
  }
  return {
    before: html.slice(0, idx),
    after: html.slice(idx + marker.length),
  };
}
