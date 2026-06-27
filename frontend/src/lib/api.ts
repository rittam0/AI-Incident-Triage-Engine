import type { Incident } from "./types";

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message = body.detail ?? message;
    } catch {
      // Keep the status-based fallback message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function listIncidents(): Promise<Incident[]> {
  const response = await fetch("/api/backend/incidents", { cache: "no-store" });
  return parseResponse<Incident[]>(response);
}

export async function getIncident(id: string): Promise<Incident> {
  const response = await fetch(`/api/backend/incidents/${id}`, {
    cache: "no-store",
  });
  return parseResponse<Incident>(response);
}

export async function createIncident(payload: {
  title: string;
  description?: string;
}): Promise<Incident> {
  const response = await fetch("/api/backend/incidents", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return parseResponse<Incident>(response);
}

export async function triageIncident(id: string): Promise<Incident> {
  const response = await fetch(`/api/backend/incidents/${id}/triage`, {
    method: "POST",
  });
  return parseResponse<Incident>(response);
}

export async function resolveIncident(id: string): Promise<Incident> {
  const response = await fetch(`/api/backend/incidents/${id}/resolve`, {
    method: "POST",
  });
  return parseResponse<Incident>(response);
}
