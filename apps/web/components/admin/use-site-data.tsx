"use client";

import { useEffect, useState } from "react";

import type { SiteData } from "@/lib/types";

export function useSiteData() {
  const [data, setData] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch("/api/site")
      .then((response) => response.json() as Promise<SiteData>)
      .then((payload) => {
        setData(payload);
        setStatus("Ready");
      })
      .catch(() => {
        setStatus("Failed to load.");
      });
  }, []);

  async function save(nextData: SiteData) {
    setData(nextData);
    setStatus("Saving...");

    const response = await fetch("/api/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextData),
    });

    setStatus(response.ok ? "Saved" : "Save failed");
  }

  return {
    data,
    setData,
    save,
    status,
  };
}
