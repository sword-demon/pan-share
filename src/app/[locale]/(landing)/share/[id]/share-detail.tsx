'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  HardDrive,
  Key,
  Link as LinkIcon,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { DiskType, DiskTypeLabels } from '@/shared/types/pan_share';

interface ShareData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  diskType: string;
  expiredAt: string | null;
  createdAt: string;
  hasShareCode: boolean;
}

interface ShareDetailProps {
  share: ShareData;
  isLoggedIn: boolean;
}

export function ShareDetail({ share, isLoggedIn }: ShareDetailProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<'url' | 'code' | 'all' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [shareInfo, setShareInfo] = useState<{
    shareUrl: string;
    shareCode: string | null;
  } | null>(null);

  const isExpired = share.expiredAt
    ? new Date(share.expiredAt) < new Date()
    : false;

  const diskTypeLabel =
    DiskTypeLabels[share.diskType as DiskType] || share.diskType;

  // Fetch share info from API (requires login)
  const fetchShareInfo = async () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return null;
    }

    if (shareInfo) {
      return shareInfo;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/pan-shares/${share.id}/secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowLoginDialog(true);
          return null;
        }
        throw new Error('获取分享信息失败');
      }

      const data = await response.json();
      setShareInfo(data);
      return data;
    } catch (error) {
      toast.error('获取分享信息失败，请稍后重试');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    const info = await fetchShareInfo();
    if (!info) return;

    try {
      await navigator.clipboard.writeText(info.shareUrl);
      setCopied('url');
      toast.success('链接已复制');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleCopyCode = async () => {
    const info = await fetchShareInfo();
    if (!info?.shareCode) return;

    try {
      await navigator.clipboard.writeText(info.shareCode);
      setCopied('code');
      toast.success('提取码已复制');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleCopyAll = async () => {
    const info = await fetchShareInfo();
    if (!info) return;

    try {
      const text = info.shareCode
        ? `${info.shareUrl}\n提取码: ${info.shareCode}`
        : info.shareUrl;
      await navigator.clipboard.writeText(text);
      setCopied('all');
      toast.success('已复制链接和提取码');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleOpenLink = async () => {
    const info = await fetchShareInfo();
    if (!info) return;

    window.open(info.shareUrl, '_blank');
  };

  return (
    <>
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Cover image */}
            {share.coverImage && (
              <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl border">
                <Image
                  src={share.coverImage}
                  alt={share.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {isExpired && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Badge variant="destructive" className="text-lg">
                      已过期
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Title and description */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{diskTypeLabel}</Badge>
                {isExpired && <Badge variant="destructive">已过期</Badge>}
              </div>
              <h1 className="mb-4 text-2xl font-bold md:text-3xl">
                {share.title}
              </h1>
              {share.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {share.description}
                </p>
              )}
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <Calendar className="mr-2 h-4 w-4" />
                    创建时间
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {new Date(share.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <Clock className="mr-2 h-4 w-4" />
                    过期时间
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-lg font-semibold ${isExpired ? 'text-destructive' : ''}`}
                  >
                    {share.expiredAt
                      ? new Date(share.expiredAt).toLocaleDateString('zh-CN')
                      : '永久有效'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Action buttons */}
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="mr-2 h-5 w-5" />
                  获取资源
                </CardTitle>
                <CardDescription>
                  {isLoggedIn
                    ? '点击下方按钮获取分享链接'
                    : '登录后可获取分享链接和提取码'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Copy all button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCopyAll}
                  disabled={isExpired || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : copied === 'all' ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : isLoggedIn ? (
                    <Copy className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {copied === 'all'
                    ? '已复制'
                    : isLoggedIn
                      ? '复制链接和提取码'
                      : '登录后复制'}
                </Button>

                {/* Separate copy buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyUrl}
                    disabled={isExpired || isLoading}
                  >
                    {copied === 'url' ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <LinkIcon className="mr-1 h-4 w-4" />
                    )}
                    {copied === 'url' ? '已复制' : '复制链接'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCopyCode}
                    disabled={isExpired || isLoading || !share.hasShareCode}
                  >
                    {copied === 'code' ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Key className="mr-1 h-4 w-4" />
                    )}
                    {copied === 'code'
                      ? '已复制'
                      : share.hasShareCode
                        ? '复制提取码'
                        : '无提取码'}
                  </Button>
                </div>

                {/* Open link button */}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleOpenLink}
                  disabled={isExpired || isLoading}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  打开链接
                </Button>

                {isExpired && (
                  <p className="text-muted-foreground text-center text-sm">
                    此分享已过期，链接可能已失效
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>需要登录</DialogTitle>
            <DialogDescription>
              登录后即可获取分享链接和提取码
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                router.push(`/sign-in?callbackUrl=/share/${share.id}`);
              }}
            >
              去登录
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
