import type { Incident } from "./types";

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function recommendationFor(incident: Incident): string {
  if (incident.state === "RESOLVED") {
    return "Incident is resolved.";
  }

  if (incident.state === "TRIAGED") {
    return `Route to ${incident.assigned_team} for resolution.`;
  }

  return `Triage and assign to ${incident.assigned_team}.`;
}

export function priorityFor(severity: string): string {
  const priorities: Record<string, string> = {
    CRITICAL: "P1",
    HIGH: "P2",
    MEDIUM: "P3",
    LOW: "P4",
  };

  return priorities[severity] ?? "Unassigned";
}
