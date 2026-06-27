"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listIncidents } from "@/lib/api";
import { formatDate, priorityFor } from "@/lib/incident";
import type { Incident } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function IncidentTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listIncidents()
      .then((data) => {
        setIncidents(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-sm text-muted shadow-soft">
        Loading incidents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center shadow-soft">
        <h2 className="text-lg font-semibold text-ink">No incidents yet</h2>
        <p className="mt-2 text-sm text-muted">
          Create an incident to see the triage output and current status.
        </p>
        <Link
          href="/incidents/new"
          className="mt-5 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Create Incident
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Incident</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Assigned Team</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="font-semibold text-ink hover:text-accent"
                  >
                    {incident.title}
                  </Link>
                  <div className="mt-1 max-w-md truncate text-xs text-muted">
                    {incident.description || "No description"}
                  </div>
                </td>
                <td className="px-4 py-4 font-medium">{incident.severity}</td>
                <td className="px-4 py-4">{priorityFor(incident.severity)}</td>
                <td className="px-4 py-4">{incident.assigned_team}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={incident.state} />
                </td>
                <td className="px-4 py-4 text-muted">
                  {formatDate(incident.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
