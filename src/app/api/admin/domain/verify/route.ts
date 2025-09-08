import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/admin/domain/verify - Verify domain ownership and configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Formato de dominio inválido' },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate domain ownership via DNS TXT record
    // 2. Check Google Workspace API for domain status
    // 3. Create or update domain configuration

    // For now, returning a mock response
    const verificationResult = {
      domain,
      verified: true,
      verificationMethod: 'DNS_TXT',
      txtRecord: 'google-site-verification=ABC123DEF456',
      nextSteps: [
        'Agrega el registro TXT a tu DNS',
        'Configura los registros MX de Google',
        'Configura SPF y DKIM',
        'Activa Google Workspace',
      ],
    };

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Error al verificar dominio' },
      { status: 500 }
    );
  }
}
