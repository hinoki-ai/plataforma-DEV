import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ==================== GLOBAL OVERSIGHT QUERIES ====================

/**
 * Global oversight metrics for master users
 * Provides system-wide statistics and monitoring data
 */
export const getGlobalMetrics = query({
  args: {},
  handler: async (ctx) => {
    // Get all institutions
    const institutions = await ctx.db.query("institutionInfo").collect();
    const activeInstitutions = institutions.filter(inst => inst.isActive !== false);

    // Get all users
    const users = await ctx.db.query("users").collect();
    const activeUsers = users.filter(user => user.isActive);

    // Get all memberships for user distribution
    const memberships = await ctx.db.query("institutionMemberships").collect();
    const activeMemberships = memberships.filter(m => m.status === "ACTIVE");

    // Calculate regional distribution (based on institution locations)
    const regionStats: Record<string, number> = {};
    institutions.forEach(inst => {
      // Extract region from address or use default
      const region = extractRegionFromAddress(inst.address) || "Unknown";
      regionStats[region] = (regionStats[region] || 0) + 1;
    });

    // Calculate system health metrics
    const totalInstitutions = institutions.length;
    const totalActiveInstitutions = activeInstitutions.length;
    const totalUsers = users.length;
    const totalActiveUsers = activeUsers.length;

    // Simulate some system metrics (in a real system, these would come from monitoring)
    const uptime = 99.97; // Mock uptime
    const avgLatency = Math.floor(Math.random() * 20) + 10; // Mock latency 10-30ms

    return {
      totalNodes: totalInstitutions,
      activeNodes: totalActiveInstitutions,
      totalUsers: totalActiveUsers,
      globalLatency: avgLatency,
      dataTransferred: calculateDataTransferred(institutions.length, activeUsers.length),
      uptime: `${uptime}%`,
      regionStats,
      userDistribution: {
        master: users.filter(u => u.role === "MASTER").length,
        admin: users.filter(u => u.role === "ADMIN").length,
        profesor: users.filter(u => u.role === "PROFESOR").length,
        parent: users.filter(u => u.role === "PARENT").length,
        public: users.filter(u => u.role === "PUBLIC").length,
      }
    };
  },
});

/**
 * Get global nodes data for the map view
 * Transforms institutions into node-like data for visualization
 */
export const getGlobalNodes = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    const memberships = await ctx.db.query("institutionMemberships").collect();

    // Group users by institution
    const usersByInstitution = new Map<Id<"institutionInfo">, number>();
    memberships.forEach(membership => {
      if (membership.status === "ACTIVE") {
        const current = usersByInstitution.get(membership.institutionId) || 0;
        usersByInstitution.set(membership.institutionId, current + 1);
      }
    });

    // Transform institutions into nodes
    const nodes = institutions.map((inst, index) => {
      const userCount = usersByInstitution.get(inst._id) || 0;
      const region = extractRegionFromAddress(inst.address) || "Unknown";
      const country = getCountryFromRegion(region);

      // Simulate some realistic load and latency based on user count
      const load = Math.min(95, Math.floor((userCount / 10) * 20) + Math.floor(Math.random() * 30));
      const latency = Math.floor(Math.random() * 50) + 10;

      // Determine status based on activity
      const status: "online" | "degraded" | "offline" = inst.isActive === false
        ? "offline"
        : load > 80
          ? "degraded"
          : "online";

      return {
        id: inst._id,
        region: getRegionDisplayName(region),
        country,
        status,
        users: userCount,
        load,
        latency,
        lastUpdate: getLastUpdateText(inst.updatedAt),
        institutionName: inst.name,
        institutionType: inst.institutionType,
      };
    });

    return nodes;
  },
});

/**
 * Get global alerts and system events
 * Collects recent system events and notifications
 */
export const getGlobalAlerts = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    const users = await ctx.db.query("users").collect();
    const memberships = await ctx.db.query("institutionMemberships").collect();

    const alerts = [];

    // Check for inactive institutions
    const inactiveInstitutions = institutions.filter(inst => inst.isActive === false);
    inactiveInstitutions.slice(0, 2).forEach(inst => {
      alerts.push({
        id: `inactive-${inst._id}`,
        type: "warning" as const,
        region: extractRegionFromAddress(inst.address) || "Unknown",
        message: `Institution "${inst.name}" is inactive`,
        severity: "medium" as const,
        time: getTimeAgo(inst.updatedAt),
      });
    });

    // Check for institutions with low user count
    const lowUserInstitutions = institutions.filter(inst => {
      const userCount = memberships.filter(m =>
        m.institutionId === inst._id && m.status === "ACTIVE"
      ).length;
      return userCount < 3 && inst.isActive !== false;
    });

    lowUserInstitutions.slice(0, 2).forEach(inst => {
      const userCount = memberships.filter(m =>
        m.institutionId === inst._id && m.status === "ACTIVE"
      ).length;

      alerts.push({
        id: `low-users-${inst._id}`,
        type: "info" as const,
        region: extractRegionFromAddress(inst.address) || "Unknown",
        message: `Institution "${inst.name}" has only ${userCount} active users`,
        severity: "low" as const,
        time: getTimeAgo(inst.updatedAt),
      });
    });

    // Add some system status alerts
    alerts.push({
      id: "system-health",
      type: "success" as const,
      region: "Global",
      message: "All core systems operating normally",
      severity: "low" as const,
      time: "2 min ago",
    });

    if (alerts.length === 0) {
      alerts.push({
        id: "no-alerts",
        type: "info" as const,
        region: "Global",
        message: "No system alerts at this time",
        severity: "low" as const,
        time: "Just now",
      });
    }

    return alerts.slice(0, 5); // Limit to 5 alerts
  },
});

/**
 * Get network topology information
 */
export const getNetworkTopology = query({
  args: {},
  handler: async (ctx) => {
    const institutions = await ctx.db.query("institutionInfo").collect();
    const memberships = await ctx.db.query("institutionMemberships").collect();

    // Calculate regional distribution
    const regionCounts: Record<string, number> = {};
    institutions.forEach(inst => {
      const region = extractRegionFromAddress(inst.address) || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    // Get user distribution
    const userCountsByInstitution = new Map<Id<"institutionInfo">, number>();
    memberships.forEach(m => {
      if (m.status === "ACTIVE") {
        const current = userCountsByInstitution.get(m.institutionId) || 0;
        userCountsByInstitution.set(m.institutionId, current + 1);
      }
    });

    // Calculate average latency per region (mock data)
    const regionalLatency: Record<string, number> = {};
    Object.keys(regionCounts).forEach(region => {
      regionalLatency[region] = Math.floor(Math.random() * 40) + 15; // 15-55ms
    });

    return {
      regions: regionCounts,
      totalInstitutions: institutions.length,
      activeInstitutions: institutions.filter(i => i.isActive !== false).length,
      totalUsers: memberships.filter(m => m.status === "ACTIVE").length,
      regionalLatency,
      connectivity: "100%", // Mock connectivity
      averageLatency: Math.floor(Object.values(regionalLatency).reduce((a, b) => a + b, 0) / Object.values(regionalLatency).length),
    };
  },
});

// ==================== HELPER FUNCTIONS ====================

function extractRegionFromAddress(address: string): string {
  // Simple region extraction from Chilean addresses
  const regionMap: Record<string, string> = {
    "arica": "Arica y Parinacota",
    "tarapacá": "Tarapacá",
    "antofagasta": "Antofagasta",
    "atacama": "Atacama",
    "coquimbo": "Coquimbo",
    "valparaíso": "Valparaíso",
    "metropolitana": "Metropolitana",
    "ohiggins": "O'Higgins",
    "maule": "Maule",
    "ñuble": "Ñuble",
    "biobío": "Biobío",
    "araucanía": "Araucanía",
    "los ríos": "Los Ríos",
    "los lagos": "Los Lagos",
    "aysén": "Aysén",
    "magallanes": "Magallanes",
  };

  const lowerAddress = address.toLowerCase();
  for (const [key, region] of Object.entries(regionMap)) {
    if (lowerAddress.includes(key)) {
      return region;
    }
  }

  return "Metropolitana"; // Default region
}

function getCountryFromRegion(region: string): string {
  // For now, assume all institutions are in Chile
  return "Chile";
}

function getRegionDisplayName(region: string): string {
  // Shorten region names for display
  const shortNames: Record<string, string> = {
    "Arica y Parinacota": "Arica",
    "Tarapacá": "Tarapacá",
    "Antofagasta": "Antofagasta",
    "Atacama": "Atacama",
    "Coquimbo": "Coquimbo",
    "Valparaíso": "Valparaíso",
    "Metropolitana": "Santiago",
    "O'Higgins": "O'Higgins",
    "Maule": "Maule",
    "Ñuble": "Ñuble",
    "Biobío": "Biobío",
    "Araucanía": "Araucanía",
    "Los Ríos": "Los Ríos",
    "Los Lagos": "Los Lagos",
    "Aysén": "Aysén",
    "Magallanes": "Magallanes",
  };

  return shortNames[region] || region;
}

function getLastUpdateText(updatedAt: number): string {
  const now = Date.now();
  const diff = now - updatedAt;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getTimeAgo(timestamp: number): string {
  return getLastUpdateText(timestamp);
}

function calculateDataTransferred(institutionCount: number, userCount: number): string {
  // Mock calculation based on institutions and users
  const baseData = institutionCount * userCount * 1000; // Rough estimate
  const units = ["B", "KB", "MB", "GB", "TB"];

  let value = baseData;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
