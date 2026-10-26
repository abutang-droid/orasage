#!/usr/bin/env python3
"""Build a 3s silent idle clip from identity-lock.png.

Locked camera, closed mouth, tiny breathing / head drift, slow gold-halo
pulse and particle twinkle. Requires opencv-python-headless and mediapipe
at build time; the model is downloaded to /tmp and is not a runtime app dep.
"""

from __future__ import annotations

import math
import subprocess
import sys
import urllib.request
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "identity-lock.png"
OUT = ROOT / "silent-idle-3s.mp4"
MODEL = Path("/tmp/mp-models/face_landmarker.task")
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/latest/face_landmarker.task"
)

DURATION = 3.0
FPS = 24
N_FRAMES = int(DURATION * FPS)


def ensure_model() -> None:
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    if MODEL.exists() and MODEL.stat().st_size > 1000:
        return
    urllib.request.urlretrieve(MODEL_URL, MODEL)


def landmarks_xy(src_bgr: np.ndarray) -> np.ndarray:
    from mediapipe.tasks.python import BaseOptions
    from mediapipe.tasks.python.vision import (
        FaceLandmarker,
        FaceLandmarkerOptions,
        RunningMode,
    )
    import mediapipe as mp

    rgb = cv2.cvtColor(src_bgr, cv2.COLOR_BGR2RGB)
    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(MODEL)),
        running_mode=RunningMode.IMAGE,
        num_faces=1,
    )
    with FaceLandmarker.create_from_options(options) as landmarker:
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = landmarker.detect(mp_image)
    if not result.face_landmarks:
        raise RuntimeError("no face landmarks on identity lock")
    h, w = src_bgr.shape[:2]
    lm = result.face_landmarks[0]
    return np.array([[p.x * w, p.y * h] for p in lm], dtype=np.float32)


def gold_glow(img: np.ndarray, t: float) -> np.ndarray:
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w * 0.50, h * 0.70
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2 / 1.15)
    pulse = 0.5 + 0.5 * math.sin(2 * math.pi * t / 3.0)
    sigma = w * 0.22
    falloff = np.exp(-(r**2) / (2 * sigma**2)).astype(np.float32)
    strength = (0.035 + 0.028 * pulse) * falloff
    glow = np.zeros_like(img, dtype=np.float32)
    glow[..., 0] = 40  # B
    glow[..., 1] = 170  # G
    glow[..., 2] = 255  # R-ish gold in BGR
    out = img.astype(np.float32) + glow * strength[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def particles(img: np.ndarray, t: float) -> np.ndarray:
    h, w = img.shape[:2]
    out = img.astype(np.float32)
    # Deterministic sparkle seeds around the halo
    seeds = [
        (0.22, 0.18, 1.7, 0.4),
        (0.78, 0.17, 2.1, 1.1),
        (0.14, 0.32, 1.4, 2.0),
        (0.86, 0.30, 1.9, 0.2),
        (0.08, 0.48, 2.4, 1.6),
        (0.93, 0.46, 1.6, 0.8),
        (0.18, 0.62, 2.0, 2.3),
        (0.84, 0.64, 1.5, 1.4),
        (0.48, 0.08, 1.8, 0.6),
        (0.62, 0.11, 2.2, 1.9),
        (0.36, 0.12, 1.3, 2.6),
        (0.70, 0.22, 2.6, 0.3),
    ]
    overlay = np.zeros_like(out)
    for x_n, y_n, freq, phase in seeds:
        x = int(x_n * w)
        y = int(y_n * h)
        a = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(2 * math.pi * (t * freq / 3.0) + phase))
        rad = 1 + int(2 * a)
        cv2.circle(overlay, (x, y), rad, (90 * a, 190 * a, 255 * a), -1)
    overlay = cv2.GaussianBlur(overlay, (0, 0), 1.2)
    return np.clip(out + overlay * 0.55, 0, 255).astype(np.uint8)


def micro_motion(img: np.ndarray, t: float, pivot: tuple[float, float]) -> np.ndarray:
    h, w = img.shape[:2]
    # Breathing scale around mid-chest; crop back so canvas / camera stay locked.
    breath = 1.0 + 0.0032 * math.sin(2 * math.pi * t / 3.0)
    nod = 1.15 * math.sin(2 * math.pi * t / 3.0 + 0.4)
    tilt = 0.16 * math.sin(2 * math.pi * t / 5.2)
    cx, cy = pivot
    M = cv2.getRotationMatrix2D((cx, cy), tilt, breath)
    M[1, 2] += nod
    return cv2.warpAffine(
        img,
        M,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE,
    )


def hair_strands(img: np.ndarray, t: float) -> np.ndarray:
    """Very slight horizontal wobble on outer hair columns only."""
    h, w = img.shape[:2]
    shift = 0.45 * math.sin(2 * math.pi * t / 3.4)
    map_x, map_y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    # Affect left/right edges more than the face column
    edge = np.clip((np.abs(map_x - w / 2) - w * 0.22) / (w * 0.28), 0, 1)
    map_x = map_x + shift * edge * (0.4 + 0.6 * (map_y / h))
    return cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def render_frame(base: np.ndarray, lm: np.ndarray, t: float) -> np.ndarray:
    frame = base.copy()
    pivot = (float(lm[1][0]), float(lm[1][1] + 280))
    frame = micro_motion(frame, t, pivot)
    frame = hair_strands(frame, t)
    frame = gold_glow(frame, t)
    frame = particles(frame, t)
    return frame


def encode(frames_dir: Path, out: Path) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(frames_dir / "frame_%03d.png"),
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-preset",
        "slow",
        "-movflags",
        "+faststart",
        "-t",
        str(DURATION),
        str(out),
    ]
    subprocess.check_call(cmd)


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC}", file=sys.stderr)
        return 1
    ensure_model()
    base = cv2.imread(str(SRC), cv2.IMREAD_COLOR)
    if base is None:
        print("failed to read identity lock", file=sys.stderr)
        return 1
    lm = landmarks_xy(base)
    frames_dir = Path("/tmp/ai-consultant-silent-idle-frames")
    frames_dir.mkdir(parents=True, exist_ok=True)
    for i in range(N_FRAMES):
        t = i / FPS
        frame = render_frame(base, lm, t)
        cv2.imwrite(str(frames_dir / f"frame_{i:03d}.png"), frame, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        if i % 12 == 0:
            print(f"frame {i}/{N_FRAMES} t={t:.2f}s")
    encode(frames_dir, OUT)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
