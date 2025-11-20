import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

interface DNSRecord {
  type: "MX" | "SPF" | "DKIM" | "DMARC";
  host: string;
  value: string;
  priority?: number;
  status: "VALID" | "INVALID" | "PENDING";
  message?: string;
}

interface DomainStatus {
  domain: string;
  verified: boolean;
  dnsRecords: DNSRecord[];
  usersCount: number;
  lastSync: string | null;
}

// GET /api/admin/domain/status - Check domain DNS configuration
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // For demo purposes, using a mock domain
    // In production, this would be configured in environment or database
    const domain = "plataforma.aramac.dev";

    // Check DNS records
    const dnsRecords = await checkDNSRecords(domain);
    const verified = dnsRecords.every((record) => record.status === "VALID");

    const domainStatus: DomainStatus = {
      domain,
      verified,
      dnsRecords,
      usersCount: 0, // This would be fetched from Google Workspace API
      lastSync: new Date().toISOString(),
    };

    return NextResponse.json(domainStatus);
  } catch (error) {
    console.error("Error checking domain status:", error);
    return NextResponse.json(
      { error: "Error al verificar estado del dominio" },
      { status: 500 },
    );
  }
}

async function checkDNSRecords(domain: string): Promise<DNSRecord[]> {
  const records: DNSRecord[] = [];

  try {
    // Check MX records
    const mxRecords = await resolveMx(domain);
    const hasGoogleMX = mxRecords.some(
      (mx) =>
        mx.exchange.includes("aspmx.l.google.com") ||
        mx.exchange.includes("google.com"),
    );

    records.push({
      type: "MX",
      host: `@`,
      value: `aspmx.l.google.com (Priority 1)`,
      priority: 1,
      status: hasGoogleMX ? "VALID" : "INVALID",
      message: hasGoogleMX
        ? "Google Workspace MX records configured"
        : "Google Workspace MX records not found",
    });

    // Check SPF record
    const txtRecords = await resolveTxt(domain);
    const spfRecord = txtRecords.find((txt) =>
      txt.some((record) => record.includes("v=spf1")),
    );

    const hasSPF = spfRecord?.some((record) =>
      record.includes("include:_spf.google.com"),
    );

    records.push({
      type: "SPF",
      host: `@`,
      value: `v=spf1 include:_spf.google.com ~all`,
      status: hasSPF ? "VALID" : "INVALID",
      message: hasSPF
        ? "SPF record configured correctly"
        : "SPF record missing or incorrect",
    });

    // Check DKIM record (simplified check)
    try {
      await resolveCname(`google._domainkey.${domain}`);
      records.push({
        type: "DKIM",
        host: `google._domainkey`,
        value: `Google Workspace DKIM record`,
        status: "VALID",
        message: "DKIM record configured",
      });
    } catch (error) {
      records.push({
        type: "DKIM",
        host: `google._domainkey`,
        value: `Google Workspace DKIM record`,
        status: "INVALID",
        message: "DKIM record not found",
      });
    }

    // Check DMARC record
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
      const hasDMARC = dmarcRecords.some((txt) =>
        txt.some((record) => record.includes("v=DMARC1")),
      );

      records.push({
        type: "DMARC",
        host: `_dmarc`,
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
        status: hasDMARC ? "VALID" : "INVALID",
        message: hasDMARC ? "DMARC record configured" : "DMARC record missing",
      });
    } catch (error) {
      records.push({
        type: "DMARC",
        host: `_dmarc`,
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
        status: "INVALID",
        message: "DMARC record not found",
      });
    }
  } catch (error) {
    console.error("Error checking DNS records:", error);
    // Return pending status for all records if DNS lookup fails
    records.push(
      {
        type: "MX",
        host: `@`,
        value: `aspmx.l.google.com (Priority 1)`,
        priority: 1,
        status: "PENDING",
        message: "Could not verify MX records",
      },
      {
        type: "SPF",
        host: `@`,
        value: `v=spf1 include:_spf.google.com ~all`,
        status: "PENDING",
        message: "Could not verify SPF record",
      },
      {
        type: "DKIM",
        host: `google._domainkey`,
        value: `Google Workspace DKIM record`,
        status: "PENDING",
        message: "Could not verify DKIM record",
      },
      {
        type: "DMARC",
        host: `_dmarc`,
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
        status: "PENDING",
        message: "Could not verify DMARC record",
      },
    );
  }

  return records;
}
