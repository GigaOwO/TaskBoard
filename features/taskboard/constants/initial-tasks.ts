import type { TaskBoardState } from "../types/task";

export function createInitialTaskState(): TaskBoardState {
  const now = new Date().toISOString();

  return {
    todo: [
      {
        id: "welcome-planning",
        title: "Notion風タスクボードを構想する",
        status: "todo",
        description: "カラム構成とドラッグ＆ドロップ体験を固める。",
        position: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "wireframes",
        title: "タスクカードのワイヤーフレーム作成",
        status: "todo",
        description: "カードの情報量とアクセシビリティを確認する。",
        position: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
    inProgress: [
      {
        id: "kanban-dnd",
        title: "ドラッグ＆ドロップ挙動の実装",
        status: "inProgress",
        description: "dnd-kit を使った並び替えを Next.js に組み込む。",
        position: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
    done: [
      {
        id: "project-bootstrap",
        title: "TaskBoard プロジェクトのセットアップ",
        status: "done",
        description: "Next.js と Tailwind CSS の初期設定を完了。",
        position: 0,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
