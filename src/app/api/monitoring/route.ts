import { NextResponse } from 'next/server';
import os from 'os';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const loadAvg = os.loadavg();

    // Database stats
    const dbStats = (await db.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM User) as users,
        (SELECT COUNT(*) FROM PlanningDocument) as documents,
        (SELECT COUNT(*) FROM Meeting) as meetings
    `) as Array<{ users: number; documents: number; meetings: number }>;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          external: memoryUsage.external,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          loadAvg,
        },
        uptime,
        platform: os.platform(),
        arch: os.arch(),
      },
      database: {
        status: 'connected',
        stats: dbStats[0],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
