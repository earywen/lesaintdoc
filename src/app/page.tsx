
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/auth/login-button";
import { Particles } from "@/components/ui/particles";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <Particles
        className="absolute inset-0 z-0"
        quantity={200}
        ease={80}
        color="#ffffff"
        refresh
      />

      <div className="z-10 text-center space-y-8 p-8 backdrop-blur-sm rounded-xl border border-white/10 bg-black/20">
        <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
          Midnight Roster
        </h1>

        <TypingAnimation
          className="text-2xl font-light text-muted-foreground"
          duration={50}
        >
          Prepare for the next adventure.
        </TypingAnimation>

        <div className="pt-8">
          <LoginButton />
        </div>
      </div>

    </div>
  );
}
