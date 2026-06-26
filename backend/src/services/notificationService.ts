import { prisma } from '../lib/prisma';

export interface NotificationCreateInput {
  userId: string;
  type: 'new_analysis' | 'sentiment_change';
  entityId: string;
  entityName: string;
  message: string;
  link: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(input: NotificationCreateInput) {
  return prisma.notification.create({
    data: input,
  });
}

/**
 * Create a sentiment change notification
 * Called when sentiment changes by more than the threshold (e.g., 15%)
 */
export async function createSentimentChangeNotification(
  userId: string,
  entityId: string,
  entityName: string,
  entityType: string,
  oldSentiment: number,
  newSentiment: number
) {
  const direction = newSentiment > oldSentiment ? 'verbessert' : 'verschlechtert';
  const change = Math.abs((newSentiment - oldSentiment) * 100).toFixed(1);

  const message = `Stimmung ${direction} sich um ${change}% (${oldSentiment.toFixed(1)} → ${newSentiment.toFixed(1)})`;
  const link = entityType === 'politician' ? `/politiker/${entityId}` : `/partei/${entityId}`;

  return createNotification({
    userId,
    type: 'sentiment_change',
    entityId,
    entityName,
    message,
    link,
  });
}

/**
 * Create a new analysis notification
 * Called when a new analysis is generated for a watched entity
 */
export async function createNewAnalysisNotification(
  userId: string,
  entityId: string,
  entityName: string,
  entityType: string
) {
  const message = 'Neue Analyse verfügbar';
  const link = entityType === 'politician' ? `/politiker/${entityId}` : `/partei/${entityId}`;

  return createNotification({
    userId,
    type: 'new_analysis',
    entityId,
    entityName,
    message,
    link,
  });
}

/**
 * Clean up old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const deleted = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  return deleted.count;
}
