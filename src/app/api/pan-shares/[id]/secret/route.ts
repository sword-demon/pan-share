import { NextRequest, NextResponse } from 'next/server';

import { findPanShareById, PanShareStatus } from '@/shared/models/pan_share';

/**
 * POST /api/pan-shares/[id]/secret
 * Get share URL and code.
 * 使用 POST 而不是 GET，避免被简单抓取和缓存。
 * 如需进一步防爬，可在此处增加限流 / 验证逻辑。
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the share
    const share = await findPanShareById(id);

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Only allow access to published shares
    if (share.status !== PanShareStatus.PUBLISHED) {
      return NextResponse.json(
        { error: 'Share not available' },
        { status: 403 }
      );
    }

    // Return share URL and code
    // Add some delay to prevent rapid scraping (rate limiting would be better)
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      shareUrl: share.shareUrl,
      shareCode: share.shareCode || null,
    });
  } catch (error) {
    console.error('Error fetching share secret:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
