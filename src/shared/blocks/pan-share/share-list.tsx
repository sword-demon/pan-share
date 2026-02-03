'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { DiskType, DiskTypeLabels, PanShareData } from '@/shared/types/pan_share';
import { ShareCard } from './share-card';

interface ShareListProps {
  shares: PanShareData[];
  total: number;
  page: number;
  limit: number;
  isLoggedIn: boolean;
  search?: string;
  diskType?: string;
}

export function ShareList({
  shares,
  total,
  page,
  limit,
  isLoggedIn,
  search: initialSearch,
  diskType: initialDiskType,
}: ShareListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch || '');
  const [diskType, setDiskType] = useState(initialDiskType || 'all');
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset page when filters change
    if (params.search !== undefined || params.diskType !== undefined) {
      newParams.delete('page');
    }

    startTransition(() => {
      router.push(`?${newParams.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: search || undefined });
  };

  const handleDiskTypeChange = (value: string) => {
    setDiskType(value);
    updateUrl({ diskType: value === 'all' ? undefined : value });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  const handleLoginRequired = () => {
    setShowLoginDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索分享..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              '搜索'
            )}
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={diskType} onValueChange={handleDiskTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="网盘类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              {Object.entries(DiskTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Share Cards Grid */}
      {!isPending && shares.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shares.map((share) => (
            <ShareCard
              key={share.id}
              share={share}
              isLoggedIn={isLoggedIn}
              onLoginRequired={handleLoginRequired}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isPending && shares.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium">暂无分享</h3>
          <p className="text-muted-foreground">
            {search || diskType !== 'all'
              ? '没有找到匹配的分享，试试其他搜索条件'
              : '还没有任何分享内容'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isPending && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>请先登录</DialogTitle>
            <DialogDescription>
              登录后即可复制分享链接和提取码
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              取消
            </Button>
            <Button onClick={() => router.push('/sign-in')}>去登录</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
