import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import {
  DiskType,
  DiskTypeLabels,
  getPanShares,
  getPanSharesCount,
  PanShareStatus,
  PanShareStatusLabels,
  type PanShare,
} from '@/shared/models/pan_share';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function PanSharesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: number;
    pageSize?: number;
    status?: PanShareStatus;
    search?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check if user has permission to read pan shares
  await requirePermission({
    code: PERMISSIONS.PAN_SHARES_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.pan-shares');

  const {
    page: pageNum,
    pageSize,
    status,
    search,
  } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 20;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.pan_shares'), is_active: true },
  ];

  const total = await getPanSharesCount({ status, search });
  const data = await getPanShares({ status, search, page, limit });

  // Status color mapping
  const getStatusVariant = (status: string) => {
    switch (status) {
      case PanShareStatus.PUBLISHED:
        return 'default';
      case PanShareStatus.PENDING:
        return 'secondary';
      case PanShareStatus.REJECTED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const table: Table = {
    columns: [
      {
        name: 'coverImage',
        title: t('fields.cover_image'),
        type: 'image',
        metadata: { width: 60, height: 40 },
      },
      {
        name: 'title',
        title: t('fields.title'),
      },
      {
        name: 'diskType',
        title: t('fields.disk_type'),
        type: 'label',
        metadata: { variant: 'outline' },
        callback: (item: PanShare) => {
          return DiskTypeLabels[item.diskType as DiskType] || item.diskType;
        },
      },
      {
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        callback: (item: PanShare) => {
          return {
            value:
              PanShareStatusLabels[item.status as PanShareStatus] || item.status,
            variant: getStatusVariant(item.status),
          };
        },
      },
      {
        name: 'shareCode',
        title: t('fields.share_code'),
        callback: (item: PanShare) => item.shareCode || '-',
      },
      {
        name: 'expiredAt',
        title: t('fields.expired_at'),
        type: 'time',
        callback: (item: PanShare) => item.expiredAt || '-',
      },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      {
        name: 'action',
        title: '',
        type: 'dropdown',
        callback: (item: PanShare) => {
          return [
            {
              id: 'edit',
              title: t('list.buttons.edit'),
              icon: 'RiEditLine',
              url: `/admin/pan-shares/${item.id}/edit`,
            },
          ];
        },
      },
    ],
    actions: [
      {
        id: 'edit',
        title: t('list.buttons.edit'),
        icon: 'RiEditLine',
        url: '/admin/pan-shares/[id]/edit',
      },
    ],
    data,
    pagination: {
      total,
      page,
      limit,
    },
  };

  // Search configuration
  const searchConfig = {
    name: 'search',
    placeholder: 'Search by title or description...',
    param: 'search',
    value: search || '',
  };

  // Filter tabs
  const filterTabs = [
    { id: 'all', title: t('list.filter.all'), url: '/admin/pan-shares' },
    {
      id: 'pending',
      title: t('list.filter.pending'),
      url: '/admin/pan-shares?status=pending',
    },
    {
      id: 'published',
      title: t('list.filter.published'),
      url: '/admin/pan-shares?status=published',
    },
    {
      id: 'rejected',
      title: t('list.filter.rejected'),
      url: '/admin/pan-shares?status=rejected',
    },
  ];

  const actions: Button[] = [
    {
      id: 'add',
      title: t('list.buttons.add'),
      icon: 'RiAddLine',
      url: '/admin/pan-shares/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader
          title={t('list.title')}
          actions={actions}
          search={searchConfig}
          tabs={filterTabs}
        />
        <TableCard table={table} />
      </Main>
    </>
  );
}
