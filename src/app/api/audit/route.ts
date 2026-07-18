
import { NextResponse } from 'next/server';
import * as mod_0 from '@/domains/3d/registry';
import * as mod_1 from '@/domains/animator/registry';
import * as mod_2 from '@/domains/audio/registry';
import * as mod_3 from '@/domains/business/registry';
import * as mod_4 from '@/domains/cad/registry';
import * as mod_5 from '@/domains/calculator/registry';
import * as mod_6 from '@/domains/colors/registry';
import * as mod_7 from '@/domains/crypto/registry';
import * as mod_8 from '@/domains/design/registry';
import * as mod_9 from '@/domains/education/registry';
import * as mod_10 from '@/domains/engineering/registry';
import * as mod_11 from '@/domains/fitness/registry';
import * as mod_12 from '@/domains/flowchart/registry';
import * as mod_13 from '@/domains/image/registry';
import * as mod_14 from '@/domains/insight/registry';
import * as mod_15 from '@/domains/maps/registry';
import * as mod_16 from '@/domains/music/registry';
import * as mod_17 from '@/domains/photo/registry';
import * as mod_18 from '@/domains/security/registry';
import * as mod_19 from '@/domains/seo/registry';
import * as mod_20 from '@/domains/travel/registry';
import * as mod_21 from '@/domains/writing/registry';
import * as mod_22 from '@/data/developers/tools';
import * as mod_23 from '@/data/games/games';
import * as mod_24 from '@/data/presentation/tools';
import * as mod_25 from '@/data/productivity/tools';
import * as mod_26 from '@/data/typography/tools';
import * as mod_27 from '@/data/video/tools';
import * as mod_28 from '@/data/voice/tools';


export async function GET() {
  const data = {
    '3d': (mod_0 as any)['SEARCH_REGISTRY'] || (mod_0 as any).default?.['SEARCH_REGISTRY'] || (mod_0 as any)['calculatorRegistry'] || (mod_0 as any)['audioRegistry'] || (mod_0 as any)['gamesRegistry'] || (mod_0 as any)['TOOLS'] || (mod_0 as any)['tools'] || [],
    'animator': (mod_1 as any)['SEARCH_REGISTRY'] || (mod_1 as any).default?.['SEARCH_REGISTRY'] || (mod_1 as any)['calculatorRegistry'] || (mod_1 as any)['audioRegistry'] || (mod_1 as any)['gamesRegistry'] || (mod_1 as any)['TOOLS'] || (mod_1 as any)['tools'] || [],
    'audio': (mod_2 as any)['SEARCH_REGISTRY'] || (mod_2 as any).default?.['SEARCH_REGISTRY'] || (mod_2 as any)['calculatorRegistry'] || (mod_2 as any)['audioRegistry'] || (mod_2 as any)['gamesRegistry'] || (mod_2 as any)['TOOLS'] || (mod_2 as any)['tools'] || [],
    'business': (mod_3 as any)['SEARCH_REGISTRY'] || (mod_3 as any).default?.['SEARCH_REGISTRY'] || (mod_3 as any)['calculatorRegistry'] || (mod_3 as any)['audioRegistry'] || (mod_3 as any)['gamesRegistry'] || (mod_3 as any)['TOOLS'] || (mod_3 as any)['tools'] || [],
    'cad': (mod_4 as any)['SEARCH_REGISTRY'] || (mod_4 as any).default?.['SEARCH_REGISTRY'] || (mod_4 as any)['calculatorRegistry'] || (mod_4 as any)['audioRegistry'] || (mod_4 as any)['gamesRegistry'] || (mod_4 as any)['TOOLS'] || (mod_4 as any)['tools'] || [],
    'calculator': (mod_5 as any)['SEARCH_REGISTRY'] || (mod_5 as any).default?.['SEARCH_REGISTRY'] || (mod_5 as any)['calculatorRegistry'] || (mod_5 as any)['audioRegistry'] || (mod_5 as any)['gamesRegistry'] || (mod_5 as any)['TOOLS'] || (mod_5 as any)['tools'] || [],
    'colors': (mod_6 as any)['SEARCH_REGISTRY'] || (mod_6 as any).default?.['SEARCH_REGISTRY'] || (mod_6 as any)['calculatorRegistry'] || (mod_6 as any)['audioRegistry'] || (mod_6 as any)['gamesRegistry'] || (mod_6 as any)['TOOLS'] || (mod_6 as any)['tools'] || [],
    'crypto': (mod_7 as any)['SEARCH_REGISTRY'] || (mod_7 as any).default?.['SEARCH_REGISTRY'] || (mod_7 as any)['calculatorRegistry'] || (mod_7 as any)['audioRegistry'] || (mod_7 as any)['gamesRegistry'] || (mod_7 as any)['TOOLS'] || (mod_7 as any)['tools'] || [],
    'design': (mod_8 as any)['SEARCH_REGISTRY'] || (mod_8 as any).default?.['SEARCH_REGISTRY'] || (mod_8 as any)['calculatorRegistry'] || (mod_8 as any)['audioRegistry'] || (mod_8 as any)['gamesRegistry'] || (mod_8 as any)['TOOLS'] || (mod_8 as any)['tools'] || [],
    'education': (mod_9 as any)['SEARCH_REGISTRY'] || (mod_9 as any).default?.['SEARCH_REGISTRY'] || (mod_9 as any)['calculatorRegistry'] || (mod_9 as any)['audioRegistry'] || (mod_9 as any)['gamesRegistry'] || (mod_9 as any)['TOOLS'] || (mod_9 as any)['tools'] || [],
    'engineering': (mod_10 as any)['SEARCH_REGISTRY'] || (mod_10 as any).default?.['SEARCH_REGISTRY'] || (mod_10 as any)['calculatorRegistry'] || (mod_10 as any)['audioRegistry'] || (mod_10 as any)['gamesRegistry'] || (mod_10 as any)['TOOLS'] || (mod_10 as any)['tools'] || [],
    'fitness': (mod_11 as any)['SEARCH_REGISTRY'] || (mod_11 as any).default?.['SEARCH_REGISTRY'] || (mod_11 as any)['calculatorRegistry'] || (mod_11 as any)['audioRegistry'] || (mod_11 as any)['gamesRegistry'] || (mod_11 as any)['TOOLS'] || (mod_11 as any)['tools'] || [],
    'flowchart': (mod_12 as any)['SEARCH_REGISTRY'] || (mod_12 as any).default?.['SEARCH_REGISTRY'] || (mod_12 as any)['calculatorRegistry'] || (mod_12 as any)['audioRegistry'] || (mod_12 as any)['gamesRegistry'] || (mod_12 as any)['TOOLS'] || (mod_12 as any)['tools'] || [],
    'image': (mod_13 as any)['SEARCH_REGISTRY'] || (mod_13 as any).default?.['SEARCH_REGISTRY'] || (mod_13 as any)['calculatorRegistry'] || (mod_13 as any)['audioRegistry'] || (mod_13 as any)['gamesRegistry'] || (mod_13 as any)['TOOLS'] || (mod_13 as any)['tools'] || [],
    'insight': (mod_14 as any)['SEARCH_REGISTRY'] || (mod_14 as any).default?.['SEARCH_REGISTRY'] || (mod_14 as any)['calculatorRegistry'] || (mod_14 as any)['audioRegistry'] || (mod_14 as any)['gamesRegistry'] || (mod_14 as any)['TOOLS'] || (mod_14 as any)['tools'] || [],
    'maps': (mod_15 as any)['SEARCH_REGISTRY'] || (mod_15 as any).default?.['SEARCH_REGISTRY'] || (mod_15 as any)['calculatorRegistry'] || (mod_15 as any)['audioRegistry'] || (mod_15 as any)['gamesRegistry'] || (mod_15 as any)['TOOLS'] || (mod_15 as any)['tools'] || [],
    'music': (mod_16 as any)['SEARCH_REGISTRY'] || (mod_16 as any).default?.['SEARCH_REGISTRY'] || (mod_16 as any)['calculatorRegistry'] || (mod_16 as any)['audioRegistry'] || (mod_16 as any)['gamesRegistry'] || (mod_16 as any)['TOOLS'] || (mod_16 as any)['tools'] || [],
    'photo': (mod_17 as any)['SEARCH_REGISTRY'] || (mod_17 as any).default?.['SEARCH_REGISTRY'] || (mod_17 as any)['calculatorRegistry'] || (mod_17 as any)['audioRegistry'] || (mod_17 as any)['gamesRegistry'] || (mod_17 as any)['TOOLS'] || (mod_17 as any)['tools'] || [],
    'security': (mod_18 as any)['SEARCH_REGISTRY'] || (mod_18 as any).default?.['SEARCH_REGISTRY'] || (mod_18 as any)['calculatorRegistry'] || (mod_18 as any)['audioRegistry'] || (mod_18 as any)['gamesRegistry'] || (mod_18 as any)['TOOLS'] || (mod_18 as any)['tools'] || [],
    'seo': (mod_19 as any)['SEARCH_REGISTRY'] || (mod_19 as any).default?.['SEARCH_REGISTRY'] || (mod_19 as any)['calculatorRegistry'] || (mod_19 as any)['audioRegistry'] || (mod_19 as any)['gamesRegistry'] || (mod_19 as any)['TOOLS'] || (mod_19 as any)['tools'] || [],
    'travel': (mod_20 as any)['SEARCH_REGISTRY'] || (mod_20 as any).default?.['SEARCH_REGISTRY'] || (mod_20 as any)['calculatorRegistry'] || (mod_20 as any)['audioRegistry'] || (mod_20 as any)['gamesRegistry'] || (mod_20 as any)['TOOLS'] || (mod_20 as any)['tools'] || [],
    'writing': (mod_21 as any)['SEARCH_REGISTRY'] || (mod_21 as any).default?.['SEARCH_REGISTRY'] || (mod_21 as any)['calculatorRegistry'] || (mod_21 as any)['audioRegistry'] || (mod_21 as any)['gamesRegistry'] || (mod_21 as any)['TOOLS'] || (mod_21 as any)['tools'] || [],
    'developers': (mod_22 as any)['SEARCH_REGISTRY'] || (mod_22 as any).default?.['SEARCH_REGISTRY'] || (mod_22 as any)['calculatorRegistry'] || (mod_22 as any)['audioRegistry'] || (mod_22 as any)['gamesRegistry'] || (mod_22 as any)['TOOLS'] || (mod_22 as any)['tools'] || [],
    'games': (mod_23 as any)['SEARCH_REGISTRY'] || (mod_23 as any).default?.['SEARCH_REGISTRY'] || (mod_23 as any)['calculatorRegistry'] || (mod_23 as any)['audioRegistry'] || (mod_23 as any)['gamesRegistry'] || (mod_23 as any)['TOOLS'] || (mod_23 as any)['tools'] || [],
    'presentation': (mod_24 as any)['SEARCH_REGISTRY'] || (mod_24 as any).default?.['SEARCH_REGISTRY'] || (mod_24 as any)['calculatorRegistry'] || (mod_24 as any)['audioRegistry'] || (mod_24 as any)['gamesRegistry'] || (mod_24 as any)['TOOLS'] || (mod_24 as any)['tools'] || [],
    'productivity': (mod_25 as any)['SEARCH_REGISTRY'] || (mod_25 as any).default?.['SEARCH_REGISTRY'] || (mod_25 as any)['calculatorRegistry'] || (mod_25 as any)['audioRegistry'] || (mod_25 as any)['gamesRegistry'] || (mod_25 as any)['TOOLS'] || (mod_25 as any)['tools'] || [],
    'typography': (mod_26 as any)['SEARCH_REGISTRY'] || (mod_26 as any).default?.['SEARCH_REGISTRY'] || (mod_26 as any)['calculatorRegistry'] || (mod_26 as any)['audioRegistry'] || (mod_26 as any)['gamesRegistry'] || (mod_26 as any)['TOOLS'] || (mod_26 as any)['tools'] || [],
    'video': (mod_27 as any)['SEARCH_REGISTRY'] || (mod_27 as any).default?.['SEARCH_REGISTRY'] || (mod_27 as any)['calculatorRegistry'] || (mod_27 as any)['audioRegistry'] || (mod_27 as any)['gamesRegistry'] || (mod_27 as any)['TOOLS'] || (mod_27 as any)['tools'] || [],
    'voice': (mod_28 as any)['SEARCH_REGISTRY'] || (mod_28 as any).default?.['SEARCH_REGISTRY'] || (mod_28 as any)['calculatorRegistry'] || (mod_28 as any)['audioRegistry'] || (mod_28 as any)['gamesRegistry'] || (mod_28 as any)['TOOLS'] || (mod_28 as any)['tools'] || [],

  };
  return NextResponse.json(data);
}
