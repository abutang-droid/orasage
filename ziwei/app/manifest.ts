import type { MetadataRoute } from 'next';
import { installManifest } from '../../shared/pwa/install-manifest';

export default function manifest(): MetadataRoute.Manifest {
  return installManifest('ziwei');
}
