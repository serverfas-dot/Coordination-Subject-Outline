/*
# Allow fourth and fifth teaching plan submissions

1. Modified Table
- `subject_submissions`: anonymous and authenticated callers may include `option_four` and `option_five` when creating a submission.

2. Security
- Keeps INSERT limited to teacher-entered form fields.
- Workflow and audit columns remain protected from public INSERT access.
- Existing row-level policies remain unchanged.

3. Important Notes
- This grant works with the two new nullable plan columns.
- Existing submissions and existing permissions are preserved.
*/

REVOKE INSERT ON subject_submissions FROM anon, authenticated;
GRANT INSERT (teacher_name, submission_date, option_one, option_two, option_three, option_four, option_five) ON subject_submissions TO anon, authenticated;