import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import {
  addPanShare,
  DiskType,
  NewPanShare,
  PanShareStatus,
} from '@/shared/models/pan_share';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function PanShareAddPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check if user has permission to add pan shares
  await requirePermission({
    code: PERMISSIONS.PAN_SHARES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.pan-shares');

  const crumbs: Crumb[] = [
    { title: t('add.crumbs.admin'), url: '/admin' },
    { title: t('add.crumbs.pan_shares'), url: '/admin/pan-shares' },
    { title: t('add.crumbs.add'), is_active: true },
  ];

  const diskTypeOptions = [
    { value: DiskType.BAIDU, title: t('disk_types.baidu') },
    { value: DiskType.ALIYUN, title: t('disk_types.aliyun') },
    { value: DiskType.QUARK, title: t('disk_types.quark') },
    { value: DiskType.XUNLEI, title: t('disk_types.xunlei') },
    { value: DiskType.PAN_115, title: t('disk_types.115') },
    { value: DiskType.OTHER, title: t('disk_types.other') },
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
    ],
    passby: {},
    data: {
      diskType: DiskType.BAIDU,
    },
    submit: {
      button: {
        title: t('add.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const coverImage = data.get('coverImage') as string;
        const diskType = data.get('diskType') as DiskType;
        const shareUrl = data.get('shareUrl') as string;
        const shareCode = data.get('shareCode') as string;
        const expiredAtStr = data.get('expiredAt') as string;

        if (!title?.trim() || !shareUrl?.trim()) {
          throw new Error('title and share URL are required');
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
          status: PanShareStatus.PUBLISHED, // Admin added directly published
          userId: user.id,
        };

        const result = await addPanShare(newShare);

        if (!result) {
          throw new Error('add pan share failed');
        }

        return {
          status: 'success',
          message: 'Pan share added',
          redirect_url: '/admin/pan-shares',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
