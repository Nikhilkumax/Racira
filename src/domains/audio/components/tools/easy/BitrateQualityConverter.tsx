"use client";

/**
 * Bitrate/Quality Converter — re-encode audio at a different bitrate or
 * quality, per-tool UX layered on UniversalAudioConverter (which owns the
 * queue, native-vs-ffmpeg escalation, and per-file progress). Unlike the
 * Format Converter, the output format is fixed up front here: MP3 is the
 * canonical "make this file smaller / lighter" target, and the tool opens on
 * the bitrate choice rather than the format grid.
 */

import UniversalAudioConverter from "@/domains/audio/components/tools/UniversalAudioConverter";

export default function BitrateQualityConverter() {
  return <UniversalAudioConverter defaultFormat="mp3" />;
}
