import { TaskBoard } from "@/features/taskboard";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-6 py-16 font-sans dark:from-black dark:via-zinc-900 dark:to-black md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <TaskBoard />
      </div>
    </main>
  );
}
