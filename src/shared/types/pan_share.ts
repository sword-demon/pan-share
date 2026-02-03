// 网盘类型枚举
export enum DiskType {
  BAIDU = 'baidu', // 百度网盘
  ALIYUN = 'aliyun', // 阿里云盘
  QUARK = 'quark', // 夸克网盘
  XUNLEI = 'xunlei', // 迅雷网盘
  PAN_115 = '115', // 115网盘
  OTHER = 'other', // 其他
}

// 网盘类型显示名称
export const DiskTypeLabels: Record<DiskType, string> = {
  [DiskType.BAIDU]: '百度网盘',
  [DiskType.ALIYUN]: '阿里云盘',
  [DiskType.QUARK]: '夸克网盘',
  [DiskType.XUNLEI]: '迅雷网盘',
  [DiskType.PAN_115]: '115网盘',
  [DiskType.OTHER]: '其他',
};

// 分享状态枚举
export enum PanShareStatus {
  PENDING = 'pending', // 待审核
  PUBLISHED = 'published', // 已发布
  REJECTED = 'rejected', // 已拒绝
  ARCHIVED = 'archived', // 已归档/删除
}

// 分享状态显示名称
export const PanShareStatusLabels: Record<PanShareStatus, string> = {
  [PanShareStatus.PENDING]: '待审核',
  [PanShareStatus.PUBLISHED]: '已发布',
  [PanShareStatus.REJECTED]: '已拒绝',
  [PanShareStatus.ARCHIVED]: '已归档',
};

// PanShare 类型定义（用于客户端）
export interface PanShareData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  diskType: string;
  shareUrl: string;
  shareCode: string | null;
  expiredAt: Date | string | null;
  status: string;
  userId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
