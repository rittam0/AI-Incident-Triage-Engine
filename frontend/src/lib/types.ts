export type Incident = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  assigned_team: string;
  state: string;
  created_at: string;
  updated_at: string;
};
