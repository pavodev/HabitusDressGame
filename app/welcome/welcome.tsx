import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <main className="h-screen overflow-hidden">
      <section
        className="relative h-full w-full flex items-center justify-center"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "linear-gradient(180deg, rgba(35, 43, 33, 0.4) 0%, rgba(2, 1, 1, 0.6) 100%), url(/images/primary-background.jpeg)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/10 pointer-events-none" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-[50px] sm:text-[100px] font-semibold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Welcome!
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-white/90 max-w-2xl text-4xl">
                  🇮🇹
                </p>
                <p className="text-white/90 max-w-2xl text-base sm:text-lg">
                  Completa il quiz per ottenere uno sconto sull'acquisto del libro!
                </p>
                <a
                  role="button"
                  href="/dress-guesser/it"
                  className=""
                  style={{ letterSpacing: "3px" }}
                >
                  Gioca ora
                </a>
              </div>
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-white/90 max-w-2xl text-4xl">
                  🇬🇧
                </p>
                <p className="text-white/90 max-w-2xl text-base sm:text-lg">
                  Complete the quiz to get a discount on the book!
                </p>
                <a
                  role="button"
                  href="/dress-guesser/en"
                  className=""
                  style={{ letterSpacing: "3px" }}
                >
                  Play now
                </a>
              </div>
            </div>
            {/* <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
              <a
                role="button"
                href="https://habitusfidei.art/la-mostra/" target="_blank"
                className="button__outline"
                style={{ letterSpacing: "3px" }}
              >
                Scopri di più
              </a>
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
}

const resources = [
  // Placeholder resources removed from homepage; focus on primary CTA
];
