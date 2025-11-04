# TaskBoard

## プロジェクト概要

TaskBoard は Notion のような操作感でタスクをドラッグ＆ドロップしながら管理できるアプリケーションです。Next.js (App Router) をベースに、`@dnd-kit` による滑らかなドラッグ体験、Supabase + Prisma による永続化、Hono で実装した API を組み合わせています。

## 主な機能

- **カラム管理**: 未着手 / 進行中 / 完了 の 3 カラムでタスクを整理
- **ドラッグ＆ドロップ**: カラム間やカラム内の並び替えを滑らかに実行
- **タスク作成**: 各カラムでタスクを追加 (Enter キーで即登録 / Shift+Enter で改行)
- **オプティミスティック更新**: 並び替え操作は即座に UI へ反映し、その後 Supabase に保存
- **Supabase 認証**: GitHub OAuth を利用してログインし、ユーザーごとにタスクを分離

## 技術スタック

| 領域 | 技術 |
| ---- | ---- |
| フロントエンド | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| ドラッグ&ドロップ | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers` |
| バックエンド | Hono (Next.js Route Handler 上), Supabase Auth |
| データベース | Supabase (PostgreSQL) + Prisma ORM |
| 開発ツール | Biome (lint/format), npm scripts |

## セットアップ手順

1. 依存関係のインストール
   ```bash
   npm install
   ```
2. `.env.local` を作成し、Supabase の接続情報と GitHub OAuth クレデンシャルを設定
   ```dotenv
   DATABASE_URL="postgresql://..."      # Supabase コネクションプーラー URL
   DIRECT_URL="postgresql://..."        # マイグレーション用ダイレクト接続
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```
3. Prisma のマイグレーションを適用
   ```bash
   npx prisma migrate dev --name init
   ```

## npm スクリプト

| コマンド | 内容 |
| -------- | ---- |
| `npm run dev` | 開発サーバーを起動 (http://localhost:3000) |
| `npm run lint` | Biome による静的解析 |
| `npm run format` | Biome で整形 |
| `npm run build` | Turbopack を無効化した webpack ビルド |

## ディレクトリ構成 (抜粋)

```
taskboard/
├── app/                      # App Router エントリ
│   └── api/tasks             # Hono で実装したタスク API
├── features/
│   └── taskboard/            # UI / hooks / services
├── prisma/                   # Prisma スキーマ
├── scripts/build.js          # Turbopack を抑制するビルドスクリプト
└── utils/supabase/           # Supabase クライアント & ミドルウェア
```

## 開発メモ

- ドラッグ挙動は DnD Overlay による視覚クローンで強化しています。Hook の呼び出し順を崩さないよう注意してください。
- Supabase の API は Hono の `app.fetch` を介して Route Handler から実行しています。Next.js の Edge runtime には対応していないため `runtime = "nodejs"` を維持してください。
- ビルドは `NEXT_DISABLE_TURBOPACK=1` を付与した webpack を使用しています。Turbopack を使う場合は Google Fonts のダウンロード制限などに注意が必要です。

## ライセンス

本リポジトリは現在ライセンスを明示していません。利用や再配布を検討する場合はリポジトリオーナーに問い合わせてください。
