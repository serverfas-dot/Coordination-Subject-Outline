/*
# Enable real-time updates for coordination tables

1. Purpose
- Allow the public form and admin dashboards to receive instant updates when settings or submissions change.

2. Changes
- Add `coordination_settings` and `subject_submissions` to the real-time publication so row changes are pushed to all connected clients.

3. Important notes
- No data is deleted or changed.
- Existing policies still control which rows each role can see.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE coordination_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE subject_submissions;
