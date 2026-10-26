/*
# Create Coordination - Subject Outline workspace

1. New Tables
- `subject_submissions`: public teacher-submitted weekly subject outline rows, including up to three teaching options, teacher, date, and workflow status.
- `coordination_settings`: shared school configuration and form option lists for the single school workspace.
- `coordination_backups`: downloadable JSON backup records created by the super administrator.

2. Security
- Row level security is enabled on every table.
- This first version is intentionally single-school and uses anon + authenticated policies so the public form can submit without a teacher account.
- Dashboard access is presented in the app as an operator gate; production deployment should connect these roles to Supabase Auth before exposing sensitive reports publicly.

3. Important Notes
- Data is append-friendly and no destructive schema changes are included.
- Status, report period, and option values are stored with each submission so historical reports remain understandable if the settings change later.
*/

CREATE TABLE IF NOT EXISTS subject_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name text NOT NULL,
  submission_date date NOT NULL DEFAULT CURRENT_DATE,
  option_one jsonb NOT NULL,
  option_two jsonb,
  option_three jsonb,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coordination_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL DEFAULT 'Faafu Atoll School',
  school_tagline text NOT NULL DEFAULT 'Learning together, growing with purpose',
  weeks jsonb NOT NULL DEFAULT '[]'::jsonb,
  grades jsonb NOT NULL DEFAULT '[]'::jsonb,
  subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coordination_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  backup_frequency text NOT NULL DEFAULT 'Weekly',
  backup_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subject_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view submissions" ON subject_submissions;
CREATE POLICY "Public can view submissions" ON subject_submissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create submissions" ON subject_submissions;
CREATE POLICY "Public can create submissions" ON subject_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update submissions" ON subject_submissions;
CREATE POLICY "Public can update submissions" ON subject_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete submissions" ON subject_submissions;
CREATE POLICY "Public can delete submissions" ON subject_submissions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can view settings" ON coordination_settings;
CREATE POLICY "Public can view settings" ON coordination_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create settings" ON coordination_settings;
CREATE POLICY "Public can create settings" ON coordination_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update settings" ON coordination_settings;
CREATE POLICY "Public can update settings" ON coordination_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete settings" ON coordination_settings;
CREATE POLICY "Public can delete settings" ON coordination_settings FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can view backups" ON coordination_backups;
CREATE POLICY "Public can view backups" ON coordination_backups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create backups" ON coordination_backups;
CREATE POLICY "Public can create backups" ON coordination_backups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update backups" ON coordination_backups;
CREATE POLICY "Public can update backups" ON coordination_backups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete backups" ON coordination_backups;
CREATE POLICY "Public can delete backups" ON coordination_backups FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS subject_submissions_date_idx ON subject_submissions (submission_date DESC);
CREATE INDEX IF NOT EXISTS subject_submissions_status_idx ON subject_submissions (status);
CREATE INDEX IF NOT EXISTS coordination_backups_created_at_idx ON coordination_backups (created_at DESC);
