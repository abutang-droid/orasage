import type { NextRequest } from 'next/server';
import { z } from 'zod';

export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ParseError('invalid json body');
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function handleRouteError(e: unknown): Response {
  if (e instanceof z.ZodError) {
    return jsonError('validation failed', 400);
  }
  if (e instanceof Error) {
    if (e.name === 'AuthError') return jsonError(e.message, 401);
    if (e.name === 'CheckoutError') return jsonError(e.message, 400);
    if (e.name === 'ParseError') return jsonError(e.message, 400);
  }
  console.error(e);
  return jsonError('internal error', 500);
}
