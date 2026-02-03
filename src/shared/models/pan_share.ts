import { and, count, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm';

import { db } from '@/core/db';
import { panShare } from '@/config/db/schema';
import {
  DiskType,
  DiskTypeLabels,
  PanShareStatus,
  PanShareStatusLabels,
  type PanShareData,
} from '@/shared/types/pan_share';

// Re-export types and constants for external use
export {
  DiskType,
  DiskTypeLabels,
  PanShareStatus,
  PanShareStatusLabels,
  type PanShareData,
};

export type PanShare = typeof panShare.$inferSelect;
export type NewPanShare = typeof panShare.$inferInsert;
export type UpdatePanShare = Partial<Omit<NewPanShare, 'id' | 'createdAt'>>;

// 添加分享
export async function addPanShare(data: NewPanShare) {
  const [result] = await db().insert(panShare).values(data).returning();
  return result;
}

// 更新分享
export async function updatePanShare(id: string, data: UpdatePanShare) {
  const [result] = await db()
    .update(panShare)
    .set(data)
    .where(eq(panShare.id, id))
    .returning();
  return result;
}

// 软删除分享
export async function deletePanShare(id: string) {
  const result = await updatePanShare(id, {
    status: PanShareStatus.ARCHIVED,
    deletedAt: new Date(),
  });
  return result;
}

// 查找单个分享
export async function findPanShare({
  id,
  status,
}: {
  id?: string;
  status?: PanShareStatus;
}) {
  const [result] = await db()
    .select()
    .from(panShare)
    .where(
      and(
        id ? eq(panShare.id, id) : undefined,
        status ? eq(panShare.status, status) : undefined,
        isNull(panShare.deletedAt)
      )
    )
    .limit(1);

  return result;
}

// 根据 ID 查找分享
export async function findPanShareById(id: string) {
  return findPanShare({ id });
}

// 获取分享列表
export async function getPanShares({
  ids,
  userId,
  diskType,
  status,
  search,
  page = 1,
  limit = 20,
  includeDeleted = false,
}: {
  ids?: string[];
  userId?: string;
  diskType?: DiskType;
  status?: PanShareStatus;
  search?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
} = {}): Promise<PanShare[]> {
  const result = await db()
    .select()
    .from(panShare)
    .where(
      and(
        ids ? inArray(panShare.id, ids) : undefined,
        userId ? eq(panShare.userId, userId) : undefined,
        diskType ? eq(panShare.diskType, diskType) : undefined,
        status ? eq(panShare.status, status) : undefined,
        search
          ? or(
              ilike(panShare.title, `%${search}%`),
              ilike(panShare.description, `%${search}%`)
            )
          : undefined,
        includeDeleted ? undefined : isNull(panShare.deletedAt)
      )
    )
    .orderBy(desc(panShare.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

// 获取分享数量
export async function getPanSharesCount({
  userId,
  diskType,
  status,
  search,
  includeDeleted = false,
}: {
  userId?: string;
  diskType?: DiskType;
  status?: PanShareStatus;
  search?: string;
  includeDeleted?: boolean;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(panShare)
    .where(
      and(
        userId ? eq(panShare.userId, userId) : undefined,
        diskType ? eq(panShare.diskType, diskType) : undefined,
        status ? eq(panShare.status, status) : undefined,
        search
          ? or(
              ilike(panShare.title, `%${search}%`),
              ilike(panShare.description, `%${search}%`)
            )
          : undefined,
        includeDeleted ? undefined : isNull(panShare.deletedAt)
      )
    )
    .limit(1);

  return result?.count || 0;
}

// 获取已发布的分享列表（用于前端展示）
export async function getPublishedPanShares({
  diskType,
  search,
  page = 1,
  limit = 20,
}: {
  diskType?: DiskType;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PanShare[]> {
  return getPanShares({
    diskType,
    search,
    status: PanShareStatus.PUBLISHED,
    page,
    limit,
  });
}

// 获取已发布的分享数量
export async function getPublishedPanSharesCount({
  diskType,
  search,
}: {
  diskType?: DiskType;
  search?: string;
} = {}): Promise<number> {
  return getPanSharesCount({
    diskType,
    search,
    status: PanShareStatus.PUBLISHED,
  });
}

// 获取用户的分享列表
export async function getUserPanShares({
  userId,
  status,
  page = 1,
  limit = 20,
}: {
  userId: string;
  status?: PanShareStatus;
  page?: number;
  limit?: number;
}): Promise<PanShare[]> {
  return getPanShares({
    userId,
    status,
    page,
    limit,
  });
}

// 获取用户的分享数量
export async function getUserPanSharesCount({
  userId,
  status,
}: {
  userId: string;
  status?: PanShareStatus;
}): Promise<number> {
  return getPanSharesCount({
    userId,
    status,
  });
}

// 审核分享 - 通过
export async function approvePanShare(id: string) {
  return updatePanShare(id, {
    status: PanShareStatus.PUBLISHED,
  });
}

// 审核分享 - 拒绝
export async function rejectPanShare(id: string) {
  return updatePanShare(id, {
    status: PanShareStatus.REJECTED,
  });
}
