import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { getUuid } from '@/shared/lib/hash';
import {
  addPanShare,
  DiskType,
  DiskTypeLabels,
  NewPanShare,
  PanShareStatus,
} from '@/shared/models/pan_share';
import { getSignUser } from '@/shared/models/user';
import { SubmitForm } from './submit-form';

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check if user is logged in
  const user = await getSignUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Server action for form submission
  async function submitShare(formData: FormData) {
    'use server';

    const currentUser = await getSignUser();
    if (!currentUser) {
      throw new Error('请先登录');
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as string;
    const diskType = formData.get('diskType') as DiskType;
    const shareUrl = formData.get('shareUrl') as string;
    const shareCode = formData.get('shareCode') as string;
    const expiredAtStr = formData.get('expiredAt') as string;

    if (!title?.trim()) {
      throw new Error('请输入标题');
    }
    if (!shareUrl?.trim()) {
      throw new Error('请输入分享链接');
    }

    const newShare: NewPanShare = {
      id: getUuid(),
      title: title.trim(),
      description: description?.trim() || null,
      coverImage: coverImage?.trim() || null,
      diskType: diskType || DiskType.BAIDU,
      shareUrl: shareUrl.trim(),
      shareCode: shareCode?.trim() || null,
      expiredAt: expiredAtStr ? new Date(expiredAtStr) : null,
      status: PanShareStatus.PENDING, // User submissions need review
      userId: currentUser.id,
    };

    const result = await addPanShare(newShare);

    if (!result) {
      throw new Error('提交失败，请稍后重试');
    }

    return { success: true };
  }

  const diskTypeOptions = Object.entries(DiskTypeLabels).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>提交分享</CardTitle>
            <CardDescription>
              分享你的网盘资源，提交后需要管理员审核
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmitForm
              submitAction={submitShare}
              diskTypeOptions={diskTypeOptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
