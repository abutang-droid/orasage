#!/usr/bin/env node
import { UA } from './_commons-ua.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function searchCommons(query) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const data = await res.json();
  return (data.query?.search ?? []).map((s) => s.title.replace(/^File:/, ''));
}

export async function resolveUrl(filename) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${filename}`)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const data = await res.json();
  const page = Object.values(data.query?.pages ?? {})[0];
  if (page?.missing) return null;
  return page?.imageinfo?.[0]?.url ?? null;
}

const QUERIES = {
  fatima: 'Fatima Zahra portrait',
  lakshmi: 'Lakshmi statue Hindu',
  guan_yu: 'Guan Yu statue temple',
  jade_emperor: 'Jade Emperor statue',
  ogun: 'Ogun orisha statue',
  guru_nanak: 'Guru Nanak painting',
  elijah: 'Elijah fiery chariot icon',
  amaterasu: 'Amaterasu cave ukiyo-e',
  mahavira: 'Mahavira Jain statue',
  ahura_mazda: 'Ahura Mazda Naqsh-e Rustam',
  confucius: 'Confucius statue marble',
  dangun: 'Dangun Korea mural',
  iemanja: 'Yemanja statue Brazil',
  oyasama: 'Oyasama Tenrikyo',
  cao_dai_mother: 'Cao Dai divine eye temple',
};

async function main() {
  for (const [code, q] of Object.entries(QUERIES)) {
    await sleep(3000);
    const hits = await searchCommons(q);
    let url = null;
    let picked = null;
    for (const file of hits) {
      await sleep(1500);
      url = await resolveUrl(file);
      if (url) { picked = file; break; }
    }
    console.log(`${code}: ${picked ?? 'NONE'}`);
  }
}

main();
