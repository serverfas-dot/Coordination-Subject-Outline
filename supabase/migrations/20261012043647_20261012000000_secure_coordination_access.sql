/*
# Secure coordination workspace access

1. Purpose
- Keep the public teacher form available without requiring a visitor account.
- Move all staff-only workspace access behind Supabase email/password authentication.

2. Access changes
- `subject_submissions`: anonymous visitors may create submissions; only signed-in users may read, update, or delete submissions.
- `coordination_settings`: anonymous visitors may read the public form configuration; only signed-in users may create, update, or delete configuration.
- `coordination_backups`: only signed-in users may read, create, update, or delete backups.

3. Security
- Row level security remains enabled on every table.
- The previous public CRUD policies are replaced with separate least-privilege policies for each operation.
- No rows or columns are deleted or changed.

4. Important notes
- The app must use Supabase Auth for staff sign-in before opening dashboards.
- Public form submissions remain available to anonymous visitors.
*/

ALTER TABLE subject_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordination_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Public can create submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Public can update submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Public can delete submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Public can read submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Public can insert submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Staff can view submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Staff can create submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Staff can update submissions" ON subject_submissions;
DROP POLICY IF EXISTS "Staff can delete submissions" ON subject_submissions;

CREATE POLICY "Public can insert submissions" ON subject_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can view submissions" ON subject_submissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can update submissions" ON subject_submissions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff can delete submissions" ON subject_submissions
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can view settings" ON coordination_settings;
DROP POLICY IF EXISTS "Public can create settings" ON coordination_settings;
DROP POLICY IF EXISTS "Public can update settings" ON coordination_settings;
DROP POLICY IF EXISTS "Public can delete settings" ON coordination_settings;
DROP POLICY IF EXISTS "Public can read settings" ON coordination_settings;
DROP POLICY IF EXISTS "Public can insert settings" ON coordination_settings;
DROP POLICY IF EXISTS "Staff can view settings" ON coordination_settings;
DROP POLICY IF EXISTS "Staff can create settings" ON coordination_settings;
DROP POLICY IF EXISTS "Staff can update settings" ON coordination_settings;
DROP POLICY IF EXISTS "Staff can delete settings" ON coordination_settings;

CREATE POLICY "Public can read settings" ON coordination_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff can insert settings" ON coordination_settings
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update settings" ON coordination_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff can delete settings" ON coordination_settings
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public can view backups" ON coordination_backups;
DROP POLICY IF EXISTS "Public can create backups" ON coordination_backups;
DROP POLICY IF EXISTS "Public can update backups" ON coordination_backups;
DROP POLICY IF EXISTS "Public can delete backups" ON coordination_backups;
DROP POLICY IF EXISTS "Staff can view backups" ON coordination_backups;
DROP POLICY IF EXISTS "Staff can create backups" ON coordination_backups;
DROP POLICY IF EXISTS "Staff can update backups" ON coordination_backups;
DROP POLICY IF EXISTS "Staff can delete backups" ON coordination_backups;

CREATE POLICY "Staff can view backups" ON coordination_backups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create backups" ON coordination_backups
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update backups" ON coordination_backups
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff can delete backups" ON coordination_backups
  FOR DELETE TO authenticated USING (true);
