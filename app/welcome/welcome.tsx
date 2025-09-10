import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <main className="h-screen overflow-hidden">
      <section
        className="relative h-full w-full flex items-center justify-center"
        style={{
          backgroundSize: "contain",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "linear-gradient(180deg, rgba(35, 43, 33, 0.4) 0%, rgba(2, 1, 1, 0.6) 100%), url(/images/primary-background.jpeg)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 pointer-events-none" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Discover the Dress Traditions
            </h1>
            <p className="text-white/90 max-w-2xl text-base sm:text-lg">
              Use clues to guess the right traditional outfit. Learn, play, and explore.
            </p>
            <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
              <a
                href="/dress-guesser"
                className="px-6 py-3 text-white uppercase tracking-[3px] text-[14px] font-bold bg-[#6d5a27] rounded-none hover:text-black hover:bg-white transition-colors shadow"
                style={{ letterSpacing: "3px" }}
              >
                Play the game
              </a>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
              <a
                href="#about"
                className="px-6 py-3 text-white uppercase tracking-[3px] text-[14px] font-bold bg-[#6d5a27] rounded-none hover:text-black hover:bg-white transition-colors shadow"
                style={{ letterSpacing: "3px" }}
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const resources = [
  // Placeholder resources removed from homepage; focus on primary CTA
];
