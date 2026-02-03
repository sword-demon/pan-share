'use client';

import { useState } from 'react';
import { Copy, Check, Clock, ExternalLink } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
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
import { toast } from 'sonner';

import {
  DiskType,
  DiskTypeLabels,
  PanShareData,
} from '@/shared/types/pan_share';

// Disk type colors
const diskTypeColors: Record<DiskType, string> = {
  [DiskType.BAIDU]: 'bg-blue-500',
  [DiskType.ALIYUN]: 'bg-orange-500',
  [DiskType.QUARK]: 'bg-purple-500',
  [DiskType.XUNLEI]: 'bg-cyan-500',
  [DiskType.PAN_115]: 'bg-green-500',
  [DiskType.OTHER]: 'bg-gray-500',
};

interface ShareCardProps {
  share: PanShareData;
  isLoggedIn: boolean;
  onLoginRequired?: () => void;
}

export function ShareCard({
  share,
  isLoggedIn,
  onLoginRequired,
}: ShareCardProps) {
  const [copied, setCopied] = useState<'url' | 'code' | null>(null);

  const isExpired = share.expiredAt ? new Date(share.expiredAt) < new Date() : false;

  const handleCopy = async (type: 'url' | 'code') => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    const text = type === 'url' ? share.shareUrl : share.shareCode;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === 'url' ? '链接已复制' : '提取码已复制');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleCopyAll = async () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    const text = share.shareCode
      ? `${share.shareUrl}\n提取码: ${share.shareCode}`
      : share.shareUrl;

    try {
      await navigator.clipboard.writeText(text);
      setCopied('url');
      toast.success('已复制分享信息');
      setTimeout(() => setCopied(null), 2000);
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
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-lg',
        isExpired && 'opacity-60'
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {share.coverImage ? (
          <img
            src={share.coverImage}
            alt={share.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-4xl text-muted-foreground/30">📁</span>
          </div>
        )}

        {/* Disk Type Badge */}
        <Badge
          className={cn(
            'absolute left-2 top-2 text-white',
            diskTypeColors[share.diskType as DiskType] || diskTypeColors.other
          )}
        >
          {DiskTypeLabels[share.diskType as DiskType] || share.diskType}
        </Badge>

        {/* Expired Badge */}
        {isExpired && (
          <Badge variant="destructive" className="absolute right-2 top-2">
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                disabled={isExpired}
              >
                {copied === 'url' ? (
                  <Check className="mr-1 h-4 w-4" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                {isLoggedIn ? '复制链接' : '登录后复制'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLoggedIn ? '复制分享链接和提取码' : '登录后可复制'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {share.shareCode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy('code')}
                  disabled={isExpired}
                >
                  {copied === 'code' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="font-mono text-xs">{share.shareCode}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>点击复制提取码</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (!isLoggedIn) {
                    onLoginRequired?.();
                    return;
                  }
                  window.open(share.shareUrl, '_blank');
                }}
                disabled={isExpired}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLoggedIn ? '打开链接' : '登录后可打开'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
