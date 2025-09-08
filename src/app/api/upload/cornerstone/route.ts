import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
} from '@/lib/error-handler';
import {
  lockCornerstone,
  unlockCornerstone,
  listCornerstone,
} from '@/lib/cornerstone';

export const runtime = 'nodejs';

export const GET = withApiErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) throw new AuthenticationError('Authentication required');
  const list = await listCornerstone();
  return NextResponse.json({ success: true, cornerstone: list });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) throw new AuthenticationError('Authentication required');
  const body = await request.json().catch(() => ({}));
  const { filename, note } = body || {};
  if (!filename) throw new ValidationError('filename required');
  await lockCornerstone(
    String(filename),
    typeof note === 'string' ? note : undefined
  );
  return NextResponse.json({ success: true });
});

export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) throw new AuthenticationError('Authentication required');
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename) throw new ValidationError('filename required');
  await unlockCornerstone(filename);
  return NextResponse.json({ success: true });
});
