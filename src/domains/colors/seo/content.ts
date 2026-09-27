import type { ToolSeo } from "@/components/shared/seo-types";
import { SEO_BATCH_1 } from "./batch1";
import { SEO_BATCH_2 } from "./batch2";
import { SEO_BATCH_3 } from "./batch3";
import { SEO_BATCH_4 } from "./batch4";
import { SEO_BATCH_5 } from "./batch5";
import { SEO_BATCH_6 } from "./batch6";
import { SEO_BATCH_7 } from "./batch7";
import { SEO_BATCH_8 } from "./batch8";
import { SEO_BATCH_9 } from "./batch9";
import { SEO_BATCH_10 } from "./batch10";
import { SEO_BATCH_11 } from "./batch11";
import { SEO_BATCH_12 } from "./batch12";
import { SEO_BATCH_13 } from "./batch13";
import { SEO_BATCH_14 } from "./batch14";
import { SEO_BATCH_15 } from "./batch15";
import { SEO_BATCH_16 } from "./batch16";
import { SEO_BATCH_17 } from "./batch17";
import { SEO_BATCH_18 } from "./batch18";
import { SEO_BATCH_19 } from "./batch19";
import { SEO_BATCH_20 } from "./batch20";
import { SEO_BATCH_21 } from "./batch21";
import { SEO_BATCH_22 } from "./batch22";
import { SEO_BATCH_23 } from "./batch23";
import { SEO_BATCH_24 } from "./batch24";
import { SEO_BATCH_25 } from "./batch25";
import { SEO_BATCH_26 } from "./batch26";
import { SEO_BATCH_27 } from "./batch27";
import { SEO_BATCH_28 } from "./batch28";
import { SEO_BATCH_29 } from "./batch29";
import { SEO_BATCH_30 } from "./batch30";
import { SEO_BATCH_31 } from "./batch31";
import { SEO_BATCH_32 } from "./batch32";
import { SEO_BATCH_33 } from "./batch33";
import { SEO_BATCH_34 } from "./batch34";

/**
 * Authored editorial SEO content, keyed by tool slug.
 *
 * Only tools whose logic is verified correct (functional-audit verdict "Y") are
 * authored. Batches are added incrementally; the set of keys here is the
 * "authored" inventory that scripts/validate-color-seo.mjs gates the build on.
 */
export const COLOR_SEO_CONTENT: Record<string, ToolSeo> = {
  ...SEO_BATCH_1,
  ...SEO_BATCH_2,
  ...SEO_BATCH_3,
  ...SEO_BATCH_4,
  ...SEO_BATCH_5,
  ...SEO_BATCH_6,
  ...SEO_BATCH_7,
  ...SEO_BATCH_8,
  ...SEO_BATCH_9,
  ...SEO_BATCH_10,
  ...SEO_BATCH_11,
  ...SEO_BATCH_12,
  ...SEO_BATCH_13,
  ...SEO_BATCH_14,
  ...SEO_BATCH_15,
  ...SEO_BATCH_16,
  ...SEO_BATCH_17,
  ...SEO_BATCH_18,
  ...SEO_BATCH_19,
  ...SEO_BATCH_20,
  ...SEO_BATCH_21,
  ...SEO_BATCH_22,
  ...SEO_BATCH_23,
  ...SEO_BATCH_24,
  ...SEO_BATCH_25,
  ...SEO_BATCH_26,
  ...SEO_BATCH_27,
  ...SEO_BATCH_28,
  ...SEO_BATCH_29,
  ...SEO_BATCH_30,
  ...SEO_BATCH_31,
  ...SEO_BATCH_32,
  ...SEO_BATCH_33,
  ...SEO_BATCH_34,
};

export function getColorSeo(slug: string): ToolSeo | undefined {
  return COLOR_SEO_CONTENT[slug];
}

/** Slugs that currently carry authored SEO content. */
export const COLOR_SEO_AUTHORED_SLUGS: string[] = Object.keys(COLOR_SEO_CONTENT);
