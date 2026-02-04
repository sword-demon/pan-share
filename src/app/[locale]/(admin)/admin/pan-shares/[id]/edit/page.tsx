import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import {
  DiskType,
  findPanShareById,
  PanShareStatus,
  updatePanShare,
  UpdatePanShare,
} from '@/shared/models/pan_share';
import { getUserInfo } from '@/shared/models/user';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function PanShareEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Check if user has permission to edit pan shares
  await requirePermission({
    code: PERMISSIONS.PAN_SHARES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.pan-shares');

  const panShare = await findPanShareById(id);
  if (!panShare) {
    return <Empty message="Pan share not found" />;
  }

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.pan_shares'), url: '/admin/pan-shares' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const diskTypeOptions = [
    { value: DiskType.BAIDU, title: t('disk_types.baidu') },
    { value: DiskType.ALIYUN, title: t('disk_types.aliyun') },
    { value: DiskType.QUARK, title: t('disk_types.quark') },
    { value: DiskType.XUNLEI, title: t('disk_types.xunlei') },
    { value: DiskType.PAN_115, title: t('disk_types.115') },
    { value: DiskType.OTHER, title: t('disk_types.other') },
  ];

  const statusOptions = [
    { value: PanShareStatus.PENDING, title: t('statuses.pending') },
    { value: PanShareStatus.PUBLISHED, title: t('statuses.published') },
    { value: PanShareStatus.REJECTED, title: t('statuses.rejected') },
  ];

  const form: Form = {
    fields: [
      {
        name: 'title',
        type: 'text',
        title: t('fields.title'),
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: t('fields.description'),
      },
      {
        name: 'content',
        type: 'markdown_editor',
        title: t('fields.content'),
        tip: 'Markdown supported',
      },
      {
        name: 'coverImage',
        type: 'upload_image',
        title: t('fields.cover_image'),
        metadata: {
          max: 1,
        },
      },
      {
        name: 'diskType',
        type: 'select',
        title: t('fields.disk_type'),
        options: diskTypeOptions,
        validation: { required: true },
      },
      {
        name: 'shareUrl',
        type: 'text',
        title: t('fields.share_url'),
        validation: { required: true },
      },
      {
        name: 'shareCode',
        type: 'text',
        title: t('fields.share_code'),
        tip: 'Optional extraction code',
      },
      {
        name: 'expiredAt',
        type: 'text',
        title: t('fields.expired_at'),
        tip: 'Format: YYYY-MM-DD, leave empty if no expiration',
      },
      {
        name: 'status',
        type: 'select',
        title: t('fields.status'),
        options: statusOptions,
        validation: { required: true },
      },
    ],
    passby: {
      panShare: panShare,
    },
    data: {
      ...panShare,
      expiredAt: panShare.expiredAt
        ? new Date(panShare.expiredAt).toISOString().slice(0, 10)
        : '',
    },
    submit: {
      button: {
        title: t('edit.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const { panShare } = passby;
        if (!panShare) {
          throw new Error('pan share not found');
        }

        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const content = data.get('content') as string;
        const coverImage = data.get('coverImage') as string;
        const diskType = data.get('diskType') as DiskType;
        const shareUrl = data.get('shareUrl') as string;
        const shareCode = data.get('shareCode') as string;
        const expiredAtStr = data.get('expiredAt') as string;
        const status = data.get('status') as PanShareStatus;

        if (!title?.trim() || !shareUrl?.trim()) {
          throw new Error('title and share URL are required');
        }

        const updateData: UpdatePanShare = {
          title: title.trim(),
          description: description?.trim() || null,
          content: content?.trim() || null,
          coverImage: coverImage?.trim() || null,
          diskType: diskType || DiskType.BAIDU,
          shareUrl: shareUrl.trim(),
          shareCode: shareCode?.trim() || null,
          expiredAt: expiredAtStr ? new Date(expiredAtStr) : null,
          status: status,
        };

        const result = await updatePanShare(panShare.id, updateData);

        if (!result) {
          throw new Error('update pan share failed');
        }

        return {
          status: 'success',
          message: 'Pan share updated',
          redirect_url: '/admin/pan-shares',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
