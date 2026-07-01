import { locales } from '../src/i18n/routing';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

// Generate fallback locale files from en.json for locales not yet translated
const messagesDir = join(import.meta.dirname ?? '.', '.');
const enPath = join(messagesDir, 'en.json');

for (const locale of locales) {
  const target = join(messagesDir, `${locale}.json`);
  if (!existsSync(target)) {
    copyFileSync(enPath, target);
  }
}
