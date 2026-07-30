'use client';

export type UploadedMedia = {
  id: number;
  publicUrl: string;
};

export type UploadProgress = {
  /** 0–100 */
  percent: number;
  loaded: number;
  total: number;
};

/**
 * Upload a file to admin `/api/cms/media` with upload progress (XHR).
 * Progress reflects browser → admin transfer; CMS hop is included in the wait after 100%.
 */
export function uploadMediaWithProgress(
  file: File,
  alt: string,
  onProgress?: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/cms/media');
    xhr.responseType = 'json';

    const onAbort = () => {
      xhr.abort();
      reject(new Error('已取消上传'));
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error('已取消上传'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress?.({ percent, loaded: event.loaded, total: event.total });
    };

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      const data = xhr.response as { id?: number; publicUrl?: string; error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && data?.id && data.publicUrl) {
        onProgress?.({ percent: 100, loaded: file.size, total: file.size });
        resolve({ id: data.id, publicUrl: data.publicUrl });
        return;
      }
      reject(new Error(data?.error || `上传失败 (${xhr.status})`));
    };

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('网络错误，上传失败'));
    };

    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('已取消上传'));
    };

    const form = new FormData();
    form.append('file', file);
    form.append('alt', alt || file.name);
    xhr.send(form);
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
