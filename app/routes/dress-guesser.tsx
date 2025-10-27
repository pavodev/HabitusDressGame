import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Dress = {
  name: string;
  locality: string;
  description: string;
  path: string;
};

const DRESSES: Dress[] = [
  {
    name: "San Giacomo",
    locality: "Levanto",
    description: "Abito tradizionale di San Giacomo, Levanto.",
    path: "/dresses/san-giacomo-levanto.png",
  },
  {
    name: "San Giovanni",
    locality: "Serravalle",
    description: "Abito cerimoniale di San Giovanni, Serravalle.",
    path: "/dresses/san-giovanni-serravalle.png",
  },
  {
    name: "San Rocco",
    locality: "Nuovo Lugano",
    description: "Abito festivo di San Rocco, Nuovo Lugano.",
    path: "/dresses/san-rocco-nuovo-lugano.png",
  },
  {
    name: "San Rocco",
    locality: "Antico Lugano",
    description: "Abito festivo di San Rocco, Antico Lugano.",
    path: "/dresses/san-rocco-lugano-antico.png",
  },
  {
    name: "San Rosario",
    locality: "Val di Blenio",
    description: "Abito usato dalla confraternita di San Rosario, Val di Blenio.",
    path: "/dresses/san-rosario-val-di-blenio.png",
  },
  {
    name: "Abito di inizio XX secolo",
    locality: "?",
    description: "Oltregiogo appenninico ligure-piemontese.",
    path: "/dresses/abito-inizio-xx-secolo.png",
  },
];

export function meta() {
  return [
    { title: "Galleria di Abiti" },
    { name: "description", content: "Esplora gli abiti completi" },
  ];
}

export default function DressGuesser() {
  const [index, setIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [wrongPick, setWrongPick] = useState<boolean>(false);
  const [correctlyGuessed, setCorrectlyGuessed] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [hasAlreadyWon, setHasAlreadyWon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [earnedDiscount, setEarnedDiscount] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [liveMsg, setLiveMsg] = useState<string>("");

  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const imageCardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const confettiLayerRef = useRef<HTMLDivElement | null>(null);

  // Check if user has already won on component mount
  useEffect(() => {
    const hasWon = localStorage.getItem('dress-quiz-won') === 'true';
    const savedCode = localStorage.getItem('dress-quiz-code');
    setHasAlreadyWon(hasWon);
    setDiscountCode(savedCode);

    if (!hasWon) {
      const order = Array.from({ length: DRESSES.length }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      setQuestionOrder(order);
      setCurrentQuestion(0);
      setTargetIndex(order[0]);
      setIndex(0);
      setCorrectlyGuessed(new Set());
      setShowResults(false);
      setQuizComplete(false);
      setWrongPick(false);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Preload all dress images
    DRESSES.forEach(dress => {
      const img = new Image();
      img.src = dress.path;
    });
  }, []);

  // Show on first visit only
  useEffect(() => {
    setShowInstructions(!hasAlreadyWon);
  }, [hasAlreadyWon]);

  // --- Animations helpers ---
  function animateDressChange(delta: number) {
    const el = imageRef.current;
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
        const t = titleRef.current;
        if (t) {
          gsap.fromTo(t, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
        }
        const d = descRef.current;
        if (d) {
          gsap.fromTo(d, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.03 });
        }
      });
    });
  }

  function nextDress() {
    if (answering) return;
    animateDressChange(+1);
  }

  function prevDress() {
    if (answering) return;
    animateDressChange(-1);
  }

  // --- Correct / Wrong animations ---
  function celebrateCorrect() {
    const card = imageCardRef.current;
    const img = imageRef.current;
    const overlay = overlayRef.current;
    const badge = badgeRef.current;
    if (!card || !img || !overlay || !badge) return;

    badge!.innerText = '✓';

    // Reset quick
    gsap.set([badge, overlay], { clearProps: "all" });
    gsap.set(badge, { opacity: 0, scale: 0.4, y: 10, filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" });
    gsap.set(overlay, { opacity: 0 });
    gsap.set(card, { borderColor: "#e5e7eb" }); // gray-200

    const tl = gsap.timeline();

    // Border pulse + img pop/tilt
    tl.to(card, { borderColor: "#22c55e", duration: 0.18, ease: "power2.out" }, "start")
      .to(card, { borderColor: "#e5e7eb", duration: 0.35, ease: "power2.inOut" }, "start")
      .fromTo(img,
        { scale: 1, rotation: 0.001, rotationY: 0, rotationX: 0 },
        { scale: 1.04, duration: 0.16, ease: "power2.out" },
        "start")
      .to(img, { scale: 1, rotationY: -3, rotationX: 2, duration: 0.26, ease: "power2.inOut" }, "start");

    // Check badge pop + float
    tl.to(badge, {
      opacity: 1, scale: 1, y: 0, duration: 0.22, ease: "back.out(2)",
      filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))"
    }, "start")
      .to(badge, { y: -10, opacity: 0, duration: 0.45, ease: "power1.in" }, "start");

    // Confetti burst (self-cleaning)
    confettiBurst();

    // Subtle green overlay flash
    tl.fromTo(overlay, { backgroundColor: "rgba(34,197,94,0.15)", opacity: 0 },
      { opacity: 1, duration: 0.08, ease: "power1.out" }, "start")
      .to(overlay, { opacity: 0, duration: 0.25, ease: "power1.in" });
  }

  function indicateWrong() {
    const card = imageCardRef.current;
    const img = imageRef.current;
    const overlay = overlayRef.current;
    const badge = badgeRef.current;
    if (!card || !img || !overlay || !badge) return;

    badge!.innerText = '✕';

    gsap.set([badge, overlay], { clearProps: "all" });
    gsap.set(badge, { opacity: 0, scale: 0.6, rotate: -6 });
    gsap.set(overlay, { opacity: 0 });

    const tl = gsap.timeline();

    // Red border flash + vignette
    tl.to(card, { borderColor: "#ef4444", duration: 0.1, ease: "power1.out" }, "start")
      .to(card, { borderColor: "#e5e7eb", duration: 0.35, ease: "power1.inOut" }, "start")
      .fromTo(overlay, { background: "radial-gradient(ellipse at center, rgba(239,68,68,0.26) 0%, rgba(239,68,68,0.0) 60%)", opacity: 0 },
        { opacity: 1, duration: 0.08, ease: "power1.out" }, "start")
      .to(overlay, { opacity: 0, duration: 0.25, ease: "power1.in" });

    // Shake / wobble
    tl.fromTo(img,
      { x: 0, rotation: 0.001 },
      { x: -10, duration: 0.045, yoyo: true, repeat: 4, ease: "power1.inOut" }, "start")
      .to(img, { rotation: -2, duration: 0.08, ease: "power1.out" }, "start")
      .to(img, { rotation: 0, duration: 0.18, ease: "elastic.out(1, 0.7)" }, "start");

    // X badge thunk
    tl.to(badge, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(3)" }, "start")
      .to(badge, { y: 6, duration: 0.1, ease: "power1.inOut" }, "start")
      .to(badge, { opacity: 0, duration: 0.25, ease: "power1.in" }, "start");
  }

  function confettiBurst() {
    const layer = confettiLayerRef.current;
    const card = imageCardRef.current;
    if (!layer || !card) return;

    // remove any old
    layer.innerHTML = "";

    const count = 18;
    const rect = card.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 2;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "pointer-events-none";
      piece.style.position = "absolute";
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.width = "8px";
      piece.style.height = "12px";
      piece.style.borderRadius = "2px";
      // simple color cycle
      const colors = ["#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#a855f7"];
      piece.style.background = colors[i % colors.length];
      piece.style.opacity = "0";
      layer.appendChild(piece);

      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      const distance = 60 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance * (0.6 + Math.random() * 0.6);

      const rot = (Math.random() * 360) - 180;
      const dur = 0.6 + Math.random() * 0.4;

      gsap
        .timeline()
        .to(piece, {
          opacity: 1,
          duration: 0.08,
          ease: "power1.out",
        })
        .to(piece, {
          x: dx,
          y: dy - 20, // slight arc up
          rotation: rot,
          duration: dur * 0.7,
          ease: "power2.out",
        })
        .to(piece, {
          y: dy + 20, // fall down
          rotation: rot * 1.8,
          opacity: 0,
          duration: dur * 0.5,
          ease: "power2.in",
          onComplete: () => piece.remove(),
        });
    }
  }

  const current = DRESSES[index];
  const target = useMemo(() => DRESSES[targetIndex], [targetIndex]);

  function confirmPick() {
    if (answering || quizComplete) return;
    setAnswering(true);

    const isCorrect = index === targetIndex;

    // Live region message
    setLiveMsg(isCorrect ? "Corretto!" : "Sbagliato!");

    if (isCorrect) {
      setCorrectlyGuessed(prev => new Set([...prev, targetIndex]));
      celebrateCorrect();
    } else {
      setWrongPick(true);
      indicateWrong();
      window.setTimeout(() => setWrongPick(false), 500);
    }

    setTimeout(() => {
      nextQuestion(isCorrect);
      setAnswering(false);
    }, 700); // a touch longer to let the feedback read
  }

  function nextQuestion(justAnsweredCorrect: boolean) {
    const nextQuestionIndex = currentQuestion + 1;

    if (nextQuestionIndex >= questionOrder.length) {
      const finalCorrect =
        correctlyGuessed.has(targetIndex)
          ? correctlyGuessed.size
          : correctlyGuessed.size + (justAnsweredCorrect ? 1 : 0);

      const discount = calculateDiscount(finalCorrect, DRESSES.length);

      setEarnedDiscount(discount.percentage > 0);

      if (discount.percentage > 0) {
        localStorage.setItem('dress-quiz-won', 'true');
        localStorage.setItem('dress-quiz-code', discount.code || '');
      } else {
        localStorage.setItem('dress-quiz-completed', 'true');
        localStorage.setItem('dress-quiz-score', String(finalCorrect));
      }

      setQuizComplete(true);
      setShowResults(true);
    } else {
      setCurrentQuestion(nextQuestionIndex);
      setTargetIndex(questionOrder[nextQuestionIndex]);
      setIndex(0);
    }
  }

  function restartGame() {
    localStorage.removeItem('dress-quiz-won');
    localStorage.removeItem('dress-quiz-code');
    setHasAlreadyWon(false);
    setDiscountCode(null);
    setEarnedDiscount(false);
    setIsLoading(true);

    const order = Array.from({ length: DRESSES.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setQuestionOrder(order);
    setCurrentQuestion(0);
    setTargetIndex(order[0]);
    setIndex(0);
    setCorrectlyGuessed(new Set());
    setShowResults(false);
    setQuizComplete(false);
    setWrongPick(false);
    setIsLoading(false);
  }

  function calculateDiscount(correctCount: number, totalCount: number): { percentage: number; message: string; code?: string } {
    const twoThirds = Math.ceil(totalCount * 2 / 3);

    if (correctCount === totalCount || correctCount === totalCount - 1) {
      return { percentage: 50, message: "Ottimo lavoro! Hai ottenuto uno sconto del 50%!", code: "50%" };
    } else if (correctCount >= twoThirds) {
      return { percentage: 25, message: "Bravo! Hai ottenuto uno sconto del 25%!", code: "25%" };
    } else {
      return { percentage: 0, message: "Riprova per ottenere uno sconto!" };
    }
  }

  const shouldAllowRetry = quizComplete && !earnedDiscount && !hasAlreadyWon;

  if (isLoading) {
    return (
      <main className="h-screen overflow-hidden pt-16 p-4 container mx-auto flex flex-col">
        <h1 className="text-[50px] font-semibold mb-4 text-center text-[#333]">Quiz dell'Abito</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl text-gray-600">Caricamento...</div>
          </div>
        </div>
      </main>
    );
  }

  if (hasAlreadyWon) {
    return (
      <main className="min-h-screen overflow-hidden pt-8 sm:pt-12 md:pt-16 p-3 sm:p-4 container mx-auto flex flex-col">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[50px] font-semibold mb-3 sm:mb-4 text-center text-[#333]">Quiz dell'Abito</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mx-2 sm:mx-4 max-w-md w-full shadow-2xl text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Quiz Completato!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Hai già completato il quiz e ottenuto il tuo sconto!
            </p>
            {discountCode && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-green-600">{discountCode}</p>
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Mostra questo codice al banco della mostra per ottenere lo sconto.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden pt-8 sm:pt-12 md:pt-16 p-3 sm:p-4 md:p-6 container mx-auto flex flex-col">
      {/* aria-live for correctness feedback */}
      <div aria-live="polite" className="sr-only">{liveMsg}</div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[50px] font-semibold mb-3 sm:mb-4 text-center text-[#333]">Gioco dell'Abito</h1>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 items-stretch">
        <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white shadow-sm flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Quiz</h2>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-[#6d5a27] rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questionOrder.length) * 100}%` }}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-3">Domanda {currentQuestion + 1} di {questionOrder.length}</p>
          <p className="text-xs sm:text-sm text-green-600 mb-3 font-medium">{correctlyGuessed.size} risposte corrette</p>
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 bg-blue-50 text-gray-800 shadow-sm">
              <h3 className="font-semibold text-base sm:text-lg mb-1">{target.name}</h3>
              <p className="text-sm sm:text-base text-gray-600">{target.locality}</p>
            </div>
            <div className="text-center text-xs sm:text-sm text-gray-600">
              <p>Trova l'abito corrispondente tra quelli disponibili</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div
            ref={imageCardRef}
            className={`relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md ${wrongPick ? "animate-shake" : ""}`}
            style={{
              maxWidth: "min(512px, calc(100vh * 512 / 900))",
              height: "100%",
              marginLeft: "auto",
              marginRight: "auto",
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
            onMouseMove={(e) => {
              if (answering) return;
              const card = imageCardRef.current;
              const img = imageRef.current;
              if (!card || !img) return;
              const rect = card.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width;
              const py = (e.clientY - rect.top) / rect.height;
              const rotY = (px - 0.5) * 14;
              const rotX = (0.5 - py) * 14;
              gsap.to(img, { rotationY: rotY, rotationX: rotX, duration: 0.2, ease: "power2.out" });
            }}
            onMouseLeave={() => {
              const img = imageRef.current;
              if (!img) return;
              gsap.to(img, { rotationY: 0, rotationX: 0, duration: 0.3, ease: "power2.out" });
            }}
          >
            {/* overlay for flashes / vignette */}
            <div
              ref={overlayRef}
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{ opacity: 0 }}
            />
            {/* correctness badges */}
            <div
              ref={badgeRef}
              className="pointer-events-none absolute top-3 right-3 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-xl"
              style={{ opacity: 0 }}
            >
              {/* We’ll toggle content via CSS: show ✓ on green, ✕ on red by color */}
              {/* For simplicity, we always render a check and style it; wrong flow anim still feels clear with X via content */}
              <span className="select-none">✓</span>
            </div>
            {/* Confetti layer */}
            <div ref={confettiLayerRef} className="pointer-events-none absolute inset-0 z-10" />

            <div
              ref={titleRef}
              className="absolute top-0 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-10 px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/85 backdrop-blur-md text-gray-900 font-medium text-center rounded-b-xl shadow-md pointer-events-none text-xs sm:text-sm md:text-base"
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
              className="absolute bottom-0 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-10 px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/85 backdrop-blur-md text-gray-700 text-xs sm:text-sm text-center rounded-t-xl shadow-[0_-2px_6px_-1px_rgba(0,0,0,0.1),0_0px_4px_-2px_rgba(0,0,0,0.1)] pointer-events-none"
              style={{ transformOrigin: "center center" }}
            >
              {current.description}
            </div>
            {(!hasAlreadyWon && (!quizComplete || !earnedDiscount)) && (
              <button
                aria-label="Previous dress"
                className="arrow button__outline--dark absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 cursor-pointer text-sm sm:text-base disabled:opacity-30"
                onClick={prevDress}
                disabled={answering}
              >
                ◀
              </button>
            )}
            {(!hasAlreadyWon && (!quizComplete || !earnedDiscount)) && (
              <button
                aria-label="Next dress"
                className="arrow button__outline--dark absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 cursor-pointer text-sm sm:text-base disabled:opacity-30"
                onClick={nextDress}
                disabled={answering}
              >
                ▶
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 justify-center">
            {!quizComplete && !earnedDiscount && (
              <button
                className="text-xs sm:text-sm after:content-['✓'] disabled:opacity-50 disabled:pointer-events-none"
                onClick={confirmPick}
                disabled={answering || quizComplete}
              >
                Conferma scelta
              </button>
            )}
            {shouldAllowRetry && (
              <button className="text-xs sm:text-sm" onClick={restartGame}>Riprova</button>
            )}
          </div>
        </div>
      </div>

      {showResults && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="results-title">
          <div className="bg-white rounded-xl p-4 sm:p-6 mx-2 sm:mx-4 max-w-md w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
            <h2 id="results-title" className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Quiz Completato!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Hai indovinato <span className="font-medium">{correctlyGuessed.size} su {DRESSES.length}</span> abiti
            </p>
            {(() => {
              const discount = calculateDiscount(correctlyGuessed.size, DRESSES.length);
              return (
                <div className="mb-4 sm:mb-6">
                  <p className={`text-base sm:text-lg font-semibold ${discount.percentage > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {discount.message}
                  </p>
                  {discount.percentage > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Mostra questo risultato al banco della mostra per ottenere lo sconto!
                    </p>
                  )}
                </div>
              );
            })()}
            <div className="flex gap-2 sm:gap-3">
              {!earnedDiscount && (
                <button className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={restartGame}>
                  Riprova
                </button>
              )}
              <button className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" onClick={() => {
                if (earnedDiscount) {
                  setShowResults(false);
                  setHasAlreadyWon(true);
                  const savedCode = localStorage.getItem('dress-quiz-code');
                  setDiscountCode(savedCode);
                } else {
                  setShowResults(false);
                }
              }}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && !hasAlreadyWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="instr-title">
          <div className="bg-white p-6 rounded-xl max-w-md flex flex-col items-center">
            <h2 id="instr-title" className="text-xl font-bold mb-3 text-center">Istruzioni</h2>
            <ul className="space-y-2 text-sm">
              <li>1) Il quiz è composto da <strong>{DRESSES.length} domande</strong>: ogni domanda mostra una descrizione dell'abito.</li>
              <li>2) Usando <strong>le frecce</strong> puoi sfogliare gli abiti: usa il pulsante <strong>"Conferma scelta"</strong> per selezionarne uno.</li>
              <li>3) Maggiore è il numero di abiti indovinati, maggiore sarà lo sconto che potrai ottenere!</li>
            </ul>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg"
            >
              Inizia il quiz
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
