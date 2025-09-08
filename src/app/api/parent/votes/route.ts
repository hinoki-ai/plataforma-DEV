import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/parent/votes - Get all votes for parents
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is a parent
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'PARENT',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
      );
    }

    // Get all votes with options and vote counts
    const votes = await db.vote.findMany({
      include: {
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
        responses: {
          where: { userId: user.id },
          select: { optionId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedVotes = votes.map(vote => ({
      id: vote.id,
      title: vote.title,
      description: vote.description,
      endDate: vote.endDate.toISOString(),
      status: vote.endDate > new Date() ? 'active' : 'closed',
      totalVotes: vote._count.responses,
      hasVoted: vote.responses.length > 0,
      userVote: vote.responses.length > 0 ? vote.responses[0].optionId : null,
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

// POST /api/parent/votes - Submit a vote
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is a parent
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'PARENT',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
      );
    }

    const { voteId, optionId } = await request.json();

    if (!voteId || !optionId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Check if vote exists and is still active
    const vote = await db.vote.findUnique({
      where: { id: voteId },
      include: { options: true },
    });

    if (!vote) {
      return NextResponse.json(
        { error: 'Votación no encontrada' },
        { status: 404 }
      );
    }

    if (vote.endDate <= new Date()) {
      return NextResponse.json(
        { error: 'La votación ya ha terminado' },
        { status: 400 }
      );
    }

    // Check if option exists
    const option = vote.options.find(opt => opt.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Opción no válida' }, { status: 400 });
    }

    // Check if user already voted
    const existingVote = await db.voteResponse.findFirst({
      where: {
        voteId,
        userId: user.id,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Ya has votado en esta votación' },
        { status: 400 }
      );
    }

    // Record the vote
    await db.voteResponse.create({
      data: {
        voteId,
        optionId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: 'Voto registrado correctamente',
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
