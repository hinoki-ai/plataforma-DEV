import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const headerToken = request.headers.get('x-bootstrap-token');
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret || (!queryToken && !headerToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provided = queryToken || headerToken;
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmail =
      process.env.DEFAULT_ADMIN_EMAIL || 'admin@manitospintadas.cl';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const teacherEmail =
      process.env.DEFAULT_TEACHER_EMAIL || 'profesor@manitospintadas.cl';
    const teacherPassword =
      process.env.DEFAULT_TEACHER_PASSWORD || 'profesor123';

    const adminHashed = await hashPassword(adminPassword);
    const teacherHashed = await hashPassword(teacherPassword);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        password: adminHashed,
        isActive: true,
        name: 'Administrador Manitos Pintadas',
      },
      create: {
        email: adminEmail.toLowerCase(),
        name: 'Administrador Manitos Pintadas',
        password: adminHashed,
        role: 'ADMIN',
        isActive: true,
      },
    });

    const profesor = await prisma.user.upsert({
      where: { email: teacherEmail.toLowerCase() },
      update: {
        password: teacherHashed,
        isActive: true,
        name: 'María González - Profesora',
      },
      create: {
        email: teacherEmail.toLowerCase(),
        name: 'María González - Profesora',
        password: teacherHashed,
        role: 'PROFESOR',
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      admin: admin.email,
      profesor: profesor.email,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Mirror POST to allow browser-based one-time bootstrap
  return POST(request);
}
