import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_CONTACT_BODY_BYTES = 16 * 1024;

// Request throttling is enforced at Vercel's shared edge firewall for POST /api/contact.
function jsonResponse(body: Record<string, boolean | string>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const expectedOrigin = new URL(request.url).origin;
  if (origin && origin !== expectedOrigin) {
    return jsonResponse({ error: 'Invalid request origin.' }, 403);
  }

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return jsonResponse({ error: 'Send the contact form as JSON.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_CONTACT_BODY_BYTES) {
    return jsonResponse({ error: 'Your message is too large. Please shorten it and try again.' }, 413);
  }

  let body: unknown;
  const reader = request.body?.getReader();
  if (!reader) {
    return jsonResponse({ error: 'The request body must contain valid JSON.' }, 400);
  }

  try {
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_CONTACT_BODY_BYTES) {
        await reader.cancel();
        return jsonResponse({ error: 'Your message is too large. Please shorten it and try again.' }, 413);
      }
      chunks.push(value);
    }

    const bodyBytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bodyBytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const rawBody = new TextDecoder('utf-8', { fatal: true }).decode(bodyBytes);
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return jsonResponse({ error: 'The request body must contain valid JSON.' }, 400);
  } finally {
    reader.releaseLock();
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse({ error: 'Please check the form fields and try again.' }, 400);
  }

  const fields = body as Record<string, unknown>;
  if (typeof fields.website === 'string' && fields.website.trim()) {
    return jsonResponse({ ok: true });
  }

  const name = typeof fields.name === 'string' ? fields.name.trim() : '';
  const email = typeof fields.email === 'string' ? fields.email.trim() : '';
  const subject = typeof fields.subject === 'string' ? fields.subject.trim() : '';
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';

  if (
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    subject.length > 160 ||
    message.length < 5 ||
    message.length > 5000
  ) {
    return jsonResponse({ error: 'Please check the form fields and try again.' }, 400);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return jsonResponse({ error: 'Contact form is not configured yet.' }, 503);
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject: subject || null, message });

    if (error) {
      console.error('Contact form insert failed:', error.message);
      return jsonResponse({ error: 'Unable to send your message right now.' }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Contact form request failed:', error);
    return jsonResponse({ error: 'Unable to send your message right now.' }, 500);
  }
}