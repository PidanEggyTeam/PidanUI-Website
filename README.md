# PidanUI-Website

![Last Commit](https://img.shields.io/github/last-commit/PidanEggyTeam/PidanUI-Website?label=Last%20Commit)
![VitePress](https://img.shields.io/badge/VitePress-2.0.0--alpha.20-5C73E7?logo=VitePress&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.5.44-4FC08D?logo=Vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=TypeScript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-1.105.2-CC6699?logo=Sass&logoColor=white)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange)

PidanUI 项目的官方网站，使用 VitePress + TypeScript + SCSS 构建，静态生成（SSG）后部署到 GitHub Pages。

## 网站结构

- **首页**：项目介绍、特性展示、下载入口。
- **下载**：`/download`，一个版本列表，提供 PidanUI 多个版本的下载链接。
- **新闻**：`/posts/`，使用 VitePress 博客特性的区域，用于展示 PidanUI 的项目公告等文章，实现了完整的博客功能和 Markdown 样式支持。
- **关于**：`/about`，展示 PidanUI 项目的简介及项目背后的故事。
- **蛋仔专属性格测试**：`/personality-test`，蛋仔专属性格测试小游戏，关于页的小彩蛋。

## 技术栈

- [VitePress](https://vitepress.dev/zh/)（SSG 静态生成 + 博客功能）
- [TypeScript](https://www.typescriptlang.org/)
- [SCSS](https://www.sass.hk/docs/index.html)

## 数据文件

- `docs/.vitepress/theme/data/download.json` —— PidanUI 版本清单，用于下载页的版本列表展示，网站在构建时会导入此 JSON（SSG 数据随构建固化）。

## 构建步骤

1. [下载并安装 Node.js](https://nodejs.org/zh-cn)
2. 安装 `pnpm`：在终端执行 `npm install -g pnpm` 命令来安装 `pnpm`（可以执行 `pnpm --version` 来验证安装是否完成，安装后建议重启终端）
3. 在项目文件夹下打开终端，执行 `pnpm install` 命令安装依赖
4. 执行 `pnpm dev`（或 `pnpm run dev`）命令来启动开发服务器（开发服务器网址一般是 `http://localhost:5173`），执行 `pnpm build`（或 `pnpm run build`）命令来生成静态网页构建产物
5. 在 `docs/.vitepress/dist` 下找到静态网页构建产物

## 字体与图标

本网站使用的字体为 MiSans 和 Cascadia Code 分包字体，图标来自 Font Awesome，字体和图标通过 CDN 加载，仓库不保留字体和图标文件。

## 关于 PidanUI

PidanUI 是一款专为 Windows & Liunx 系统打造的桌面美化项目，设计灵感来源于网易游戏《蛋仔派对》。项目延续了 EggyUI 在视觉风格上的探索，同时吸取了过往项目在治理、技术与分发方式上的经验教训，重新调整了开发路线与组织方式。

PidanUI 并非 EggyUI 的官方分支，而是一个在 EggyUI 项目经历分裂与重组后，由原核心开发者与社区成员共同创建的新项目。它的目标不是复刻 EggyUI 的历史，而是在继承其技术积累与美学方向的基础上，走一条更稳定、更可持续的路。

## 部署方式

本网站部署于 **GitHub Pages**，通过静态托管的方式对外提供服务。由于没有后端，网站的所有内容均以静态资源形式存在，更新时需重新构建并推送至部署分支。

## 许可证

本项目采用 **AGPL v3** 许可证。

**禁止商业用途。** 任何个人或组织不得将本项目及其衍生作品用于商业目的。使用、修改、分发本项目时，请遵守 AGPL v3 的相关条款。

## 版权声明

- 本项目为《蛋仔派对》粉丝二次创作，非官方出品，禁止用于商业用途。
- 所有视觉素材均来自合规渠道或团队重绘，未使用游戏拆包/解包资源。
- 《蛋仔派对》是网易游戏的注册商标，Windows 是微软公司的注册商标。
- 本项目与网易、微软无任何隶属或赞助关系。