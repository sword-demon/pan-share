import Link from 'next/link';
import { Plus } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

import { ShareList } from '@/shared/blocks/pan-share';
import { Button } from '@/shared/components/ui/button';
import {
  DiskType,
  getPublishedPanShares,
  getPublishedPanSharesCount,
} from '@/shared/models/pan_share';
import { getSignUser } from '@/shared/models/user';

export const revalidate = 60; // Revalidate every minute

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    diskType?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page: pageStr, search, diskType } = await searchParams;

  const page = parseInt(pageStr || '1', 10);
  const limit = 12;

  // Get current user
  const user = await getSignUser();
  const isLoggedIn = !!user;

  // Get shares
  const [rawShares, total] = await Promise.all([
    getPublishedPanShares({
      search,
      diskType: diskType as DiskType | undefined,
      page,
      limit,
    }),
    getPublishedPanSharesCount({
      search,
      diskType: diskType as DiskType | undefined,
    }),
  ]);

  // Transform shares to remove sensitive data (shareUrl, shareCode)
  // This prevents crawlers from getting the actual links
  const shares = rawShares.map((share) => ({
    id: share.id,
    title: share.title,
    description: share.description,
    coverImage: share.coverImage,
    diskType: share.diskType,
    expiredAt: share.expiredAt?.toISOString() || null,
    createdAt: share.createdAt.toISOString(),
    hasShareCode: !!share.shareCode,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="from-background to-muted/30 bg-gradient-to-b py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              panShare
            </h1>
            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              发现和分享优质网盘资源
            </p>
            {isLoggedIn && (
              <Link href="/submit">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  提交分享
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Shares Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ShareList
            shares={shares}
            total={total}
            page={page}
            limit={limit}
            isLoggedIn={isLoggedIn}
            search={search}
            diskType={diskType}
          />
        </div>
      </section>
    </div>
  );
}
