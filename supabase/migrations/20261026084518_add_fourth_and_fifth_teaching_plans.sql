/*
# Add fourth and fifth teaching plans

1. Modified Tables
- `subject_submissions.option_four` (jsonb, nullable): stores the fourth teaching plan.
- `subject_submissions.option_five` (jsonb, nullable): stores the fifth teaching plan.

2. Security
- Existing row-level security policies and table privileges remain unchanged.
- The new columns are covered by the existing submission insert policy and public submission access model.

3. Important Notes
- Existing submissions are preserved and keep their current first three plans.
- New plans are optional for older records and are saved only when a teacher fills them in.
*/

ALTER TABLE subject_submissions
  ADD COLUMN IF NOT EXISTS option_four jsonb,
  ADD COLUMN IF NOT EXISTS option_five jsonb;