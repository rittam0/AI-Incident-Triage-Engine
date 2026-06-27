"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getIncident, resolveIncident, triageIncident } from "@/lib/api";
import {
  formatDate,
  priorityFor,
  recommendationFor,
} from "@/lib/incident";
import type { Incident } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function IncidentDetail({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get("created") ? "Incident created successfully." : null,
  );

  useEffect(() => {
    getIncident(id)
      .then((data) => {
        setIncident(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function updateStatus(action: "triage" | "resolve") {
    setIsUpdating(true);
    setError(null);
    setNotice(null);

    try {
      const updated =
        action === "triage"
          ? await triageIncident(id)
          : await resolveIncident(id);
      setIncident(updated);
      setNotice(`Incident status updated to ${updated.state}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-sm text-muted shadow-soft">
        Loading incident...
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-sm text-muted shadow-soft">
        Incident not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-accent">
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-ink">
              {incident.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {incident.description || "No description provided."}
            </p>
          </div>
          <StatusBadge value={incident.state} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            AI triage output
          </h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="text-muted">Severity</dt>
              <dd className="mt-1 font-semibold text-ink">{incident.severity}</dd>
            </div>
            <div>
              <dt className="text-muted">Priority</dt>
              <dd className="mt-1 font-semibold text-ink">
                {priorityFor(incident.severity)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Assigned team</dt>
              <dd className="mt-1 font-semibold text-ink">
                {incident.assigned_team}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Recommendation</dt>
              <dd className="mt-1 font-semibold text-ink">
                {recommendationFor(incident)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Status update
          </h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="text-muted">Current status</dt>
              <dd className="mt-1">
                <StatusBadge value={incident.state} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Created</dt>
              <dd className="mt-1 font-semibold text-ink">
                {formatDate(incident.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Updated</dt>
              <dd className="mt-1 font-semibold text-ink">
                {formatDate(incident.updated_at)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isUpdating || incident.state !== "OPEN"}
              onClick={() => updateStatus("triage")}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Triage"}
            </button>
            <button
              type="button"
              disabled={isUpdating || incident.state !== "TRIAGED"}
              onClick={() => updateStatus("resolve")}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resolve
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
