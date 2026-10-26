/*
# Restore public subject-outline submissions

1. Purpose
- Restore the permission required for visitors who are not signed in to submit the public subject outline form.

2. Modified table
- `subject_submissions`: grants anonymous visitors INSERT access only to the five fields supplied by the public form: `teacher_name`, `submission_date`, `option_one`, `option_two`, and `option_three`.

3. Security
- Does not grant anonymous visitors SELECT, UPDATE, or DELETE access.
- Existing row-level policy continues to permit anonymous inserts.
- Database defaults continue to set `status`, `created_at`, and `updated_at`.

4. Important notes
- Staff-only dashboard records remain readable and editable only after sign-in.
- No rows, columns, or existing data are deleted or changed.
*/

GRANT INSERT (teacher_name, submission_date, option_one, option_two, option_three)
ON subject_submissions TO anon;
