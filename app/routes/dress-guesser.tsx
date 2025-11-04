import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useParams } from "react-router";


/**
 * TRANSLATIONS
*/

type Locale = 'it' | 'en';

const MESSAGES = {
  it: {
    appTitle: "Quiz dell'Abito",
    appTitleAlt: "Quiz dell'Abito",
    loading: "Caricamento...",
    changeLanguage: "Change language: ",
    quiz: "Quiz",
    questionXofY: "Domanda {{x}} di {{y}}",
    correctCount: "{{n}} risposte corrette",
    findTheDress: "Trova l'abito corrispondente tra quelli disponibili",
    confirm: "Conferma scelta",
    retry: "Riprova",
    close: "Chiudi",
    completed: "Quiz Completato!",
    alreadyWon: "Hai già completato il quiz e ottenuto il tuo sconto sull'acquisto del libro!",
    showAtDesk: "Mostra questo risultato al banco della mostra per ottenere uno sconto sull'acquisto del libro!",
    instrTitle: "Istruzioni",
    instrContent: "<ul className=\"space-y-2 text-sm\"><li>1) Il quiz è composto da <strong>{{numberOfQuestions}} domande</strong>: Ci sono domande a scelta multipla o domande in cui devi indovinare l'abito descritto.</li><li></br>2) Usando <strong>le frecce</strong> puoi sfogliare gli abiti: usa il pulsante <strong>\"Conferma scelta\"</strong> per selezionarne uno.</li><li></br>3) Maggiore è il numero di risposte corrette, maggiore sarà lo sconto sull'acquisto del libro che potrai ottenere!</li></ul>",
    startQuiz: "Inizia il quiz",
    guessedSummary: "Risposte corrette: <span class=\"font-medium\">{{a}} / {{b}}</span>",
    discount50: "Ottimo lavoro! Hai ottenuto uno sconto del 50% sull'acquisto del libro!",
    discount25: "Bravo! Hai ottenuto uno sconto del 25% sull'acquisto del libro!",
    discount0: "Riprova per ottenere uno sconto sull'acquisto del libro!",
    correctLive: "Corretto!",
    wrongLive: "Sbagliato!",
    selectAll: "Seleziona tutte le opzioni corrette",
    submit: "Conferma scelta",
    dressPrompt: "Trova l'abito corrispondente tra quelli disponibili",
    question: "Domanda",
    questionLabel: "Domanda {{x}}",
  },
  en: {
    appTitle: "Dress Quiz",
    appTitleAlt: "Dress Quiz",
    loading: "Loading...",
    changeLanguage: "Cambia lingua: ",
    quiz: "Quiz",
    questionXofY: "Question {{x}} of {{y}}",
    correctCount: "{{n}} correct answers",
    findTheDress: "Find the matching dress among the options",
    confirm: "Confirm choice",
    retry: "Try again",
    close: "Close",
    completed: "Quiz Completed!",
    alreadyWon: "You already completed the quiz and got your book discount!",
    showAtDesk: "Show this result at the exhibition desk to redeem the book discount!",
    instrTitle: "Instructions",
    instrContent: "<ul className=\"space-y-2 text-sm\"><li>1) The quiz has <strong>{{numberOfQuestions}} questions</strong>. There are two types of questions</strong>: multiple choice questions or questions where you need to pick the correct dress.</li><li></br>2) By using <strong>the arrows</strong> you can see all the available dresses: use the <strong>\"Confirm choice\"</strong> button to select one.</li><li></br>3) The greater the number of correct answers, the bigger the discount you will earn!</li></ul>",
    startQuiz: "Start the quiz",
    guessedSummary: 'Correct answers: <span class="font-medium">{{a}} out of {{b}}</span>',
    discount50: "Great job! You earned a 50% book discount!",
    discount25: "Nice! You earned a 25% book discount!",
    discount0: "Try again to earn a book discount!",
    correctLive: "Correct!",
    wrongLive: "Wrong!",
    selectAll: "Select all correct options",
    submit: "Confirm choice",
    dressPrompt: "Find the matching dress among the options",
    question: "Question",
    questionLabel: "Question {{x}}",
  },
} as const;

function format(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}

// SSR-safe locale state: default 'it', then read browser preference on client
function useLocale(): [Locale, (l: Locale) => void] {
  const { lang: routeLang } = useParams<{ lang?: string }>();

  const [lang, setLang] = useState<Locale>(() => {
    // Run once at init so first render matches stored preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lang') as Locale | null;
      if (stored === 'en' || stored === 'it') return stored;

      const nav = navigator.language || 'it';
      return nav.startsWith('en') ? 'en' : 'it';
    }
    // SSR fallback
    return 'it';
  });

  useEffect(() => {
    if (routeLang === "it" || routeLang === "en") {
      // Override app language from the URL and persist
      setLang(routeLang);
      if (typeof window !== "undefined") localStorage.setItem("lang", routeLang);
    }
    // If routeLang is undefined or invalid, do nothing: fallback to your current logic.
  }, [routeLang, setLang]);

  // Persist on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }, [lang]);

  return [lang, setLang];
}

function useT(lang: Locale) {
  return (key: keyof typeof MESSAGES['it'], vars?: Record<string, string | number>) =>
    format(MESSAGES[lang][key], vars);
}

/**
 * LOCALISATION HELPER
 */

type Localized = Record<Locale, string>;
const useL = (lang: Locale) => (v: Localized) => v[lang];

/**
 * DRESSES DATA
 */

type Dress = {
  name: Localized;
  locality: Localized;
  description: Localized;
  path: string;
};

const DRESSES: Dress[] = [
  // {
  //   name: { it: "San Giacomo", en: "San Giacomo" },
  //   locality: { it: "Levanto", en: "Levanto" },
  //   description: {
  //     it: "Abito tradizionale di San Giacomo, Levanto.",
  //     en: "Traditional attire of San Giacomo, Levanto."
  //   },
  //   path: "/dresses/san-giacomo-levanto.png",
  // },
  {
    name: { it: "San Giovanni", en: "San Giovanni" },
    locality: { it: "Serravalle", en: "Serravalle" },
    description: {
      it: "Abito cerimoniale di San Giovanni, Serravalle.",
      en: "Ceremonial attire of San Giovanni, Serravalle."
    },
    path: "/dresses/san-giovanni-serravalle.png",
  },
  {
    name: { it: "Nuovo abito festivo di San Rocco", en: "New festive attire of San Rocco" },
    locality: { it: "Lugano", en: "Lugano" },
    description: {
      it: "Abito festivo di San Rocco, Nuovo Lugano.",
      en: "New festive attire of San Rocco, Lugano."
    },
    path: "/dresses/san-rocco-nuovo-lugano.png",
  },
  {
    name: { it: "Antico abito festivo di San Rocco", en: "Old festive attire of San Rocco" },
    locality: { it: "Lugano", en: "Lugano" },
    description: {
      it: "Antico abito festivo di San Rocco, Lugano.",
      en: "Old festive attire of San Rocco, Lugano."
    },
    path: "/dresses/san-rocco-lugano-antico.png",
  },
  {
    name: { it: "San Rosario", en: "San Rosario" },
    locality: { it: "Val di Blenio", en: "Val di Blenio" },
    description: {
      it: "Abito usato dalla confraternita di San Rosario, Val di Blenio.",
      en: "Attire used by the Confraternity of San Rosario, Val di Blenio."
    },
    path: "/dresses/san-rosario-val-di-blenio.png",
  },
  {
    name: { it: "Abito di inizio XX secolo", en: "Early 20th-century attire" },
    locality: { it: "Fra le regioni Luguria e Pemonte", en: "Area between the regions Luguria e Piedmont Apennines" },
    description: {
      it: "Oltregiogo appenninico ligure-piemontese.",
      en: "Area between Liguria and Piedmont Apennines."
    },
    path: "/dresses/abito-inizio-xx-secolo.png",
  },
  {
    name: { it: "Santissimo Sacramento (1990)", en: "Santissimo Sacramento (1990)" },
    locality: { it: "Biasca", en: "Biasca" },
    description: {
      it: "Abito della confraternita del Santissimo Sacramento di Biasca (1990).",
      en: "Attire of the Confraternity of Santissimo Sacramento of Biasca (1990)."
    },
    path: "/dresses/santissimo-sacramento-biasca.png",
  },
  {
    name: { it: "Santissimo Sacramento e Rosario", en: "Santissimo Sacramento e Rosario" },
    locality: { it: "Balerna", en: "Balerna" },
    description: {
      it: "Abito della confraternita del Santissimo Sacramento e Rosario di Balerna.",
      en: "Attire of the Confraternity of Santissimo Sacramento e Rosario of Balerna."
    },
    path: "/dresses/santissimo-sacramento-balerna.png",
  },
  {
    name: { it: "Señor de los Milagros", en: "Señor de los Milagros" },
    locality: { it: "Perù", en: "Peru" },
    description: {
      it: "Abito maschile della confraternita del Señor de los Milagros, Perù.",
      en: "Men’s attire of the Confraternity of Señor de los Milagros, Peru."
    },
    path: "/dresses/senor-de-los-milagros-peru.png",
  },
  {
    name: {
      it: "Arciconfraternita della Buona Morte ed Orazione",
      en: "Archconfraternity of Buona Morte ed Orazione"
    },
    locality: { it: "Lugano", en: "Lugano" },
    description: {
      it: "Arciconfraternita della Buona Morte ed Orazione sotto il titolo di S. Marta, Lugano.",
      en: "Archconfraternity of Buona Morte ed Orazione under the title of St. Marta, Lugano."
    },
    path: "/dresses/confraternita-buona-morte-lugano.png",
  },
];

/**
 * MULTIPLE CHOICES DATA
 */

type McqChoice = { label: Localized; correct: boolean };
type McqQuestion = {
  kind: "mcq";
  questionText: Localized;
  choices: McqChoice[];
};

type DressQuestion = { kind: "dress"; targetIndex: number };
type Question = DressQuestion | McqQuestion;

const MCQ_QUESTIONS: McqQuestion[] = [
  {
    kind: "mcq",
    questionText: {
      en: "What are the three main reasons why people dress?",
      it: "Quali sono le tre principali ragioni per cui le persone si vestono?"
    },
    choices: [
      { label: { en: "Modesty", it: "Modestia" }, correct: true },
      { label: { en: "Function", it: "Funzione" }, correct: true },
      { label: { en: "Expression/Communication", it: "Espressione/Comunicazione" }, correct: true },
      { label: { en: "Peer pressure", it: "Pressione dei pari" }, correct: false },
      { label: { en: "Survival", it: "Sopravvivenza" }, correct: false },
      { label: { en: "Fun", it: "Divertimento" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "Which items did the father give to his son in the Parable of the Prodigal Son?",
      it: "Quali oggetti il padre ha dato al figlio nella parabola del Figliol Prodigo?"
    },
    choices: [
      { label: { en: "Ring", it: "Anello" }, correct: true },
      { label: { en: "Robe", it: "Tunica" }, correct: true },
      { label: { en: "Sandals", it: "Sandali" }, correct: true },
      { label: { en: "Necklace", it: "Collana" }, correct: false },
      { label: { en: "Crown", it: "Corona" }, correct: false },
      { label: { en: "Bracelet", it: "Braccialetto" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "According to the Bible, were Adam and Eve aware of their nakedness in the Garden of Eden?",
      it: "Secondo la Bibbia, Adamo ed Eva erano consapevoli della loro nudità nel Giardino dell’Eden?"
    },
    choices: [
      { label: { en: "No, never.", it: "No, mai." }, correct: false },
      { label: { en: "Yes, always.", it: "Sì, sempre." }, correct: false },
      { label: { en: "Yes, but only after the original sin.", it: "Sì, ma solo dopo il peccato originale." }, correct: true }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "What was the profession of Paul of Tarsus?",
      it: "Qual era la professione di Paolo di Tarso?"
    },
    choices: [
      { label: { en: "Tentmaker", it: "Tessitore di tende" }, correct: true },
      { label: { en: "Carpenter", it: "Falegname" }, correct: false },
      { label: { en: "Shoemaker", it: "Calzolaio" }, correct: false },
      { label: { en: "Teacher", it: "Insegnante" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "Which perfumes were given to Jesus by the Three Kings?",
      it: "Quali profumi sono stati donati a Gesù dai Re Magi?"
    },
    choices: [
      { label: { en: "Frankincense", it: "Incenso" }, correct: true },
      { label: { en: "Myrrh", it: "Mirra" }, correct: true },
      { label: { en: "Lavender", it: "Lavanda" }, correct: false },
      { label: { en: "Rose", it: "Rosa" }, correct: false },
      { label: { en: "Nard", it: "Nardo" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "What is the meaning and purpose of the hood in the confraternities’ robes?",
      it: "Qual è il significato e lo scopo del cappuccio nelle vesti delle confraternite?"
    },
    choices: [
      { label: { en: "To hide the wearer for humility", it: "Nascondere chi lo indossa per umiltà" }, correct: true },
      { label: { en: "To scare children", it: "Spaventare i bambini" }, correct: false },
      { label: { en: "To be fashionable", it: "Essere alla moda" }, correct: false },
      { label: { en: "To protect against the weather", it: "Proteggere dal maltempo" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "According to Christian tradition, what are the seven Works of Mercy?",
      it: "Secondo la tradizione cristiana, quali sono le sette Opere di Misericordia?"
    },
    choices: [
      { label: { en: "Feed the hungry", it: "Dare da mangiare agli affamati" }, correct: true },
      { label: { en: "Give drink to the thirsty", it: "Dare da bere agli assetati" }, correct: true },
      { label: { en: "Clothe the naked", it: "Vestire chi è nudo" }, correct: true },
      { label: { en: "Shelter the homeless", it: "Ospitare gli indigenti" }, correct: true },
      { label: { en: "Visit the sick", it: "Visitare gli ammalati" }, correct: true },
      { label: { en: "Visit the imprisoned", it: "Visitare i carcerati" }, correct: true },
      { label: { en: "Bury the dead", it: "Seppellire i morti" }, correct: true },
      { label: { en: "Teach the rich", it: "Istruire i ricchi" }, correct: false },
      { label: { en: "Build churches", it: "Costruire chiese" }, correct: false },
      { label: { en: "Pray silently", it: "Pregare in silenzio" }, correct: false }
    ]
  },
  {
    kind: "mcq",
    questionText: {
      en: "Have the Holy Week Processions of Mendrisio been listed as Intangible Cultural Heritage by UNESCO?",
      it: "Le processioni della Settimana Santa di Mendrisio sono state inserite nel Patrimonio Culturale Immateriale dell’UNESCO?"
    },
    choices: [
      { label: { en: "Yes, since 2019.", it: "Sì, dal 2019." }, correct: true },
      { label: { en: "No, they haven’t.", it: "No, non lo sono." }, correct: false },
      { label: { en: "No, not yet, but the application has been submitted.", it: "No, non ancora, ma la candidatura è stata presentata." }, correct: false }
    ]
  }
];


export function meta() {
  return [
    { title: "Quiz dell'Abito" },
    { name: "description", content: "Completa il quiz per ottenere uno sconto!" },
  ];
}

export default function DressGuesser() {
  const [lang, setLang] = useLocale();
  const t = useT(lang);
  const L = useL(lang);

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mcqSelected, setMcqSelected] = useState<Set<number>>(new Set());
  const [mcqCorrect, setMcqCorrect] = useState<number>(0);

  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const imageCardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const confettiLayerRef = useRef<HTMLDivElement | null>(null);
  const mcqCardRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const questionInfoRef = useRef<HTMLDivElement | null>(null);
  const topAnchorRef = useRef<HTMLDivElement | null>(null);

  // Swipe refs & functions
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartT = useRef(0);
  const isSwiping = useRef(false);

  function resetImageTransform() {
    const img = imageRef.current;
    if (img) gsap.to(img, { x: 0, rotationY: 0, duration: 0.2, ease: "power2.out" });
  }

  // Check if user has already won on component mount
  useEffect(() => {
    // const hasWon = localStorage.getItem('dress-quiz-won') === 'true';
    const hasWon = false;
    const savedCode = localStorage.getItem('dress-quiz-code');
    setHasAlreadyWon(hasWon);
    setDiscountCode(savedCode);

    if (!hasWon) {
      // Build a mixed bank: one DressQuestion per dress + all MCQs
      const dressQs: DressQuestion[] = DRESSES.map((_, i) => ({ kind: "dress", targetIndex: i }));

      // Shuffle choices within each MCQ before combining
      const mcqsShuffled: McqQuestion[] = MCQ_QUESTIONS.map(q => ({
        ...q,
        choices: [...q.choices].sort(() => Math.random() - 0.5),
      }));

      // Combine and shuffle all questions together
      const qs: Question[] = [...dressQs, ...mcqsShuffled];

      // Shuffle in-place (Fisher–Yates)
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }

      setQuestions(qs);
      setCurrentQuestion(0);
      // Initialize dress-specific indices if the first is a dress question
      if (qs[0]?.kind === "dress") {
        setTargetIndex(qs[0].targetIndex);
        setIndex(0);
      }
      setCorrectlyGuessed(new Set());
      setMcqSelected(new Set());
      setMcqCorrect(0);
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

  function pulse(el: HTMLElement | null) {
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { willChange: "box-shadow,border-color" });

    gsap.timeline({
      onComplete: () => { gsap.set(el, { willChange: "auto" }); },
    })
      .to(el, {
        borderColor: "#6d5a27",
        outline: "2px solid #6d5a27",     // <- better visibility on iOS
        outlineOffset: "2px",
        duration: 0.2,
        ease: "power2.out",
      })
      .to(el, {
        boxShadow: "0 0 0 6px rgba(109,90,39,0.16)",
        duration: 0.2,
        ease: "power2.out",
      }, "<")
      .to(el, {
        boxShadow: "0 0 0 0 rgba(109,90,39,0)",
        borderColor: "#e5e7eb",
        outlineColor: "transparent",
        outlineOffset: "0px",
        duration: 0.5,
        ease: "power2.inOut",
      });
  }

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];
  const isDressQ = currentQ?.kind === "dress";
  const isMcqQ = currentQ?.kind === "mcq";

  // Keep existing "current" & "target" for DRESSES rendering:
  const current = DRESSES[index];
  const target = useMemo(() => (isDressQ ? DRESSES[targetIndex] : DRESSES[0]), [isDressQ, targetIndex]);

  function resetDressVisuals() {
    const card = imageCardRef.current;
    const img = imageRef.current;
    const overlay = overlayRef.current;
    const badge = badgeRef.current;
    const confetti = confettiLayerRef.current;

    // Kill tweens to avoid mid-flight animations bleeding over
    gsap.killTweensOf([card, img, overlay, badge]);
    if (confetti) {
      // kill any piece tweens by killing all children too
      gsap.killTweensOf(Array.from(confetti.children));
      confetti.innerHTML = "";
    }

    // Clear styles
    if (overlay) gsap.set(overlay, { opacity: 0, background: "none", backgroundColor: "transparent" });
    if (badge) gsap.set(badge, { opacity: 0, y: 0, scale: 1, rotate: 0, filter: "none" });
    if (img) gsap.set(img, { x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1 });
    if (card) gsap.set(card, { x: 0, scale: 1, borderColor: "#e5e7eb" }); // gray-200
  }

  function resetMcqVisuals() {
    const box = mcqCardRef.current;
    if (!box) return;
    gsap.killTweensOf(box);
    gsap.set(box, { x: 0, scale: 1, borderColor: "#e5e7eb" }); // gray-200
  }

  useEffect(() => {
    resetDressVisuals();
    resetMcqVisuals();

    if (!currentQ) return;

    if (currentQ.kind === "dress") {
      setTargetIndex(currentQ.targetIndex);
      // setIndex(0);
      setMcqSelected(new Set());
    } else {
      setMcqSelected(new Set());
    }
  }, [currentQ]);

  useEffect(() => {
    // scroll to top
    if (topAnchorRef.current?.scrollIntoView) {
      topAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = mainRef.current;
      const scroller = el && el.scrollHeight > el.clientHeight
        ? el
        : (document.scrollingElement || document.documentElement);
      scroller?.scrollTo({ top: 0, behavior: "smooth" as ScrollBehavior });
    }

    const isMcq = questions[currentQuestion]?.kind === "mcq";
    const targetEl = isMcq ? mcqCardRef.current : questionInfoRef.current;

    let cleanup: (() => void) | undefined;

    if (typeof window !== "undefined" && "onscrollend" in window) {
      const handler = () => { run(); window.removeEventListener("scrollend", handler); };
      const run = () => pulse(targetEl);
      window.addEventListener("scrollend", handler);
      cleanup = () => window.removeEventListener("scrollend", handler);
    } else {
      const run = () => pulse(targetEl);
      const id: ReturnType<typeof setTimeout> = setTimeout(run, 350);
      cleanup = () => clearTimeout(id);
    }

    return cleanup;
  }, [currentQuestion, questions]);

  function setsEqual<T>(a: Set<T>, b: Set<T>) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  function confirmPick() {
    if (answering || quizComplete || !currentQ) return;
    setAnswering(true);

    let isCorrect = false;

    if (currentQ.kind === "dress") {
      isCorrect = index === targetIndex;
      setLiveMsg(isCorrect ? t('correctLive') : t('wrongLive'));

      if (isCorrect) {
        setCorrectlyGuessed(prev => new Set([...prev, targetIndex]));
        celebrateCorrect();
      } else {
        setWrongPick(true);
        indicateWrong();
        window.setTimeout(() => setWrongPick(false), 500);
      }
    } else {
      // --- MCQ grading (snapshot selection first to avoid race with checkbox updates) ---
      const selected = new Set(mcqSelected); // snapshot
      const correctIdx = new Set<number>(
        currentQ.choices.map((c, i) => (c.correct ? i : -1)).filter(i => i >= 0)
      );

      isCorrect = setsEqual(selected, correctIdx);
      setLiveMsg(isCorrect ? t('correctLive') : t('wrongLive'));

      const el = mcqCardRef.current;
      if (el) {
        if (isCorrect) {
          gsap.timeline()
            .to(el, { borderColor: "#22c55e", duration: 0.15, ease: "power2.out" })
            .to(el, { scale: 1.02, duration: 0.12, ease: "power2.out" }, "<")
            .to(el, { borderColor: "#e5e7eb", scale: 1, duration: 0.3, ease: "power2.inOut" });
        } else {
          gsap.timeline()
            .to(el, { borderColor: "#ef4444", duration: 0.1 })
            .to(el, { x: -8, duration: 0.05, yoyo: true, repeat: 3 })
            .to(el, { x: 0, borderColor: "#e5e7eb", duration: 0.2 });
        }
      }

      if (isCorrect) setMcqCorrect(c => c + 1);

      console.log("selected", [...selected], "correct", [...correctIdx], "equal?", isCorrect);
    }

    setTimeout(() => {
      nextQuestion(isCorrect);
      setAnswering(false);
    }, 700);
  }

  function nextQuestion(justAnsweredCorrect: boolean) {
    resetDressVisuals();
    resetMcqVisuals();

    const nextQuestionIndex = currentQuestion + 1;

    if (nextQuestionIndex >= totalQuestions) {
      // Final tally
      const dressCorrect = correctlyGuessed.has(targetIndex)
        ? correctlyGuessed.size
        : correctlyGuessed.size + (isDressQ && justAnsweredCorrect ? 1 : 0);

      const finalCorrect = dressCorrect + (isMcqQ && justAnsweredCorrect ? mcqCorrect + 1 : mcqCorrect);

      const discount = calculateDiscount(finalCorrect, totalQuestions);
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
      <main ref={mainRef} className="min-h-[100dvh] overflow-y-auto [-webkit-overflow-scrolling:touch] pt-8 sm:pt-12 md:pt-16 pb-20 lg:pb-6 p-3 sm:p-4 md:p-6 container mx-auto flex flex-col">
        <div ref={topAnchorRef} />
        <h1 className="text-[50px] font-semibold mb-4 text-center text-[#333]">{t('appTitleAlt')}</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl text-gray-600">{t('loading')}</div>
          </div>
        </div>
      </main>
    );
  }

  if (hasAlreadyWon) {
    return (
      <main ref={mainRef} className="min-h-[100dvh] overflow-y-auto [-webkit-overflow-scrolling:touch] pt-8 sm:pt-12 md:pt-16 pb-20 lg:pb-6 p-3 sm:p-4 md:p-6 container mx-auto flex flex-col">
        <div ref={topAnchorRef} />
        <div className="flex flex-col-reverse items-center justify-center gap-3 mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[50px] font-semibold text-[#333]">
            {t('appTitle')}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <p className="text-center text-sm sm:text-sm text-gray-600">{t('changeLanguage')}</p>
            <button
              className="button__lang py-1 text-xl border rounded flex items-center justify-center"
              onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
              aria-label={t('changeLanguage')}
            >{lang === 'it' ? '🇬🇧' : '🇮🇹'}</button></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mx-2 sm:mx-4 max-w-md w-full shadow-2xl text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">{t('completed')}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t('alreadyWon')}
            </p>
            {discountCode && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <p className="text-2xl sm:text-3xl font-mono font-bold text-green-600">{discountCode}</p>
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              {t('showAtDesk')}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={mainRef} className="min-h-[100dvh] overflow-y-auto [-webkit-overflow-scrolling:touch] pt-8 sm:pt-12 md:pt-16 pb-20 lg:pb-6 p-3 sm:p-4 md:p-6 container mx-auto flex flex-col">
      <div ref={topAnchorRef} />
      <div aria-live="polite" className="sr-only">{liveMsg}</div>
      <div className="flex items-center justify-center flex-col-reverse gap-3 mb-3 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[50px] font-semibold text-[#333]">
          {t('appTitle')}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <p className="text-center text-sm sm:text-sm text-gray-600">{t('changeLanguage')}</p>
          <button
            className="button__lang py-1 text-xl border rounded flex items-center justify-center"
            onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
            aria-label={t('changeLanguage')}
          >{lang === 'it' ? '🇬🇧' : '🇮🇹'}</button></div>
      </div>
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 items-stretch">
        <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white shadow-sm flex flex-col">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('quiz')}</h2>
          <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-[#6d5a27] rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-sm text-green-600 mb-3 font-medium text-end">{t('correctCount', { n: correctlyGuessed.size + mcqCorrect })}</p>
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div ref={questionInfoRef} className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 bg-blue-50 text-gray-800 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t('questionXofY', { x: currentQuestion + 1, y: totalQuestions })}
              </p>
              {isDressQ ? (
                <>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">{L(target.name)}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{L(target.locality)}</p>
                </>
              ) : (
                <>
                  {/* <h3 className="font-semibold text-base sm:text-lg mb-1">{t('question')}</h3> */}
                  <p className="text-sm sm:text-base text-gray-700">{L((currentQ as McqQuestion).questionText)}</p>
                </>
              )}
            </div>

            <div className="text-center text-sm sm:text-sm text-gray-600">
              <p>{isDressQ ? t('dressPrompt') : t('selectAll')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col relative">
          {isDressQ ? (
            <>
              {/* DRESS question UI (unchanged) */}
              <div
                ref={imageCardRef}
                className={`relative w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md ${wrongPick ? "animate-shake" : ""} touch-pan-y select-none`}
                style={{
                  width: "100%",
                  height: "min(85dvh, 640px)",
                  maxWidth: "512px",
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
                onTouchStart={(e) => {
                  if (answering) return;
                  const t = e.touches[0];
                  touchStartX.current = t.clientX;
                  touchStartY.current = t.clientY;
                  touchStartT.current = performance.now();
                  isSwiping.current = false;
                }}
                onTouchMove={(e) => {
                  if (answering) return;
                  const t = e.touches[0];
                  const dx = t.clientX - touchStartX.current;
                  const dy = t.clientY - touchStartY.current;

                  // Start horizontal swipe only if clearly more horizontal than vertical
                  if (!isSwiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    isSwiping.current = true;
                    // prevent page from interpreting as horizontal scroll
                    e.preventDefault();
                  }

                  if (isSwiping.current) {
                    e.preventDefault();
                    const img = imageRef.current;
                    if (img) {
                      // subtle follow
                      gsap.to(img, {
                        x: dx * 0.25,
                        rotationY: gsap.utils.clamp(-8, 8, -dx * 0.08),
                        duration: 0.1,
                        ease: "power2.out",
                      });
                    }
                  }
                }}
                onTouchEnd={(e) => {
                  if (answering) return;
                  const t = e.changedTouches[0];
                  const dx = t.clientX - touchStartX.current;
                  const dy = t.clientY - touchStartY.current;
                  const dt = performance.now() - touchStartT.current;

                  const absDX = Math.abs(dx);
                  const absDY = Math.abs(dy);

                  // velocity-ish + distance threshold
                  const strongHorizontal = absDX > absDY && (absDX > 50 || (absDX > 30 && dt < 250));

                  if (isSwiping.current && strongHorizontal) {
                    // swipe left => next, swipe right => prev
                    if (dx < 0) {
                      animateDressChange(+1);
                    } else {
                      animateDressChange(-1);
                    }
                  } else {
                    // no swipe -> just reset transform
                    resetImageTransform();
                  }

                  isSwiping.current = false;
                }}
              >
                {/* overlay for flashes / vignette */}
                <div ref={overlayRef} className="pointer-events-none absolute inset-0 rounded-xl" style={{ opacity: 0 }} />
                {/* correctness badges */}
                <div ref={badgeRef} className="pointer-events-none absolute top-3 right-3 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur text-xl" style={{ opacity: 0 }}>
                  <span className="select-none">✓</span>
                </div>
                {/* Confetti layer */}
                <div ref={confettiLayerRef} className="pointer-events-none absolute inset-0 z-10" />

                {/* <div
                  ref={titleRef}
                  className="absolute top-0 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-10 px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/85 backdrop-blur-md text-gray-900 font-medium text-center rounded-b-xl shadow-md pointer-events-none text-sm sm:text-sm md:text-base"
                  style={{ transformOrigin: "center center" }}
                >
                  {L(current.name)}
                </div> */}
                <img ref={imageRef} src={current.path} alt={L(current.name)} className="absolute inset-0 w-full h-full object-contain will-change-transform will-change-opacity" />
                {/* <div
                  ref={descRef}
                  className="absolute bottom-0 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-10 px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/85 backdrop-blur-md text-gray-700 text-sm sm:text-sm text-center rounded-t-xl shadow-[0_-2px_6px_-1px_rgba(0,0,0,0.1),0_0px_4px_-2px_rgba(0,0,0,0.1)] pointer-events-none"
                  style={{ transformOrigin: "center center" }}
                >
                  {L(current.description)}
                </div> */}
                {(!hasAlreadyWon && (!quizComplete || !earnedDiscount)) && (
                  <button aria-label="Previous dress" className="arrow button__outline--dark absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 cursor-pointer text-sm sm:text-base disabled:opacity-30" onClick={prevDress} disabled={answering}>
                    ◀
                  </button>
                )}
                {(!hasAlreadyWon && (!quizComplete || !earnedDiscount)) && (
                  <button aria-label="Next dress" className="arrow button__outline--dark absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 cursor-pointer text-sm sm:text-base disabled:opacity-30" onClick={nextDress} disabled={answering}>
                    ▶
                  </button>
                )}
              </div>

              <div className="text-center my-3 z-50 fixed inset-x-0 bottom-0 px-3 pb-[env(safe-area-inset-bottom)] p-4 bg-transparent lg:static lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0lg:sticky lg:bottom-2">
                {!quizComplete && !earnedDiscount && (
                  <button key={`act-${currentQuestion}-dress`} className="text-sm sm:text-sm after:content-['✓'] disabled:opacity-50 disabled:pointer-events-none" onClick={confirmPick} disabled={answering || quizComplete}>
                    {t('confirm')}
                  </button>
                )}
                {shouldAllowRetry && (
                  <button className="text-sm sm:text-sm" onClick={restartGame}>{t('retry')}</button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* MCQ question UI */}
              <div
                ref={mcqCardRef}
                className="w-full border border-gray-200 rounded-xl bg-white shadow-md p-4 sm:p-5"
                style={{ maxWidth: "min(512px, calc(100vh * 512 / 900))", marginLeft: "auto", marginRight: "auto" }}
              >
                <div className="space-y-2">
                  {(currentQ as McqQuestion).choices.map((c, i) => {
                    const selected = mcqSelected.has(i);
                    return (
                      <label key={i} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} transition-colors`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selected}
                          onChange={() => {
                            setMcqSelected(prev => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i);
                              else next.add(i);
                              return next;
                            });
                          }}
                        />
                        <span className="text-sm text-gray-800">{L(c.label)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="text-center my-3 z-50 fixed inset-x-0 bottom-0 px-3 pb-[env(safe-area-inset-bottom)] p-4 bg-transparent lg:static lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0lg:sticky lg:bottom-2">
                {!quizComplete && !earnedDiscount && (
                  <button
                    key={`act-${currentQuestion}-mcq`}
                    className="text-sm px-3 py-1.5 rounded-md border disabled:opacity-50 disabled:pointer-events-none"
                    onClick={confirmPick}
                    disabled={answering || quizComplete}
                  >
                    {t('submit')}
                  </button>
                )}
                {shouldAllowRetry && (
                  <button className="text-sm" onClick={restartGame}>{t('retry')}</button>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {showResults && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="results-title">
          <div className="bg-white rounded-xl p-4 sm:p-6 mx-2 sm:mx-4 max-w-md w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{calculateDiscount(correctlyGuessed.size + mcqCorrect, totalQuestions).percentage ? '🏆' : '❌'}</div>
            <h2 id="results-title" className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">{t('completed')}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              <span
                dangerouslySetInnerHTML={{
                  __html: t('guessedSummary', { a: correctlyGuessed.size + mcqCorrect, b: totalQuestions })
                }}
              />
            </p>
            {(() => {
              const discount = calculateDiscount(correctlyGuessed.size + mcqCorrect, totalQuestions);
              const msgKey = discount.percentage === 50 ? 'discount50'
                : discount.percentage === 25 ? 'discount25'
                  : 'discount0';
              return (
                <div className="mb-4 sm:mb-6">
                  <p className={`text-base sm:text-lg font-semibold ${discount.percentage > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {t(msgKey)}
                  </p>
                  {discount.percentage > 0 && (
                    <p className="text-gray-500 mt-2">
                      {t('showAtDesk')}
                    </p>
                  )}
                </div>
              );
            })()}
            <div className="flex gap-2 sm:gap-3">
              {!earnedDiscount && (
                <button className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={restartGame}>
                  {t('retry')}
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
              }}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && !hasAlreadyWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="instr-title">
          <div className="bg-white p-6 mx-3 rounded-xl max-w-md flex flex-col items-center">
            <h2 id="instr-title" className="text-xl font-bold mb-3 text-center">{t('instrTitle')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('instrContent', { numberOfQuestions: totalQuestions }) }}></p>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg"
            >
              {t('startQuiz')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}