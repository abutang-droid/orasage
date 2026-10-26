#!/usr/bin/env python3
"""Compose green crystal 9:16 short video from storyboard frames + TTS."""

from __future__ import annotations

import math
import os
import subprocess
import wave
from pathlib import Path

import struct

OUT = Path("/workspace/assets/green-crystal-video")
ART = Path("/opt/cursor/artifacts/green-crystal-video")
ART.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920
FPS = 30
FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"

# Slightly extended to keep natural speech pacing (~36s)
SHOTS = [
    {"img": "shot1-earth-core.png", "dur": 5.5, "zoom": "in", "narr": "n1.mp3", "narr_start": 0.35},
    {"img": "shot2-crystal-growth.png", "dur": 6.0, "zoom": "in", "narr": "n2.mp3", "narr_start": 0.25},
    {"img": "shot3-unearthed.png", "dur": 5.0, "zoom": "in", "narr": "n3.mp3", "narr_start": 0.2},
    {"img": "shot4-cutting.png", "dur": 6.0, "zoom": "in", "narr": "n4.mp3", "narr_start": 0.2},
    {"img": "shot5-polished-prism.png", "dur": 5.2, "zoom": "out", "narr": "n5.mp3", "narr_start": 0.2},
    {"img": "shot6-wearing.png", "dur": 5.3, "zoom": "up", "narr": "n6.mp3", "narr_start": 0.25},
    {"img": "shot7-endcard.png", "dur": 3.5, "zoom": "in", "narr": None, "narr_start": 0},
]
XFADE = 0.45


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd[:8]), "...")
    subprocess.run(cmd, check=True)


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def write_wav(path: Path, samples: list[float], rate: int = 44100) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        frames = b"".join(
            struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples
        )
        w.writeframes(frames)


def synth_ambient(total: float, path: Path) -> None:
    """Ethereal drone → brighter mid → crystal bowl ring."""
    rate = 44100
    n = int(total * rate)
    samples: list[float] = []
    for i in range(n):
        t = i / rate
        # Progress 0..1
        p = t / total
        # Low drone (earth)
        drone = 0.12 * math.sin(2 * math.pi * 55 * t)
        drone += 0.06 * math.sin(2 * math.pi * 82.5 * t + 0.3)
        # Mid pad grows
        pad = (0.04 + 0.08 * p) * math.sin(2 * math.pi * 220 * t)
        pad += (0.03 + 0.05 * p) * math.sin(2 * math.pi * 330 * t + 1.1)
        # Soft shimmer (high)
        shimmer = (0.01 + 0.04 * p) * math.sin(2 * math.pi * 880 * t) * (
            0.5 + 0.5 * math.sin(2 * math.pi * 0.35 * t)
        )
        # Water-drop-ish soft clicks early
        drop = 0.0
        if t < 8:
            for dt in (1.2, 2.8, 4.5, 6.7):
                x = t - dt
                if 0 <= x < 0.08:
                    drop += 0.18 * math.exp(-x * 60) * math.sin(2 * math.pi * 1200 * x)

        # Crystal ring near end (~ last 3.5s)
        ring = 0.0
        ring_t = total - 3.2
        if t >= ring_t:
            x = t - ring_t
            env = math.exp(-x * 1.1)
            ring = env * (
                0.28 * math.sin(2 * math.pi * 523.25 * t)  # C5
                + 0.18 * math.sin(2 * math.pi * 659.25 * t)  # E5
                + 0.12 * math.sin(2 * math.pi * 784.0 * t)  # G5
                + 0.08 * math.sin(2 * math.pi * 1046.5 * t)
            )

        # Brighten after polish (~ mid)
        bright = 0.0
        if p > 0.55:
            bp = (p - 0.55) / 0.45
            bright = 0.05 * bp * math.sin(2 * math.pi * 392 * t + 0.2)

        # Soft noise bed (very quiet)
        noise = 0.008 * (1 - p * 0.5) * math.sin(2 * math.pi * (37 + 19 * math.sin(t)) * t)

        s = drone + pad + shimmer + drop + ring + bright + noise
        # Gentle overall envelope
        fade_in = min(1.0, t / 0.8)
        fade_out = min(1.0, (total - t) / 0.6)
        samples.append(max(-0.95, min(0.95, s * fade_in * fade_out)))

    write_wav(path, samples, rate)


def make_shot_clip(idx: int, shot: dict, out_path: Path) -> None:
    img = OUT / shot["img"]
    dur = shot["dur"]
    frames = int(dur * FPS)
    # Oversample for zoompan
    zframes = frames

    if shot["zoom"] == "in":
        # Slow push in
        zexpr = f"min(zoom+0.00055,1.18)"
        xexpr = "iw/2-(iw/zoom/2)"
        yexpr = "ih/2-(ih/zoom/2)"
    elif shot["zoom"] == "out":
        zexpr = f"if(eq(on,1),1.16,max(zoom-0.0005,1.0))"
        xexpr = "iw/2-(iw/zoom/2)"
        yexpr = "ih/2-(ih/zoom/2)"
    else:  # up — slow tilt up feel via y drift
        zexpr = f"min(zoom+0.00035,1.12)"
        xexpr = "iw/2-(iw/zoom/2)"
        yexpr = f"(ih-ih/zoom)*(1-on/{zframes})"

    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},"
        f"zoompan=z='{zexpr}':x='{xexpr}':y='{yexpr}':d={zframes}:s={W}x{H}:fps={FPS},"
        f"eq=contrast=1.05:saturation=1.08:brightness=0.02,"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={dur - 0.4}:d=0.4"
    )

    # End card text overlay
    if idx == 6:
        # Escape for drawtext
        vf += (
            f",drawtext=fontfile={FONT}:text='Orico Cosmos':fontsize=64:"
            f"fontcolor=0xE8F5E9@0.95:x=(w-text_w)/2:y=(h*0.42):"
            f"alpha='if(lt(t,0.4),0,min(1,(t-0.4)/0.8))',"
            f"drawtext=fontfile={FONT}:text='Manto Energy Shop':fontsize=36:"
            f"fontcolor=0xA5D6A7@0.9:x=(w-text_w)/2:y=(h*0.42)+90:"
            f"alpha='if(lt(t,0.9),0,min(1,(t-0.9)/0.8))'"
        )

    run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(img),
            "-vf",
            vf,
            "-t",
            str(dur),
            "-r",
            str(FPS),
            "-pix_fmt",
            "yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-an",
            str(out_path),
        ]
    )


def concat_with_xfade(clips: list[Path], durs: list[float], out_path: Path) -> float:
    if len(clips) == 1:
        out_path.write_bytes(clips[0].read_bytes())
        return durs[0]

    inputs: list[str] = []
    for c in clips:
        inputs += ["-i", str(c)]

    # Chain xfade
    filter_parts = []
    # First offset = d0 - xfade
    offset = durs[0] - XFADE
    prev = "[0:v]"
    for i in range(1, len(clips)):
        out_label = f"[v{i}]" if i < len(clips) - 1 else "[vout]"
        filter_parts.append(
            f"{prev}[{i}:v]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}{out_label}"
        )
        prev = out_label
        if i < len(clips) - 1:
            offset += durs[i] - XFADE

    total = sum(durs) - XFADE * (len(clips) - 1)
    fc = ";".join(filter_parts)
    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        fc,
        "-map",
        "[vout]",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-r",
        str(FPS),
        "-t",
        f"{total:.3f}",
        str(out_path),
    ]
    run(cmd)
    return total


def build_narration_track(total: float, path: Path) -> None:
    # Place each narration at cumulative shot starts (accounting for xfade)
    starts = []
    t = 0.0
    for i, shot in enumerate(SHOTS):
        starts.append(t + shot["narr_start"])
        t += shot["dur"] - (XFADE if i < len(SHOTS) - 1 else 0)

    # Build filter_complex adelay + amix
    inputs = []
    filters = []
    labels = []
    for i, shot in enumerate(SHOTS):
        if not shot["narr"]:
            continue
        narr = OUT / shot["narr"]
        inputs += ["-i", str(narr)]
        idx = len(labels)
        delay_ms = int(starts[i] * 1000)
        # Soften voice a bit
        filters.append(
            f"[{idx}:a]volume=1.15,afade=t=in:st=0:d=0.05,afade=t=out:st={probe_duration(narr)-0.12}:d=0.12,adelay={delay_ms}|{delay_ms}[a{idx}]"
        )
        labels.append(f"[a{idx}]")

    n = len(labels)
    fc = ";".join(filters) + f";{''.join(labels)}amix=inputs={n}:duration=longest:normalize=0[aout]"
    run(
        [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            fc,
            "-map",
            "[aout]",
            "-t",
            f"{total:.3f}",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(path),
        ]
    )


def main() -> None:
    clip_paths: list[Path] = []
    durs: list[float] = []
    for i, shot in enumerate(SHOTS):
        cp = OUT / f"clip{i}.mp4"
        print(f"=== Shot {i+1}: {shot['img']} ({shot['dur']}s) ===")
        make_shot_clip(i, shot, cp)
        clip_paths.append(cp)
        durs.append(shot["dur"])

    silent_video = OUT / "video_silent.mp4"
    total = concat_with_xfade(clip_paths, durs, silent_video)
    print(f"Total video duration: {total:.2f}s")

    ambient_wav = OUT / "ambient.wav"
    synth_ambient(total, ambient_wav)

    narr_aac = OUT / "narration_mix.m4a"
    build_narration_track(total, narr_aac)

    # Mix ambient + narration
    mixed_audio = OUT / "audio_mix.m4a"
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(ambient_wav),
            "-i",
            str(narr_aac),
            "-filter_complex",
            "[0:a]volume=0.55[amb];[1:a]volume=1.0[nar];[amb][nar]amix=inputs=2:duration=first:dropout_transition=2[aout]",
            "-map",
            "[aout]",
            "-t",
            f"{total:.3f}",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            str(mixed_audio),
        ]
    )

    final = ART / "green-crystal-orico-cosmos.mp4"
    final_repo = OUT / "green-crystal-orico-cosmos.mp4"
    for dest in (final, final_repo):
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(silent_video),
                "-i",
                str(mixed_audio),
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-shortest",
                "-movflags",
                "+faststart",
                str(dest),
            ]
        )

    print("DONE:", final)
    print("Duration:", probe_duration(final))


if __name__ == "__main__":
    main()
