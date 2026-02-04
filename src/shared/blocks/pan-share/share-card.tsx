'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { DiskType, DiskTypeLabels } from '@/shared/types/pan_share';

// Disk type colors
const diskTypeColors: Record<DiskType, string> = {
  [DiskType.BAIDU]: 'bg-blue-500',
  [DiskType.ALIYUN]: 'bg-orange-500',
  [DiskType.QUARK]: 'bg-purple-500',
  [DiskType.XUNLEI]: 'bg-cyan-500',
  [DiskType.PAN_115]: 'bg-green-500',
  [DiskType.OTHER]: 'bg-gray-500',
};

// Card data interface (without sensitive info)
export interface ShareCardData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  diskType: string;
  expiredAt: string | null;
  createdAt: string;
  hasShareCode: boolean;
}

interface ShareCardProps {
  share: ShareCardData;
  isLoggedIn: boolean;
  onLoginRequired?: () => void;
}

export function ShareCard({
  share,
  isLoggedIn,
  onLoginRequired,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isExpired = share.expiredAt
    ? new Date(share.expiredAt) < new Date()
    : false;

  // Fetch share info from API and copy
  const handleCopyAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
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
          onLoginRequired?.();
          return;
        }
        throw new Error('获取分享信息失败');
      }

      const data = await response.json();
      const text = data.shareCode
        ? `${data.shareUrl}\n提取码: ${data.shareCode}`
        : data.shareUrl;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('已复制分享信息');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const shareUrl = `${window.location.origin}/share/${share.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      toast.success('详情页链接已复制');
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Link href={`/share/${share.id}`} className="block">
      <Card
        className={cn(
          'group relative h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg',
          isExpired && 'opacity-60'
        )}
      >
        {/* Cover Image */}
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {share.coverImage ? (
            <img
              src={share.coverImage}
              alt={share.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="from-muted to-muted-foreground/10 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <span className="text-muted-foreground/30 text-4xl">📁</span>
            </div>
          )}

          {/* Disk Type Badge */}
          <Badge
            className={cn(
              'absolute top-2 left-2 text-white',
              diskTypeColors[share.diskType as DiskType] || diskTypeColors.other
            )}
          >
            {DiskTypeLabels[share.diskType as DiskType] || share.diskType}
          </Badge>

          {/* Expired Badge */}
          {isExpired && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              已过期
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{share.title}</CardTitle>
          {share.description && (
            <CardDescription className="line-clamp-2">
              {share.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pb-2">
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span>{formatDate(share.createdAt)}</span>
            {share.expiredAt && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(share.expiredAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>过期时间</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopyAll}
                  disabled={isExpired || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : copied ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : isLoggedIn ? (
                    <Copy className="mr-1 h-4 w-4" />
                  ) : (
                    <Lock className="mr-1 h-4 w-4" />
                  )}
                  {copied ? '已复制' : isLoggedIn ? '复制链接' : '登录后复制'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLoggedIn ? '复制分享链接和提取码' : '登录后可复制'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {share.hasShareCode && (
            <Badge variant="secondary" className="h-8 px-2">
              有提取码
            </Badge>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShareLink}
                  disabled={isExpired}
                >
                  {shareLinkCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{shareLinkCopied ? '已复制' : '分享详情页链接'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  disabled={isExpired}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>查看详情</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </Link>
  );
}
