/**
 * TSA Timestamp Proxy
 *
 * Vercel serverless function that proxies RFC 3161 timestamp requests
 * to FreeTSA (https://freetsa.org/tsa). This avoids CORS issues that
 * prevent the browser from calling the TSA directly.
 *
 * The client sends a TSQ (Time Stamp Query) to this endpoint,
 * the server forwards it to FreeTSA, and returns the TSR (Time Stamp Response).
 */

import { NextRequest, NextResponse } from 'next/server';

const TSA_URL = 'https://freetsa.org/tsa';
const TIMEOUT_MS = 30_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.arrayBuffer();
    
    if (body.byteLength === 0) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(TSA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/timestamp-query',
      },
      body: body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `TSA returned HTTP ${response.status}` },
        { status: 502 }
      );
    }

    const tsaResponse = await response.arrayBuffer();

    return new NextResponse(tsaResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/timestamp-response',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json({ error: 'TSA request timed out' }, { status: 504 });
    }
    return NextResponse.json(
      { error: `TSA proxy failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
