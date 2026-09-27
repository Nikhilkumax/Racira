import { listMedia } from "@/domains/finance/data/media";
import { MediaClient } from "./media-client";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await listMedia();
  return <MediaClient initialMedia={media} />;
}
