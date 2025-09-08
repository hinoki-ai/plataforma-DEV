import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    google: {
      enabled:
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID ? '***' : null,
    },
    facebook: {
      enabled:
        !!process.env.FACEBOOK_CLIENT_ID &&
        !!process.env.FACEBOOK_CLIENT_SECRET,
      clientId: process.env.FACEBOOK_CLIENT_ID ? '***' : null,
    },
  };

  return NextResponse.json(config);
}
