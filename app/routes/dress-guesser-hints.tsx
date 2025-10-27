import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type Dress = {
  name: string;
  description: string;
  path: string;
  hints: string[];
};

const DRESSES: Dress[] = [
  {
    name: "San Giacomo (Levanto)",
    description: "Abito tradizionale di San Giacomo, Levanto.",
    path: "/dresses/san-giacomo-levanto.png",
    hints: [
      "Festa patronale celebrata vicino al mare.",
      "Facciata della chiesa a strisce bianche e nere.",
      "Dedicata a San Giacomo il Maggiore.",
    ],
  },
  {
    name: "San Giovanni (Serravalle)",
    description: "Abito cerimoniale di San Giovanni, Serravalle.",
    path: "/dresses/san-giovanni-serravalle.png",
    hints: [
      "Dedicata a San Giovanni Battista.",
      "Borgo storico tra le valli.",
      "La festa include spesso stendardi processionali.",
    ],
  },
  {
    name: "San Rocco (Nuovo, Lugano)",
    description: "Abito festivo di San Rocco, Nuovo Lugano.",
    path: "/dresses/san-rocco-nuovo-lugano.png",
    hints: [
      "Santo invocato contro le pestilenze.",
      "Influenza culturale italo-svizzera.",
      "Processione con musica e candele.",
    ],
  },
];

export function meta() {
  return [
    { title: "Galleria di Abiti" },
    { name: "description", content: "Esplora gli abiti completi" },
  ];
}

export default function DressGuesserHints() {
  const [index, setIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [hintOrder, setHintOrder] = useState<number[]>([0, 1, 2]);
  const [currentHint, setCurrentHint] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [wrongPick, setWrongPick] = useState<boolean>(false);

  useEffect(() => {
    const newTarget = Math.floor(Math.random() * DRESSES.length);
    setTargetIndex(newTarget);
    setIndex(0);
    const total = DRESSES[newTarget].hints.length;
    const order = Array.from({ length: total }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setHintOrder(order);
    setCurrentHint(0);
  }, []);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const imageCardRef = useRef<HTMLDivElement | null>(null);

  function animateDressChange(delta: number) {
    const el = imageRef.current;
    const titleEl = titleRef.current;
    const nextIndex = (index + delta + DRESSES.length) % DRESSES.length;
    if (!el) {
      setIndex(nextIndex);
      return;
    }
    const tl = gsap.timeline({ defaults: { duration: 0.22, ease: "power2.in" } });
    tl.to(el, {
      x: delta > 0 ? -60 : 60,
      rotationY: delta > 0 ? -12 : 12,
      z: -40,
      opacity: 0,
    }).add(() => {
      setIndex(nextIndex);
      requestAnimationFrame(() => {
        const el2 = imageRef.current;
        if (el2) {
          gsap.fromTo(
            el2,
            { x: delta > 0 ? 60 : -60, rotationY: delta > 0 ? 12 : -12, z: 40, opacity: 0 },
            { x: 0, rotationY: 0, z: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        }
        // Title only: entrance float animation
        const t = titleRef.current;
        if (t) {
          gsap.fromTo(t, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
        }
        // Description only: entrance float animation from bottom
        const d = descRef.current;
        if (d) {
          gsap.fromTo(d, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.03 });
        }
      });
    });
  }

  function nextDress() {
    animateDressChange(+1);
  }

  function prevDress() {
    animateDressChange(-1);
  }

  const current = DRESSES[index];
  const target = useMemo(() => DRESSES[targetIndex], [targetIndex]);
  const totalHints = target.hints.length;
  const revealedCount = Math.min(currentHint + 1, totalHints);
  const revealedHintIndexes = hintOrder.slice(0, revealedCount);

  const hintsScopeRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const container = hintsScopeRef.current;
      if (!container) return;
      const items = container.querySelectorAll(".hint-item");
      const last = items[items.length - 1] as HTMLElement | undefined;
      if (last) {
        gsap.fromTo(
          last,
          { y: -24, opacity: 0, scale: 0.96, filter: "blur(2px)" },
          { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "back.out(1.7)" }
        );
      }
    },
    { scope: hintsScopeRef, dependencies: [revealedCount] }
  );

  function revealNextHint() {
    setCurrentHint((prev) => Math.min(prev + 1, totalHints - 1));
  }

  function confirmPick() {
    if (index === targetIndex) {
      setShowModal(true);
    } else {
      setWrongPick(true);
      window.setTimeout(() => setWrongPick(false), 500);
    }
  }

  function restartGame() {
    const newTarget = Math.floor(Math.random() * DRESSES.length);
    setTargetIndex(newTarget);
    setIndex(0);
    const total = DRESSES[newTarget].hints.length;
    const order = Array.from({ length: total }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setHintOrder(order);
    setCurrentHint(0);
    setShowModal(false);
    setWrongPick(false);
  }

  return (
    <main className="h-screen overflow-hidden pt-16 p-4 container mx-auto flex flex-col">
      <h1 className="text-[50px] font-semibold mb-4 text-center text-[#333]">Gioco dell’Abito</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Indizi</h2>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-[#6d5a27] rounded-full transition-all"
              style={{ width: `${(revealedCount / totalHints) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mb-3">{revealedCount} / {totalHints} Indizi mostrati</p>
          <div ref={hintsScopeRef} className="flex-1 space-y-2">
            {revealedHintIndexes.map((idx) => (
              <div key={idx} className="hint-item px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm">
                {target.hints[idx]}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 justify-center">
            <button
              className={`button__outline--dark ${revealedCount >= totalHints ? "after:content-['']" : "after:content-['+']"} cursor-pointer`}
              onClick={revealNextHint}
              disabled={revealedCount >= totalHints}
            >
              {revealedCount >= totalHints ? "Tutti gli indizi mostrati" : "Mostra prossimo indizio"}
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div
            ref={imageCardRef}
            className={`relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md ${wrongPick ? "border-red-500 animate-shake" : ""}`}
            style={{
              maxWidth: "min(512px, calc(100vh * 512 / 900))",
              height: "100%",
              marginLeft: "auto",
              marginRight: "auto",
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
            onMouseMove={(e) => {
              const card = imageCardRef.current;
              const img = imageRef.current;
              if (!card || !img) return;
              const rect = card.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width;
              const py = (e.clientY - rect.top) / rect.height;
              const rotY = (px - 0.5) * 14;
              const rotX = (0.5 - py) * 14;
              gsap.to(img, { rotationY: rotY, rotationX: rotX, duration: 0.2, ease: "power2.out", transformPerspective: 10000 });
            }}
            onMouseLeave={() => {
              const img = imageRef.current;
              if (!img) return;
              gsap.to(img, { rotationY: 0, rotationX: 0, duration: 0.3, ease: "power2.out" });
            }}
          >
            <div
              ref={titleRef}
              className="absolute top-0 left-6 right-6 z-10 px-4 py-2 bg-white/85 backdrop-blur-md text-gray-900 font-medium text-center rounded-b-xl shadow-md pointer-events-none"
              style={{ transformOrigin: "center center" }}
            >
              {current.name}
            </div>
            <img
              ref={imageRef}
              src={current.path}
              alt={current.name}
              className="absolute inset-0 w-full h-full object-contain will-change-transform will-change-opacity"
            />
            <div
              ref={descRef}
              className="absolute bottom-0 left-6 right-6 z-10 px-4 py-2 bg-white/85 backdrop-blur-md text-gray-700 text-sm text-center rounded-t-xl shadow-[0_-2px_6px_-1px_rgba(0,0,0,0.1),0_0px_4px_-2px_rgba(0,0,0,0.1)] pointer-events-none"
              style={{ transformOrigin: "center center" }}
            >
              {current.description}
            </div>
            <button
              aria-label="Previous dress"
              className="button__outline--dark absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={prevDress}
            >
              ◀
            </button>
            <button
              aria-label="Next dress"
              className="button__outline--dark absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={nextDress}
            >
              ▶
            </button>
          </div>
          {/* <div className="mt-3 text-center">
            <h2 className="text-lg font-medium text-gray-900">{current.name}</h2>
            <p className="text-gray-600 max-w-xl mx-auto">{current.description}</p>
          </div> */}
          <div className="mt-3 flex gap-3 justify-center">
            <a role="button" className="after:content-['✓']" onClick={confirmPick}>Conferma scelta</a>
            <a role="button" className="button__outline--dark after:content-['⟳']" onClick={restartGame}>Nuova partita</a>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Complimenti!</h2>
            <p className="text-gray-600 mb-6">
              Hai indovinato l’abito corretto: <span className="font-medium">{target.name}</span>
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={restartGame}>Gioca ancora</button>
              <button className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" onClick={() => setShowModal(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

