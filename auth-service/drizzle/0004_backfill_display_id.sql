-- Backfill display_id for existing users without one
-- Run after 0003_profile_center.sql

DO $$
DECLARE
  r RECORD;
  new_id varchar(9);
  attempts int;
BEGIN
  FOR r IN SELECT id FROM users WHERE display_id IS NULL LOOP
    attempts := 0;
    LOOP
      new_id := lpad((floor(random() * 900000000) + 100000000)::text, 9, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE display_id = new_id);
      attempts := attempts + 1;
      IF attempts > 30 THEN
        RAISE EXCEPTION 'Failed to generate unique display_id for user %', r.id;
      END IF;
    END LOOP;
    UPDATE users SET display_id = new_id, updated_at = now() WHERE id = r.id;
  END LOOP;
END $$;
