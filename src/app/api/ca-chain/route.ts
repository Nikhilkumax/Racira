/**
 * CA Certificate Chain Proxy
 *
 * Narrowly-scoped Vercel serverless function that fetches CA certificate
 * chain data for PDF digital signature verification. Replaces Bento's
 * Cloudflare Worker CORS proxy with a self-hosted, same-origin endpoint.
 *
 * Only fetches from known CA certificate distribution points (AIA/Microsoft).
 * Does NOT proxy arbitrary URLs.
 */

import { NextRequest, NextResponse } from 'next/server';

// Known CA certificate distribution hosts that Bento's signature
// verification queries. Whitelisted to prevent abuse.
const ALLOWED_HOSTS = new Set([
  // Common CA certificate distribution points
  'crl3.digicert.com',
  'crl4.digicert.com',
  'cacerts.digicert.com',
  'www.digicert.com',
  'crl.sectigo.com',
  'sectigo.com',
  'crlUSERtrust.com',
  'crl.incommon-rsa.org',
  'crt.incommon-rsa.org',
  'entrust.net',
  'crl.entrust.net',
  'gtsr-digicert.crl.microsoft.com',
  'mscrl.microsoft.com',
  'crl.microsoft.com',
  'cacerts.globalsign.com',
  'crl.globalsign.com',
  // Add more CAs as needed
]);

// Maximum response size (1 MB)
const MAX_RESPONSE_SIZE = 1024 * 1024;

// Request timeout (10 seconds)
const TIMEOUT_MS = 10000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing required "url" query parameter' },
      { status: 400 }
    );
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL' },
      { status: 400 }
    );
  }

  // Only allow HTTPS
  if (parsed.protocol !== 'https:') {
    return NextResponse.json(
      { error: 'Only HTTPS URLs are allowed' },
      { status: 400 }
    );
  }

  // Check whitelist
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json(
      { error: `Host "${parsed.hostname}" is not in the allowed CA certificate hosts list` },
      { status: 403 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Racira-PDF-Signature-Validator/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned HTTP ${response.status}` },
        { status: 502 }
      );
    }

    // Check response size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        { error: 'Response too large' },
        { status: 413 }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    if (body.byteLength > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        { error: 'Response too large' },
        { status: 413 }
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Failed to fetch: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
