/*
# Restore public subject-outline submissions

1. Purpose
- Restore the table-level permission required for visitors who are not signed in to submit the public subject-outline form.

2. Modified table
- `subject_submissions`: anonymous visitors may insert only `teacher_name`, `submission_date`, `option_one`, `option_two`, and `option_three`.

3. Security
- Anonymous visitors receive no SELECT, UPDATE, or DELETE permission.
- Row-level security continues to limit inserts to the public submission policy.
- Database defaults continue to set `status`, `created_at`, and `updated_at`.

4. Important notes
- Staff-only dashboard records remain readable and editable only after sign-in.
- No rows, columns, or existing data are deleted or changed.
*/

GRANT INSERT (teacher_name, submission_date, option_one, option_two, option_three)
ON public.subject_submissions TO anon;
