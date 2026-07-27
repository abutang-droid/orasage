-- World ID (IDKit): store verified nullifier per user for uniqueness / login.
ALTER TABLE users ADD COLUMN IF NOT EXISTS world_nullifier varchar(128);
CREATE UNIQUE INDEX IF NOT EXISTS users_world_nullifier_uidx
  ON users (world_nullifier)
  WHERE world_nullifier IS NOT NULL;
