import { prisma } from '../lib/prisma';

/**
 * Get users subscribed to daily newsletter
 */
export async function getDailySubscribers() {
  return prisma.newsletterSubscription.findMany({
    where: {
      subscribed: true,
      frequency: 'daily',
    },
    include: { user: true },
  });
}

/**
 * Get users subscribed to weekly newsletter
 */
export async function getWeeklySubscribers() {
  return prisma.newsletterSubscription.findMany({
    where: {
      subscribed: true,
      frequency: 'weekly',
    },
    include: { user: true },
  });
}

/**
 * Get top entities for newsletter
 * Fetches the top positive and negative entities from recent analyses
 */
export async function getTopEntitiesForNewsletter(limit: number = 10) {
  const analyses = await prisma.analysis.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    orderBy: [
      { sentiment: 'desc' }, // Top positive first
    ],
    take: limit * 2, // Get more to filter
  });

  // Get mix of top positive and top negative
  const topPositive = analyses.filter((a) => a.sentiment > 0.5).slice(0, limit / 2);
  const topNegative = analyses.filter((a) => a.sentiment < 0.5).slice(0, limit / 2);

  const mixed = [...topPositive, ...topNegative].map((a) => ({
    entityId: a.entityId,
    entityName: a.entityName,
    sentiment: a.sentiment,
    sentimentLabel: a.sentimentLabel,
  }));

  return mixed.slice(0, limit);
}

/**
 * Record that a newsletter issue was sent
 */
export async function recordNewsletterIssue(topEntities: any[]) {
  return prisma.newsletterIssue.create({
    data: {
      sentAt: new Date(),
      topEntities,
    },
  });
}

/**
 * Get newsletter stats
 */
export async function getNewsletterStats() {
  const [totalSubscribers, dailyCount, weeklyCount] = await Promise.all([
    prisma.newsletterSubscription.count({ where: { subscribed: true } }),
    prisma.newsletterSubscription.count({ where: { subscribed: true, frequency: 'daily' } }),
    prisma.newsletterSubscription.count({ where: { subscribed: true, frequency: 'weekly' } }),
  ]);

  return {
    totalSubscribers,
    dailyCount,
    weeklyCount,
  };
}
