"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PdfMeta = {
  storagePath: string;
  displayName: string;
  updatedAt: string | null;
};

export function WhitepaperPdfUpload() {
  const [configured, setConfigured] = useState(true);
  const [pdf, setPdf] = useState<PdfMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whitepaper-pdf");
      const data = (await res.json()) as {
        ok?: boolean;
        configured?: boolean;
        pdf?: PdfMeta | null;
      };
      setConfigured(data.configured !== false);
      setPdf(data.pdf ?? null);
    } catch {
      setError("Could not load PDF settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Select a PDF file.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/whitepaper-pdf", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        pdf?: PdfMeta;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setPdf(data.pdf ?? null);
      setMessage("PDF uploaded. Visitors can download it after submitting the form.");
      form.reset();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">White paper PDF</CardTitle>
        <CardDescription>
          Upload the guide PDF to Firebase Storage. After a visitor submits the
          landing form, they receive a download via a signed link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <>
            {!configured ? (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                Firebase Storage env vars are missing. Add them in Vercel, then
                redeploy.
              </p>
            ) : null}
            {pdf ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <p>
                  <span className="font-medium text-slate-700">Current file:</span>{" "}
                  {pdf.displayName}
                </p>
                {pdf.updatedAt ? (
                  <p className="mt-1 text-slate-500">
                    Updated {new Date(pdf.updatedAt).toLocaleString()}
                  </p>
                ) : null}
                <p className="mt-2">
                  <a
                    href="/api/whitepaper-pdf"
                    className="font-medium text-teal-700 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test public download link
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No PDF uploaded yet.</p>
            )}
            <form onSubmit={onUpload} className="space-y-3">
              <input
                type="file"
                name="file"
                accept="application/pdf,.pdf"
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700"
              />
              <Button type="submit" disabled={uploading || !configured}>
                {uploading ? "Uploading…" : pdf ? "Replace PDF" : "Upload PDF"}
              </Button>
            </form>
            {message ? (
              <p className="text-sm text-green-700" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
