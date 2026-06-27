"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createIncident } from "@/lib/api";

export function CreateIncidentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const incident = await createIncident({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setSuccess("Incident created successfully.");
      router.push(`/incidents/${incident.id}?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create incident");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl rounded-lg border border-border bg-white p-6 shadow-soft"
    >
      {success ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-ink" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
          placeholder="Database connection timeout"
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-semibold text-ink" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-teal-100"
          placeholder="What happened, when it started, and who is affected."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating..." : "Create Incident"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
