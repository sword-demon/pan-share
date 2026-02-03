import { NextRequest } from 'next/server';

import { respData, respErr } from '@/shared/lib/resp';
import { findPanShareById, PanShareStatus } from '@/shared/models/pan_share';

// GET /api/pan-shares/[id] - Get a single pan share (public, only published)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const share = await findPanShareById(id);

    if (!share) {
      return respErr('Pan share not found');
    }

    // Only return published shares
    if (share.status !== PanShareStatus.PUBLISHED) {
      return respErr('Pan share not found');
    }

    return respData(share);
  } catch (error: any) {
    console.error('Failed to get pan share:', error);
    return respErr(error.message || 'Failed to get pan share');
  }
}
