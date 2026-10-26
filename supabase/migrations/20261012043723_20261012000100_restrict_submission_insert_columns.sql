/*
# Restrict public submission writes to form content

1. Purpose
- Keep anonymous teacher submissions available while preventing callers from choosing workflow and audit fields.

2. Modified table
- `subject_submissions`: anonymous and authenticated clients may insert only teacher name, submission date, and the three outline option fields.
- Database defaults continue to set `status`, `created_at`, and `updated_at`.

3. Security
- Revoke broad INSERT permission from anonymous and authenticated API roles.
- Grant INSERT only for the user-entered submission columns.
- Existing row-level policies remain in force.

4. Important notes
- Staff-only status changes continue through authenticated UPDATE access.
- No existing rows or columns are deleted or changed.
*/

REVOKE INSERT ON subject_submissions FROM anon, authenticated;
GRANT INSERT (teacher_name, submission_date, option_one, option_two, option_three) ON subject_submissions TO anon, authenticated;
