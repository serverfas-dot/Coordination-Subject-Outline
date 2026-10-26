/*
# Sync shared coordination form settings

1. New Columns
- `coordination_settings.teachers`: JSON list of teacher names shared by all app visitors.
- `coordination_settings.form_heading`: shared form heading text.
- `coordination_settings.form_subheading`: shared form subheading text.

2. Modified Tables
- Extends `coordination_settings` without removing or changing existing data.
- Existing rows receive the current default form values when the new columns are added.

3. Security
- The existing anon and authenticated CRUD policies continue to apply to these columns.

4. Important Notes
- These additions allow GitHub Pages and the Bolt preview to use the same teacher list and form wording.
- No existing rows, columns, or user submissions are deleted.
*/

ALTER TABLE coordination_settings
  ADD COLUMN IF NOT EXISTS teachers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS form_heading text NOT NULL DEFAULT 'Coordination Subject Outline',
  ADD COLUMN IF NOT EXISTS form_subheading text NOT NULL DEFAULT 'Complete the details below and submit your teaching plan.';