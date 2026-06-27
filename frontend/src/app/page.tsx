import { IncidentTable } from "@/components/IncidentTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Incident Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Review incidents and their backend-generated triage assignments.
        </p>
      </div>
      <IncidentTable />
    </div>
  );
}
