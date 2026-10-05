import raw from './download.json';
import type { DownloadMeta } from '@/types/download';

/*
 * 下载目录数据。
 * 构建期随 bundle 打包（本地静态模块），运行时不发起任何网络请求。
 * 当前为占位数据，维护版本 / 直链下载地址时仅需编辑 download.json 后重新构建发布。
 */
export const downloadMeta = raw as DownloadMeta;