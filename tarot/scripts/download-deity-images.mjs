#!/usr/bin/env node
import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { execSync } from 'node:child_process';
import { UA } from './_commons-ua.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INCOMING = join(__dirname, '../tarot_pic/god/incoming');

const FILES = {
  fatima: 'Tile (Eastern Islamic Art Tile Persia, timurid period, 14th century) (47532235571).jpg',
  shiva: 'Shiva_Bangalore.jpg',
  lakshmi: 'Sandstone Lakshmi statue (10th century), Museum of Vietnamese History, Ho Chi Minh City - 20121014.JPG',
  shakyamuni: 'Gandhara_Buddha_(tnm).jpeg',
  ksitigarbha: 'Ksitigarbha Bodhisattva at Vietnamese Temple.png',
  guan_yu: 'Statue of Guan Yu the Sangharama at Daitian Temple, Kaohsiung.jpg',
  jade_emperor: 'Jade Emperor statue at Zhonggang Cihyu Temple 20250129.jpg',
  ogun: 'Orixás do Candomblé Nagô da Bahia MN 01 (Ogun).jpg',
  guru_nanak: 'Janamsakhi painting of Guru Nanak with Siddhas.jpg',
  allan_kardec: 'Allan_Kardec.jpg',
  elijah: "Russian - Prophet Elijah's Fiery Ascension - Walters 372748.jpg",
  amaterasu: 'Amaterasu cave crop.jpg',
  bahaullah: 'Bahaullah.jpg',
  mahavira: 'Mahavira Bruxelles 02 10 2011.jpg',
  ahura_mazda: 'Ahura Mazda (right) Invests Ardashir I With the Ring of Kingship (4895917806).jpg',
  confucius: 'Statue of Confucius at Beijing temple.JPG',
  dangun: 'Portrait of Dangun.jpg',
  pachamama: 'Museo Pachamama 04.jpg',
  iemanja: 'Monumento a Yemanjá, Pampulha.jpg',
  oyasama: 'Anecdotes of Oyasama.jpg',
  cao_dai_mother: 'Cao Dai eye.jpg',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function commonsUrl(filename) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${filename}`)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const data = await res.json();
  const page = Object.values(data.query?.pages ?? {})[0];
  if (page?.missing) throw new Error(`missing: ${filename}`);
  const url = page?.imageinfo?.[0]?.url;
  if (!url) throw new Error(`no url: ${filename}`);
  return url;
}

async function download(code, filename) {
  if (existsSync(join(INCOMING, `${code}.webp`))) {
    console.log(`[skip] ${code}`);
    return;
  }
  const url = await commonsUrl(filename);
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const tmp = join(INCOMING, `${code}.src.${ext}`);
  const out = join(INCOMING, `${code}.webp`);

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(tmp));

  try {
    execSync(
      `ffmpeg -y -loglevel error -i "${tmp}" -vf "scale=1024:1024:force_original_aspect_ratio=decrease,pad=1024:1024:(ow-iw)/2:(oh-ih)/2:black" "${out}"`,
      { stdio: 'pipe' },
    );
    unlinkSync(tmp);
  } catch {
    const { copyFileSync } = await import('node:fs');
    copyFileSync(tmp, out);
    try { unlinkSync(tmp); } catch { /* */ }
  }
  console.log(`[ok] ${code}`);
}

async function main() {
  mkdirSync(INCOMING, { recursive: true });
  const failed = [];
  for (const [code, file] of Object.entries(FILES)) {
    try {
      await download(code, file);
    } catch (err) {
      console.error(`[fail] ${code}: ${err.message}`);
      failed.push(code);
    }
    await sleep(2000);
  }
  if (failed.length) process.exit(1);
}

main();
