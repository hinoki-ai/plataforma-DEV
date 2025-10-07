import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const client = getConvexClient();

    // Check if user is a parent
    const user = await client.query(api.users.getUserByEmail, {
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
      );
    }

    // Get children associated with this parent
    // For now, return mock data since we don't have a parent-child relationship model
    const children = [
      {
        id: '1',
        name: 'María González',
        grade: 'Pre-Kinder',
        age: 4,
        enrollmentDate: '2024-03-01',
        status: 'active',
        attendance: 95,
        average: 8.5,
        subjects: [
          { name: 'Lenguaje', grade: 9.0 },
          { name: 'Matemáticas', grade: 8.0 },
          { name: 'Inglés', grade: 8.5 },
        ],
      },
      {
        id: '2',
        name: 'Pedro González',
        grade: 'Kinder',
        age: 5,
        enrollmentDate: '2023-03-01',
        status: 'active',
        attendance: 98,
        average: 9.2,
        subjects: [
          { name: 'Lenguaje', grade: 9.5 },
          { name: 'Matemáticas', grade: 9.0 },
          { name: 'Ciencias', grade: 8.8 },
        ],
      },
    ];

    return NextResponse.json({ data: children });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}