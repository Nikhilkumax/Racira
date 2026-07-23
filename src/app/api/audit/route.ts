import { NextResponse } from 'next/server';

const registryModules = [
  { key: '3d', path: '@/domains/3d/registry' },
  { key: 'animator', path: '@/domains/animator/registry' },
  { key: 'audio', path: '@/domains/audio/registry' },
  { key: 'business', path: '@/domains/business/registry' },
  { key: 'cad', path: '@/domains/cad/registry' },
  { key: 'calculator', path: '@/domains/calculator/registry' },
  { key: 'colors', path: '@/domains/colors/registry' },
  { key: 'crypto', path: '@/domains/crypto/registry' },
  { key: 'design', path: '@/domains/design/registry' },
  { key: 'education', path: '@/domains/education/registry' },
  { key: 'engineering', path: '@/domains/engineering/registry' },
  { key: 'fitness', path: '@/domains/fitness/registry' },
  { key: 'flowchart', path: '@/domains/flowchart/registry' },
  { key: 'image', path: '@/domains/image/registry' },
  { key: 'insight', path: '@/domains/insight/registry' },
  { key: 'maps', path: '@/domains/maps/registry' },
  { key: 'music', path: '@/domains/music/registry' },
  { key: 'photo', path: '@/domains/photo/registry' },
  { key: 'security', path: '@/domains/security/registry' },
  { key: 'seo', path: '@/domains/seo/registry' },
  { key: 'travel', path: '@/domains/travel/registry' },
  { key: 'writing', path: '@/domains/writing/registry' },
  { key: 'developers', path: '@/domains/developers/registry' },
  { key: 'games', path: '@/domains/games/registry' },
  { key: 'presentation', path: '@/domains/presentation/registry' },
  { key: 'productivity', path: '@/domains/productivity/registry' },
  { key: 'typography', path: '@/domains/typography/registry' },
  { key: 'video', path: '@/domains/video/registry' },
  { key: 'voice', path: '@/domains/voice/registry' },
];

function pickRegistry(mod: any) {
  return (
    mod?.SEARCH_REGISTRY ||
    mod?.default?.SEARCH_REGISTRY ||
    mod?.calculatorRegistry ||
    mod?.audioRegistry ||
    mod?.gamesRegistry ||
    mod?.TOOLS ||
    mod?.tools ||
    []
  );
}

export async function GET() {
  const entries = await Promise.all(
    registryModules.map(async ({ key, path }) => {
      try {
        const mod = await import(/* webpackIgnore: true */ path);
        return [key, pickRegistry(mod)] as const;
      } catch (e) {
        return [key, []] as const;
      }
    })
  );
  const data = Object.fromEntries(entries);
  return NextResponse.json(data);
}
