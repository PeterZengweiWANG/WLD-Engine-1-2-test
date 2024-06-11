import Link from "next/link";

export default function StartPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative cursor-pointer">
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute w-full h-full object-cover"
      >
        <source src="/video/test.mp4" type="video/mp4" />
      </video>
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center animate-pulse cinzel-text text-2xl font-bold text-white lg:flex lg:flex-col flex-wrap gap-4">
        <Link href="/timeline/presentation">
            About the Project
        </Link>
        <Link href="/timeline">
            Enter the Project
        </Link>
        
        <Link href="/agents2/scenario">
          Scenario Simulator
          </Link>
          
      </div>
    </main>
  );
}
