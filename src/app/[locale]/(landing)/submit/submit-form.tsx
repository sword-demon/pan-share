'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { DiskType } from '@/shared/types/pan_share';
import {
  ImageUploader,
  ImageUploaderValue,
} from '@/shared/blocks/common/image-uploader';

interface SubmitFormProps {
  submitAction: (formData: FormData) => Promise<{ success: boolean }>;
  diskTypeOptions: { value: string; label: string }[];
}

export function SubmitForm({ submitAction, diskTypeOptions }: SubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [diskType, setDiskType] = useState<string>(DiskType.BAIDU);
  const [coverImageMode, setCoverImageMode] = useState<'upload' | 'url'>('upload');
  const [uploadedCoverImage, setUploadedCoverImage] = useState<string>('');

  const handleImageChange = (items: ImageUploaderValue[]) => {
    const uploadedUrls = items
      .filter((item) => item.status === 'uploaded' && item.url)
      .map((item) => item.url as string);
    setUploadedCoverImage(uploadedUrls[0] || '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('diskType', diskType);

    // Set cover image based on mode
    if (coverImageMode === 'upload' && uploadedCoverImage) {
      formData.set('coverImage', uploadedCoverImage);
    }

    startTransition(async () => {
      try {
        const result = await submitAction(formData);
        if (result.success) {
          setSuccess(true);
          toast.success('提交成功，等待审核');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } catch (err: any) {
        setError(err.message || '提交失败');
        toast.error(err.message || '提交失败');
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
        <h3 className="font-medium text-green-800 dark:text-green-200">提交成功!</h3>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          您的分享已提交，正在等待管理员审核。审核通过后将在首页展示。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="font-medium text-destructive">错误</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          标题 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="输入分享标题"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="简单描述分享内容（可选）"
          rows={3}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label>封面图片（可选）</Label>
        <Tabs
          value={coverImageMode}
          onValueChange={(v) => setCoverImageMode(v as 'upload' | 'url')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={isPending} className="gap-2">
              <Upload className="h-4 w-4" />
              上传图片
            </TabsTrigger>
            <TabsTrigger value="url" disabled={isPending} className="gap-2">
              <LinkIcon className="h-4 w-4" />
              图片链接
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-3">
            <ImageUploader
              maxImages={1}
              maxSizeMB={5}
              emptyHint="点击或拖拽上传封面图片"
              onChange={handleImageChange}
            />
          </TabsContent>
          <TabsContent value="url" className="mt-3">
            <Input
              id="coverImage"
              name="coverImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              输入图片的完整 URL 地址
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diskType">
          网盘类型 <span className="text-destructive">*</span>
        </Label>
        <Select value={diskType} onValueChange={setDiskType} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="选择网盘类型" />
          </SelectTrigger>
          <SelectContent>
            {diskTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shareUrl">
          分享链接 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="shareUrl"
          name="shareUrl"
          type="url"
          placeholder="https://pan.baidu.com/s/xxx"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shareCode">提取码</Label>
        <Input
          id="shareCode"
          name="shareCode"
          placeholder="xxxx（可选）"
          maxLength={10}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiredAt">过期时间</Label>
        <Input
          id="expiredAt"
          name="expiredAt"
          type="datetime-local"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          留空表示无过期时间
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          disabled={isPending}
        >
          取消
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? '提交中...' : '提交分享'}
        </Button>
      </div>
    </form>
  );
}
