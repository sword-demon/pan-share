import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { findPanShareById, PanShareStatus } from '@/shared/models/pan_share';
import { getSignUser } from '@/shared/models/user';

import { ShareDetail } from './share-detail';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const share = await findPanShareById(id);

  if (!share || share.status !== PanShareStatus.PUBLISHED) {
    return {
      title: '分享不存在',
    };
  }

  return {
    title: `${share.title} - panShare`,
    description: share.description || `查看 ${share.title} 的分享详情`,
  };
}

export default async function ShareDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const share = await findPanShareById(id);

  // Only show published shares
  if (!share || share.status !== PanShareStatus.PUBLISHED) {
    notFound();
  }

  const user = await getSignUser();

  // Convert Date to string for client component
  const shareData = {
    id: share.id,
    title: share.title,
    description: share.description,
    content: share.content,
    coverImage: share.coverImage,
    diskType: share.diskType,
    expiredAt: share.expiredAt?.toISOString() || null,
    createdAt: share.createdAt.toISOString(),
    // Don't expose shareUrl and shareCode directly - they will be fetched via API
    hasShareCode: !!share.shareCode,
  };

  return (
    <div className="bg-muted/30 min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <ShareDetail share={shareData} isLoggedIn={!!user} />
      </div>
    </div>
  );
}
