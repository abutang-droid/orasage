export const externalUrls = {
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  temple: 'https://tarot.orasage.com/temple',
  shop: 'https://shop.orasage.com',
  auth: 'https://auth.orasage.com/center',
  authLogin: 'https://auth.orasage.com/login',
  cms: 'https://admin.orasage.com/cms',
} as const;

/** 祈福 / 功德深链（tarot 子域） */
export function tarotBlessingUrls() {
  const base = externalUrls.tarot.replace(/\/$/, '');
  return {
    merit: `${base}/profile/merit`,
    temple: externalUrls.temple,
    settings: `${base}/profile/settings`,
  };
}
