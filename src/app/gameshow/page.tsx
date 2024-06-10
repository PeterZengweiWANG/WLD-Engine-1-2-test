import CreatePlayer from "./CreatePlayer";

//Add multiplayer demo using supabase realtime

export default function GameshowPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col gap-4">
          <CreatePlayer />
        </div>
      </div>
    </main>
  );
}
