/** 单个下载版本条目 */
export interface DownloadVersion {
  /** 唯一标识 */
  id: string;
  /** 版本类型 / 名称，如「PidanUI Air」 */
  type: string;
  /** 版本号，如 v3.5（可选） */
  version?: string;
  /** 文件体积描述，如「4.27 GB」（可选） */
  fileSize?: string;
  /** 更新日期，如 2026-09-28（可选） */
  updateDate?: string;
  /** 版本描述（可选） */
  description?: string;
  /** 配图地址（可为外链，可选） */
  image?: string;
  /** 下载直链（缺失时展示为不可用，可选） */
  downloadUrl?: string;
}

/** 下载目录元信息 */
export interface DownloadMeta {
  /** 标题 */
  title: string;
  /** 总版本号（可选） */
  version?: string;
  /** 整体描述（可选） */
  description?: string;
  /** 版本列表 */
  versions: DownloadVersion[];
}