/** Short referral codes for share links */
export function generateReferralCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
