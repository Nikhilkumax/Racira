/**
 * Scene organiser: a working list of scenes with their point of view, setting,
 * summary and length, plus the statistics a novelist actually uses — how the
 * words distribute across scenes and across points of view, and which scenes
 * are the outliers.
 *
 * A scene list is entered as one line per scene, `Title | POV | Setting | Words`,
 * with the trailing fields optional. The module also round-trips the list as
 * JSON so a board survives a refresh without a server.
 */
import { wordTokens } from "./tokenize.ts";

export interface Scene {
  title: string;
  pov?: string;
  setting?: string;
  summary?: string;
  words?: number;
}

export interface PovTally {
  name: string;
  scenes: number;
  words: number;
}

export interface SceneStats {
  scenes: number;
  words: number;
  averageWords: number;
  medianWords: number;
  povs: PovTally[];
  settings: number;
  longest?: { title: string; words: number };
  shortest?: { title: string; words: number };
}

/** Parse `Title | POV | Setting | Words` lines into scenes. */
export function parseScenes(text: string): Scene[] {
  const scenes: Scene[] = [];
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split("|").map((part) => part.trim());
    const title = parts[0] ?? "";
    if (!title) continue;
    const words = parts[3] ? Number(parts[3].replace(/[^0-9.]/g, "")) : NaN;
    scenes.push({
      title,
      pov: parts[1] || undefined,
      setting: parts[2] || undefined,
      words: Number.isFinite(words) ? Math.round(words) : undefined,
    });
  }
  return scenes;
}

/** The word count of a scene's summary, used when no explicit count is given. */
export function summaryWords(scene: Scene): number {
  return scene.words ?? (scene.summary ? wordTokens(scene.summary).length : 0);
}

/** Scene and point-of-view statistics. */
export function sceneStats(scenes: Scene[]): SceneStats {
  const counts = scenes.map(summaryWords);
  const words = counts.reduce((sum, count) => sum + count, 0);
  const sorted = [...counts].sort((a, b) => a - b);
  const medianWords = sorted.length === 0 ? 0 : sorted[Math.floor((sorted.length - 1) / 2)];

  const povMap = new Map<string, PovTally>();
  for (const scene of scenes) {
    const name = scene.pov?.trim() || "(none)";
    const tally = povMap.get(name) ?? { name, scenes: 0, words: 0 };
    tally.scenes += 1;
    tally.words += summaryWords(scene);
    povMap.set(name, tally);
  }

  let longest: SceneStats["longest"];
  let shortest: SceneStats["shortest"];
  scenes.forEach((scene, index) => {
    const count = counts[index];
    if (!longest || count > longest.words) longest = { title: scene.title, words: count };
    if (!shortest || count < shortest.words) shortest = { title: scene.title, words: count };
  });

  return {
    scenes: scenes.length,
    words,
    averageWords: scenes.length === 0 ? 0 : Math.round(words / scenes.length),
    medianWords,
    povs: [...povMap.values()].sort((a, b) => b.words - a.words || a.name.localeCompare(b.name)),
    settings: new Set(scenes.map((scene) => scene.setting?.trim()).filter(Boolean)).size,
    longest,
    shortest,
  };
}

/** The scene list as a markdown board, one heading per scene. */
export function scenesToMarkdown(scenes: Scene[]): string {
  return scenes
    .map((scene, index) => {
      const meta = [scene.pov ? `POV: ${scene.pov}` : "", scene.setting ? `Setting: ${scene.setting}` : "", scene.words ? `${scene.words} words` : ""]
        .filter(Boolean)
        .join(" · ");
      return [`## ${index + 1}. ${scene.title}`, meta ? `_${meta}_` : "", scene.summary ?? ""].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

export function serializeScenes(scenes: Scene[]): string {
  return JSON.stringify(scenes, null, 2);
}

export type ParseScenesResult = { ok: true; scenes: Scene[] } | { ok: false; error: string };

/** Parse an exported scene list back, validating every entry. */
export function parseScenesJson(json: string): ParseScenesResult {
  const text = json.trim();
  if (!text) return { ok: false, error: "Paste the JSON you exported first." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That is not valid JSON. Paste the exact export, including the outer brackets." };
  }
  if (!Array.isArray(parsed)) return { ok: false, error: "The export must be a JSON array of scenes." };
  const scenes: Scene[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const raw = parsed[index] as Partial<Scene> | null;
    if (!raw || typeof raw !== "object") return { ok: false, error: `Scene ${index + 1} is not an object.` };
    if (typeof raw.title !== "string" || !raw.title.trim()) return { ok: false, error: `Scene ${index + 1} has no title.` };
    scenes.push({
      title: raw.title,
      pov: typeof raw.pov === "string" ? raw.pov : undefined,
      setting: typeof raw.setting === "string" ? raw.setting : undefined,
      summary: typeof raw.summary === "string" ? raw.summary : undefined,
      words: typeof raw.words === "number" ? raw.words : undefined,
    });
  }
  return { ok: true, scenes };
}
