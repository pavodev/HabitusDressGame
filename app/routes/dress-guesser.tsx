import type { Route } from "./+types/dress-guesser";
import { useEffect, useMemo, useState } from "react";

type Dress = {
  name: string;
  description: string;
  path: string;
  hints: string[];
};

const DRESSES: Dress[] = [
  {
    name: "San Giacomo (Levanto)",
    description: "Traditional attire from San Giacomo, Levanto.",
    path: "/dresses/san-giacomo-levanto.png",
    hints: [
      "Patron feast celebrated near the sea.",
      "Black-and-white striped church façade.",
      "Named after St. James the Greater.",
    ],
  },
  {
    name: "San Giovanni (Serravalle)",
    description: "Ceremonial dress from San Giovanni, Serravalle.",
    path: "/dresses/san-giovanni-serravalle.png",
    hints: [
      "Dedicated to St. John the Baptist.",
      "Historic village between valleys.",
      "Feast often features processional banners.",
    ],
  },
  {
    name: "San Rocco (Nuovo, Lugano)",
    description: "Festive dress from San Rocco, Nuovo Lugano.",
    path: "/dresses/san-rocco-nuovo-lugano.png",
    hints: [
      "Saint invoked against plagues.",
      "Swiss-Italian cultural blend.",
      "Procession with music and candles.",
    ],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dress Gallery" },
    { name: "description", content: "Browse complete dresses" },
  ];
}

export default function DressGuesser() {
  const [index, setIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [hintOrder, setHintOrder] = useState<number[]>([0, 1, 2]);
  const [currentHint, setCurrentHint] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [wrongPick, setWrongPick] = useState<boolean>(false);

  useEffect(() => {
    const newTarget = Math.floor(Math.random() * DRESSES.length);
    setTargetIndex(newTarget);
    const total = DRESSES[newTarget].hints.length;
    const order = Array.from({ length: total }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setHintOrder(order);
    setCurrentHint(0);
  }, []);

  function nextDress() {
    setIndex((prev) => (prev + 1) % DRESSES.length);
  }

  function prevDress() {
    setIndex((prev) => (prev - 1 + DRESSES.length) % DRESSES.length);
  }

  const current = DRESSES[index];
  const target = useMemo(() => DRESSES[targetIndex], [targetIndex]);
  const totalHints = target.hints.length;
  const revealedCount = Math.min(currentHint + 1, totalHints);
  const revealedHintIndexes = hintOrder.slice(0, revealedCount);

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
      <h1 className="text-2xl font-semibold mb-4 text-center">Dress Guessing Game</h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Hints</h2>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(revealedCount / totalHints) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mb-3">{revealedCount} / {totalHints} hints shown</p>
          <div className="flex-1 space-y-2">
            {revealedHintIndexes.map((idx) => (
              <div key={idx} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm">
                {target.hints[idx]}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={revealNextHint}
              disabled={revealedCount >= totalHints}
            >
              {revealedCount >= totalHints ? "All hints shown" : "Show next hint"}
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div
            className={`relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md ${wrongPick ? "border-red-500 animate-shake" : ""}`}
            style={{ maxWidth: "min(512px, calc(100vh * 512 / 900))", height: "100%", marginLeft: "auto", marginRight: "auto" }}
          >
            <img
              src={current.path}
              alt={current.name}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <button
              aria-label="Previous dress"
              className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg border border-gray-300 bg-white/90 backdrop-blur hover:bg-white"
              onClick={prevDress}
            >
              ◀
            </button>
            <button
              aria-label="Next dress"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg border border-gray-300 bg-white/90 backdrop-blur hover:bg-white"
              onClick={nextDress}
            >
              ▶
            </button>
          </div>
          <div className="mt-3 text-center">
            <h2 className="text-lg font-medium text-gray-900">{current.name}</h2>
            <p className="text-gray-600 max-w-xl mx-auto">{current.description}</p>
          </div>
          <div className="mt-3 flex gap-3 justify-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={confirmPick}>Confirm selection</button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" onClick={restartGame}>New game</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Congratulations!</h2>
            <p className="text-gray-600 mb-6">
              You guessed the correct dress: <span className="font-medium">{target.name}</span>
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={restartGame}>Play again</button>
              <button className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

