import { NextRequest } from 'next/server';

import { respData, respErr } from '@/shared/lib/resp';
import {
  getUserPanShares,
  getUserPanSharesCount,
  PanShareStatus,
} from '@/shared/models/pan_share';
import { getSignUser } from '@/shared/models/user';

// GET /api/pan-shares/mine - Get current user's pan shares
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSignUser();
    if (!user) {
      return respErr('Please login first');
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') as PanShareStatus | undefined;

    const [shares, total] = await Promise.all([
      getUserPanShares({ userId: user.id, status, page, limit }),
      getUserPanSharesCount({ userId: user.id, status }),
    ]);

    return respData({
      shares,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Failed to get user pan shares:', error);
    return respErr(error.message || 'Failed to get user pan shares');
  }
}
