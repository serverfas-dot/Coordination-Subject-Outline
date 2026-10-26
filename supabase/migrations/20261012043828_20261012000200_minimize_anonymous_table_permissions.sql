/*
# Minimize anonymous database permissions

1. Purpose
- Align table privileges with the row-level security rules so anonymous callers receive only the access required by the public form.

2. Modified tables
- `subject_submissions`: anonymous callers may only insert the public form fields.
- `coordination_settings`: anonymous callers may only read public form configuration.
- `coordination_backups`: anonymous callers receive no table privileges.

3. Security
- Revoke broad anonymous table privileges before granting the minimum required operations.
- Signed-in staff privileges remain available for the staff workspace policies.

4. Important notes
- This does not delete data or change any columns.
- Public form submission and public settings display remain available.
*/

REVOKE SELECT, INSERT, UPDATE, DELETE ON subject_submissions FROM anon;
GRANT INSERT (teacher_name, submission_date, option_one, option_two, option_three) ON subject_submissions TO anon;

REVOKE SELECT, INSERT, UPDATE, DELETE ON coordination_settings FROM anon;
GRANT SELECT ON coordination_settings TO anon;

REVOKE SELECT, INSERT, UPDATE, DELETE ON coordination_backups FROM anon;
