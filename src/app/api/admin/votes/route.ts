import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const createVoteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  category: z
    .enum([
      'GENERAL',
      'ACADEMIC',
      'ADMINISTRATIVE',
      'SOCIAL',
      'FINANCIAL',
      'INFRASTRUCTURE',
      'CURRICULUM',
      'EVENTS',
      'POLICIES',
      'OTHER',
    ])
    .default('GENERAL'),
  endDate: z.string().transform(str => new Date(str)),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  allowMultipleVotes: z.boolean().default(false),
  maxVotesPerUser: z.number().min(1).max(10).optional(),
  requireAuthentication: z.boolean().default(true),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'El texto de la opción es requerido'),
      })
    )
    .min(2, 'Debe haber al menos 2 opciones')
    .max(10, 'Máximo 10 opciones'),
});

const updateVoteSchema = createVoteSchema.partial().extend({
  id: z.string(),
});

// GET /api/admin/votes - Get all votes with management data
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para administradores' },
        { status: 403 }
      );
    }

    // Get all votes with detailed information
    const votes = await db.vote.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        options: {
          include: {
            _count: {
              select: { responses: true },
            },
          },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedVotes = votes.map(vote => ({
      id: vote.id,
      title: vote.title,
      description: vote.description,
      category: vote.category,
      endDate: vote.endDate.toISOString(),
      isActive: vote.isActive,
      isPublic: vote.isPublic,
      allowMultipleVotes: vote.allowMultipleVotes,
      maxVotesPerUser: vote.maxVotesPerUser,
      requireAuthentication: vote.requireAuthentication,
      status: vote.endDate > new Date() ? 'active' : 'closed',
      totalVotes: vote._count.responses,
      totalOptions: vote.options.length,
      creator: vote.creator,
      createdAt: vote.createdAt.toISOString(),
      updatedAt: vote.updatedAt.toISOString(),
      options: vote.options.map(option => ({
        id: option.id,
        text: option.text,
        votes: option._count.responses,
      })),
    }));

    return NextResponse.json({ data: formattedVotes });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/votes - Create new vote
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createVoteSchema.parse(body);

    // Create vote with options in a transaction
    const vote = await db.$transaction(async tx => {
      const newVote = await tx.vote.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          endDate: validatedData.endDate,
          isActive: validatedData.isActive,
          isPublic: validatedData.isPublic,
          allowMultipleVotes: validatedData.allowMultipleVotes,
          maxVotesPerUser: validatedData.maxVotesPerUser,
          requireAuthentication: validatedData.requireAuthentication,
          createdBy: user.id,
        },
      });

      // Create vote options
      const options = await Promise.all(
        validatedData.options.map(option =>
          tx.voteOption.create({
            data: {
              text: option.text,
              voteId: newVote.id,
            },
          })
        )
      );

      return { ...newVote, options };
    });

    return NextResponse.json({
      message: 'Votación creada correctamente',
      vote: {
        id: vote.id,
        title: vote.title,
        category: vote.category,
        endDate: vote.endDate.toISOString(),
        options: vote.options,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Error al crear la votación' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/votes - Update vote
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para administradores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateVoteSchema.parse(body);

    // Check if vote exists
    const existingVote = await db.vote.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Votación no encontrada' },
        { status: 404 }
      );
    }

    // Update vote
    const updatedVote = await db.vote.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        endDate: validatedData.endDate,
        isActive: validatedData.isActive,
        isPublic: validatedData.isPublic,
        allowMultipleVotes: validatedData.allowMultipleVotes,
        maxVotesPerUser: validatedData.maxVotesPerUser,
        requireAuthentication: validatedData.requireAuthentication,
      },
    });

    return NextResponse.json({
      message: 'Votación actualizada correctamente',
      vote: updatedVote,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating vote:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la votación' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/votes - Delete vote
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'ADMIN',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const voteId = searchParams.get('id');

    if (!voteId) {
      return NextResponse.json(
        { error: 'ID de votación requerido' },
        { status: 400 }
      );
    }

    // Check if vote exists
    const existingVote = await db.vote.findUnique({
      where: { id: voteId },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Votación no encontrada' },
        { status: 404 }
      );
    }

    // Delete vote (cascade will handle options and responses)
    await db.vote.delete({
      where: { id: voteId },
    });

    return NextResponse.json({
      message: 'Votación eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting vote:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la votación' },
      { status: 500 }
    );
  }
}
