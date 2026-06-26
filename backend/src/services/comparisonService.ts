import { prisma } from '../lib/prisma';

export interface ComparisonInput {
  userId: string;
  entityIds: string[];
  entityNames: string[];
  entityTypes: string[];
  title?: string;
}

/**
 * Save a comparison to user's history
 */
export async function saveComparison(input: ComparisonInput) {
  // Check if this exact comparison already exists
  const existing = await prisma.comparisonHistory.findFirst({
    where: {
      userId: input.userId,
    },
  });

  // Filter in-memory since entityIds is JSON
  const isDuplicate = existing && JSON.stringify(existing.entityIds) === JSON.stringify(input.entityIds);

  if (isDuplicate) {
    // Update updatedAt to move it to top
    return prisma.comparisonHistory.update({
      where: { id: existing!.id },
      data: { updatedAt: new Date() },
    });
  }

  // Create new comparison
  return prisma.comparisonHistory.create({
    data: {
      userId: input.userId,
      entityIds: input.entityIds,
      entityNames: input.entityNames,
      entityTypes: input.entityTypes,
      title: input.title,
    },
  });
}

/**
 * Get user's comparison history
 */
export async function getUserComparisons(userId: string, limit: number = 50) {
  return prisma.comparisonHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
}

/**
 * Delete a comparison
 */
export async function deleteComparison(id: string, userId: string) {
  return prisma.comparisonHistory.deleteMany({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Get comparison stats
 */
export async function getComparisonStats(userId: string) {
  const count = await prisma.comparisonHistory.count({ where: { userId } });
  const recent = await prisma.comparisonHistory.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return {
    totalComparisons: count,
    lastComparison: recent?.updatedAt,
  };
}
