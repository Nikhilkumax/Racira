import DownloadClient from './DownloadClient';

export default async function Page({ params }: { params: { slug: string } }) {
  let tool = null;
  try {
    const mod = await import(`@/features/pdf/metadata/${params.slug}`);
    tool = mod.tool;
  } catch (e) {
    // Tool not found handling will be in the client component or we can return 404 here
  }
  return <DownloadClient tool={tool} />;
}
