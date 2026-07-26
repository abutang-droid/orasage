-- World Mini App: link platform users to World wallet addresses (SIWE).
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address varchar(42);
CREATE UNIQUE INDEX IF NOT EXISTS users_wallet_address_uidx
  ON users (wallet_address)
  WHERE wallet_address IS NOT NULL;
