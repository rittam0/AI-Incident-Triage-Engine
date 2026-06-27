import { CreateIncidentForm } from "@/components/CreateIncidentForm";

export default function NewIncidentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Create Incident</h1>
        <p className="mt-2 text-sm text-muted">
          Submit a new incident to the existing backend triage service.
        </p>
      </div>
      <CreateIncidentForm />
    </div>
  );
}
