import { NextRequest } from 'next/server';

import { respData, respErr } from '@/shared/lib/resp';
import { getUuid } from '@/shared/lib/hash';
import {
  addPanShare,
  DiskType,
  getPublishedPanShares,
  getPublishedPanSharesCount,
  NewPanShare,
  PanShareStatus,
} from '@/shared/models/pan_share';
import { getSignUser } from '@/shared/models/user';

// GET /api/pan-shares - Get published pan shares (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const diskType = searchParams.get('diskType') as DiskType | undefined;

    const [shares, total] = await Promise.all([
      getPublishedPanShares({ search, diskType, page, limit }),
      getPublishedPanSharesCount({ search, diskType }),
    ]);

    return respData({
      shares,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Failed to get pan shares:', error);
    return respErr(error.message || 'Failed to get pan shares');
  }
}

// POST /api/pan-shares - Submit a new pan share (requires login)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSignUser();
    if (!user) {
      return respErr('Please login first');
    }

    const body = await request.json();
    const { title, description, coverImage, diskType, shareUrl, shareCode, expiredAt } =
      body;

    // Validate required fields
    if (!title?.trim()) {
      return respErr('Title is required');
    }
    if (!shareUrl?.trim()) {
      return respErr('Share URL is required');
    }
    if (!diskType) {
      return respErr('Disk type is required');
    }

    // Validate disk type
    const validDiskTypes = Object.values(DiskType);
    if (!validDiskTypes.includes(diskType)) {
      return respErr('Invalid disk type');
    }

    // Create new share
    const newShare: NewPanShare = {
      id: getUuid(),
      title: title.trim(),
      description: description?.trim() || null,
      coverImage: coverImage?.trim() || null,
      diskType: diskType,
      shareUrl: shareUrl.trim(),
      shareCode: shareCode?.trim() || null,
      expiredAt: expiredAt ? new Date(expiredAt) : null,
      status: PanShareStatus.PENDING, // User submissions need review
      userId: user.id,
    };

    const result = await addPanShare(newShare);

    if (!result) {
      return respErr('Failed to submit pan share');
    }

    return respData({
      id: result.id,
      message: 'Pan share submitted successfully. Waiting for review.',
    });
  } catch (error: any) {
    console.error('Failed to submit pan share:', error);
    return respErr(error.message || 'Failed to submit pan share');
  }
}
