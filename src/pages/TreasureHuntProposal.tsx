import React, { useEffect, useState, useRef } from "react";
import {
  FaCompass,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaPrint,
  FaQuoteLeft,
  FaShareAlt,
  FaTimes,
  FaTrophy,
  FaTv,
  FaUsers,
  FaEnvelope,
  FaCheckCircle,
  FaVideo,
  FaTshirt,
  FaBolt,
  FaEdit,
  FaChartBar,
  FaCrosshairs,
  FaChevronDown,
  FaChevronUp,
  FaLocationArrow
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

interface SquadMember {
  company: string;
  members: string[];
}

const squadDataEn: Record<number, SquadMember[]> = {
  1: [
    { company: "Commercial Bank of Eth.", members: ["Executive A", "Strategist B"] },
    { company: "Ethio Telecom", members: ["Marketing Lead C", "Ops Director D"] },
    { company: "Ethiopian Airlines", members: ["Brand Specialist E", "Captain F"] }
  ],
  2: [
    { company: "Awash Bank", members: ["Finance Director A", "Analyst B"] },
    { company: "Dashen Bank", members: ["Strategy Officer C", "Comms Lead D"] },
    { company: "Heineken Ethiopia", members: ["Corporate PR E", "Event Lead F"] }
  ],
  3: [
    { company: "BGI Ethiopia", members: ["HR Director A", "Talent Specialist B"] },
    { company: "East Africa Bottling", members: ["Commercial Lead C", "PR Manager D"] },
    { company: "Midroc Investment", members: ["Asset Manager E", "Operations Lead F"] }
  ],
  4: [
    { company: "United Bank", members: ["Branch Manager A", "BizDev Lead B"] },
    { company: "Nib Insurance", members: ["Risk Lead C", "Marketing Lead D"] },
    { company: "Zemen Bank", members: ["Innovation Officer E", "Portfolio Lead F"] }
  ],
  5: [
    { company: "Oromia Bank", members: ["Regional Manager A", "Strategy Officer B"] },
    { company: "Cooperative Bank", members: ["Partnership Lead C", "Brand Director D"] },
    { company: "Wegagen Bank", members: ["Digital Officer E", "Team Strategist F"] }
  ]
};

const squadDataAm: Record<number, SquadMember[]> = {
  1: [
    { company: "የኢትዮጵያ ንግድ ባንክ", members: ["ስራ አስፈፃሚ ሀ", "ስትራቴጂስት ለ"] },
    { company: "ኢትዮ ቴሌኮም", members: ["የማርኬቲንግ መሪ ሐ", "የኦፕሬሽን ዳይሬክተር መ"] },
    { company: "የኢትዮጵያ አየር መንገድ", members: ["የብራንድ ባለሙያ ሠ", "ካፒቴን ረ"] }
  ],
  2: [
    { company: "አዋሽ ባንክ", members: ["የፋይናንስ ዳይሬክተር ሀ", "አናሊስት ለ"] },
    { company: "ዳሽን ባንክ", members: ["የስትራቴጂ ኦፊሰር ሐ", "የኮሙኒኬሽን መሪ መ"] },
    { company: "ኃይነከን ኢትዮጵያ", members: ["የኮርፖሬት ፒአር ሠ", "የዝግጅት መሪ ረ"] }
  ],
  3: [
    { company: "ቢጂአይ ኢትዮጵያ", members: ["የኤችአር ዳይሬክተር ሀ", "የችሎታ ባለሙያ ለ"] },
    { company: "ምስራቅ አፍሪካ ቦትሊንግ (ኮካኮላ)", members: ["የንግድ መሪ ሐ", "የፒአር ስራ አስኪያጅ መ"] },
    { company: "ሚድሮክ ኢንቨስትመንት", members: ["የንብረት ስራ አስኪያጅ ሠ", "የኦፕሬሽን መሪ ረ"] }
  ],
  4: [
    { company: "ዩናይትድ ባንክ", members: ["የቅርንጫፍ ስራ አስኪያጅ ሀ", "የቢዝነስ ልማት መሪ ለ"] },
    { company: "ንብ ኢንሹራንስ", members: ["የስጋት መሪ ሐ", "የማርኬቲንግ መሪ መ"] },
    { company: "ዘመን ባንክ", members: ["የፈጠራ ኦፊሰር ሠ", "የፖርትፎሊዮ መሪ ረ"] }
  ],
  5: [
    { company: "ኦሮሚያ ባንክ", members: ["የክልል ስራ አስኪያጅ ሀ", "የስትራቴጂ ኦፊሰር ለ"] },
    { company: "የህብረት ስራ ባንክ (ኮኦፕ)", members: ["የአጋርነት መሪ ሐ", "የብራንድ ዳይሬክተር መ"] },
    { company: "ወጋገን ባንክ", members: ["የዲጂታል ኦፊሰር ሠ", "የቡድን ስትራቴጂስት ረ"] }
  ]
};

const chaptersEn = [
  "Chapter I: The Charter",
  "Chapter II: Quest Philosophy",
  "Chapter III: Executive Mission",
  "Chapter IV: Media Boost Engine",
  "Chapter V: Data-Driven ROI",
  "Chapter VI: Tactical Squad Matrix",
  "Chapter VII: Broadcast Outposts",
  "Chapter VIII: 4 Checkpoints",
  "Chapter IX: X Marks The Spot"
];

const chaptersAm = [
  "ምዕራፍ ፩፦ የዝግጅቱ መነሻ",
  "ምዕራፍ ፪፦ ስትራቴጂካዊ ራዕይ",
  "ምዕራፍ ፫፦ መግቢያ እና 3ቱ አእማዶች",
  "ምዕራፍ ፬፦ የብራንድ ተጋላጭነት ሞተር",
  "ምዕራፍ ፭፦ በምርምር የተደገፈ ጥቅም",
  "ምዕራፍ ፮፦ የቡድኖች አወቃቀር",
  "ምዕራፍ ፯፦ የቴሌቪዥን አጋር ምርጫ",
  "ምዕራፍ ፰፦ 4ቱ የፈተና ማዕከላት",
  "ምዕራፍ ፱፦ የመጨረሻው ሀብት ቦታ"
];

const TreasureHuntProposal: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const isAmharic = language === "am";

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedSquad, setSelectedSquad] = useState<number>(1);
  const [selectedTv, setSelectedTv] = useState<"abbay" | "nahoo">("abbay");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form State
  const [companyName, setCompanyName] = useState<string>("");
  const [participant1, setParticipant1] = useState<string>("");
  const [participant2, setParticipant2] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = isAmharic 
      ? "ትሬዠር ሀንት ኢትዮጵያ — የስትራቴጂክ ኮርፖሬት ተሳትፎ ፕሮፖዛል (የፓርችመንት ካርታ)"
      : "Treasure Hunt Ethiopia ® | Antique Parchment Map Proposal | YENEGE";
  }, [isAmharic]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const slideHeight = window.innerHeight;
      const index = Math.round(container.scrollTop / slideHeight);
      if (index !== currentSlide && index >= 0 && index < 9) {
        setCurrentSlide(index);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentSlide]);

  const scrollToSlide = (index: number) => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: index * window.innerHeight,
        behavior: "smooth"
      });
      setCurrentSlide(index);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName && participant1 && participant2 && phone) {
      setIsSubmitted(true);
    }
  };

  const currentSquadData = isAmharic ? squadDataAm : squadDataEn;
  const chapterList = isAmharic ? chaptersAm : chaptersEn;
  const compassAngle = currentSlide * 40;

  return (
    <div style={{ backgroundColor: "#120a05", color: "#2b1810", width: "100vw", height: "100vh", overflow: "hidden", position: "relative", fontFamily: isAmharic ? "'Noto Sans Ethiopic', 'Cinzel', serif" : "'Cinzel', 'Plus Jakarta Sans', serif" }}>
      {/* Wood Desk & Burnt Parchment Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Noto+Sans+Ethiopic:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap');

        :root {
          --wood-dark: #120a05;
          --wood-mid: #24140b;
          --parchment-bg: #f3e5c8;
          --parchment-dark: #22140c;
          --parchment-border: #4a2d18;
          --ink-espresso: #2e170c;
          --ink-crimson: #800000;
          --gold-wax: #c9933b;
          --gold-glow: rgba(201, 147, 59, 0.4);
        }

        .wood-bg-table {
          background-color: var(--wood-dark);
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(68, 38, 20, 0.4) 0%, rgba(10, 5, 2, 0.9) 100%),
            linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px);
          background-size: 100% 100%, 30px 100%;
        }

        /* Snap Scroll Container */
        .snap-container {
          width: 100vw;
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }

        /* Burnt Edge Parchment Map Tile */
        .parchment-map-tile {
          width: 100vw;
          height: 100vh;
          min-height: 100vh;
          max-height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 80px 70px 40px 340px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Burnt Parchment Card Fragment */
        .map-card-fragment {
          background: radial-gradient(circle at 50% 50%, #f6ebd0 0%, #eadebe 60%, #cca975 100%);
          color: var(--ink-espresso);
          border: 3px solid #5a351a;
          border-radius: 20px 32px 18px 28px;
          box-shadow: 
            inset 0 0 60px rgba(74, 38, 16, 0.7),
            inset 0 0 15px rgba(0, 0, 0, 0.8),
            0 20px 50px rgba(0, 0, 0, 0.9);
          padding: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .map-card-fragment.dark-parchment {
          background: radial-gradient(circle at 50% 50%, #2a190e 0%, #1c1008 70%, #0d0603 100%);
          color: #f3e5c8;
          border-color: #80471c;
          box-shadow: 
            inset 0 0 80px rgba(0, 0, 0, 0.95),
            0 20px 50px rgba(0, 0, 0, 0.95);
        }

        /* Rune Cipher Banner at the top of cards */
        .rune-cipher-banner {
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          letter-spacing: 6px;
          color: rgba(128, 0, 0, 0.6);
          text-transform: uppercase;
          border-bottom: 1px dashed rgba(90, 53, 26, 0.3);
          padding-bottom: 6px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }

        .dark-parchment .rune-cipher-banner {
          color: rgba(201, 147, 59, 0.6);
          border-bottom-color: rgba(201, 147, 59, 0.2);
        }

        /* Wax Seal Stamp Effect */
        .wax-seal-badge {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #b30000 0%, #800000 70%, #4a0000 100%);
          border: 2px solid #d4af37;
          box-shadow: 0 4px 15px rgba(0,0,0,0.6), inset 0 0 8px rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f3e5c8;
          font-size: 1.2rem;
          transform: rotate(-12deg);
        }

        /* Left Side Explorer Journal Manuscript (Matching Image) */
        .manuscript-journal-sidebar {
          position: fixed;
          left: 30px;
          top: 85px;
          bottom: 35px;
          width: 280px;
          z-index: 900;
          background: radial-gradient(circle at 50% 50%, #f7edd4 0%, #e9d9b4 70%, #d2b683 100%);
          border: 2px solid #4a2d18;
          border-radius: 12px 18px 14px 16px;
          box-shadow: inset 0 0 35px rgba(74, 38, 16, 0.5), 0 15px 40px rgba(0,0,0,0.8);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #2e170c;
        }

        .journal-chapter-item {
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          border-bottom: 1px solid rgba(74, 38, 16, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .journal-chapter-item.active, .journal-chapter-item:hover {
          background: rgba(128, 0, 0, 0.12);
          color: #800000;
          transform: translateX(4px);
          font-weight: 800;
        }

        .editorial-h1 {
          font-family: 'Cinzel', 'Noto Sans Ethiopic', serif;
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 12px;
          color: var(--ink-crimson);
        }

        .dark-parchment .editorial-h1 {
          color: #f3e5c8;
        }

        .editorial-h1-lg {
          font-family: 'Cinzel', 'Noto Sans Ethiopic', serif;
          font-size: 3.6rem;
          font-weight: 900;
          line-height: 1.05;
          text-transform: uppercase;
          color: #600000;
        }

        .dark-parchment .editorial-h1-lg {
          color: #f3e5c8;
        }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        /* Mobile: ensure all content is fully visible */
        @media (max-width: 960px) {
          .manuscript-journal-sidebar { display: none !important; }
          .parchment-map-tile { padding: 72px 18px 28px 18px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4 { grid-template-columns: 1fr 1fr !important; }
          .editorial-h1    { font-size: 1.9rem !important; }
          .editorial-h1-lg { font-size: 2.1rem !important; }
          .map-card-fragment { padding: 22px !important; }
          .deck-header-label { display: none !important; }
        }

        @media (max-width: 600px) {
          .grid-4 { grid-template-columns: 1fr !important; }
          .editorial-h1    { font-size: 1.55rem !important; }
          .editorial-h1-lg { font-size: 1.75rem !important; }
          .parchment-map-tile { padding: 68px 12px 20px 12px !important; }
          .map-card-fragment { padding: 16px !important; }
          .rune-cipher-banner { font-size: 0.6rem !important; letter-spacing: 2px !important; }
        }

        .benefit-box {
          background: rgba(74, 38, 16, 0.06);
          border: 1px solid rgba(74, 38, 16, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .dark-parchment .benefit-box {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .stat-card-cream {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(74, 38, 16, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .stat-num-lg {
          font-family: 'Cinzel', serif;
          font-size: 2.8rem;
          font-weight: 900;
          color: #800000;
          line-height: 1;
        }

        .squad-pill {
          background: rgba(74, 38, 16, 0.1);
          color: #2e170c;
          border: 1px solid rgba(74, 38, 16, 0.3);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .squad-pill.active, .squad-pill:hover {
          background: #800000;
          color: #f3e5c8;
          border-color: #800000;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 5, 2, 0.95);
          backdrop-filter: blur(16px);
          z-index: 2000;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-overlay.open { display: flex; }

        .modal-box {
          background: radial-gradient(circle at 50% 50%, #f6ebd0 0%, #eadebe 60%, #cca975 100%);
          border: 3px solid #5a351a;
          border-radius: 18px;
          max-width: 580px;
          width: 100%;
          padding: 32px;
          color: #2e170c;
          position: relative;
          box-shadow: inset 0 0 40px rgba(74, 38, 16, 0.6), 0 20px 60px rgba(0,0,0,0.9);
        }

        .form-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(74, 38, 16, 0.4);
          border-radius: 8px;
          padding: 10px 14px;
          color: #2e170c;
          font-size: 0.9rem;
          outline: none;
          margin-top: 4px;
          margin-bottom: 12px;
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            overflow: visible !important;
            height: auto !important;
            background-color: #120a05 !important;
          }

          .snap-container {
            overflow: visible !important;
            height: auto !important;
            scroll-snap-type: none !important;
          }

          .deck-header, .manuscript-journal-sidebar, .modal-overlay {
            display: none !important;
          }

          .parchment-map-tile {
            width: 100vw !important;
            height: 100vh !important;
            padding: 30px !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Top Banner Bar */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(18, 10, 5, 0.95)", backdropFilter: "blur(12px)", borderBottom: "2px solid #5a351a", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", overflowX: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/images/yenege-inverted-logo.png" alt="YENEGE Logo" style={{ height: "36px", width: "auto" }} />
          <span style={{ fontWeight: 800, color: "#f3e5c8", fontSize: "1.1rem" }}>
            {isAmharic ? "የነገ ኃ/የተ/የግ/ማኅበር" : "YENEGE PLC"}
          </span>
          <span style={{ background: "#800000", color: "#f3e5c8", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1px" }}>
            TREASURE MAP EDITION
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaCompass style={{ color: "#c9933b", fontSize: "1.4rem", transform: `rotate(${compassAngle}deg)`, transition: "transform 0.6s ease" }} />
          <button onClick={toggleLanguage} style={{ background: "rgba(243, 229, 200, 0.1)", border: "1px solid #5a351a", color: "#f3e5c8", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
            {isAmharic ? "English" : "አማርኛ"}
          </button>
          <button onClick={handlePrint} style={{ background: "rgba(243, 229, 200, 0.1)", border: "1px solid #5a351a", color: "#f3e5c8", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaPrint /> {isAmharic ? "አትም / PDF" : "Print PDF"}
          </button>
          <button onClick={() => setIsModalOpen(true)} style={{ background: "linear-gradient(135deg, #800000 0%, #4a0000 100%)", border: "1px solid #d4af37", color: "#f3e5c8", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCheckCircle /> {isAmharic ? "ተሳትፎን ያረጋግጡ" : "Confirm Attendance"}
          </button>
        </div>
      </header>

      {/* Left Explorer Manuscript Journal Log (Matching Uploaded Image) */}
      <aside className="manuscript-journal-sidebar">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #800000", paddingBottom: "8px", marginBottom: "12px" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: "0.95rem", color: "#800000", letterSpacing: "1px" }}>
              {isAmharic ? "የጉዞ ማስታወሻ (QUEST LOG)" : "EXPEDITION JOURNAL"}
            </span>
            <FaCompass style={{ color: "#800000" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {chapterList.map((ch, idx) => (
              <div 
                key={idx} 
                className={`journal-chapter-item ${currentSlide === idx ? "active" : ""}`}
                onClick={() => scrollToSlide(idx)}
              >
                <span>{ch}</span>
                {currentSlide === idx && <FaLocationArrow style={{ fontSize: "0.75rem", color: "#800000" }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px dashed rgba(74, 38, 16, 0.4)", paddingTop: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#5a351a", fontWeight: 800 }}>COORD: 9°01'N 38°44'E</div>
          <div style={{ fontSize: "0.68rem", color: "#800000", fontWeight: 700 }}>ADDIS ABABA · ETHIOPIA</div>
        </div>
      </aside>

      {/* Main Snap Container for Parchment Map Tiles */}
      <main className="snap-container wood-bg-table" ref={containerRef}>

        {/* ================= MAP TILE 1: THE CHARTER ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment dark-parchment">
            <div className="rune-cipher-banner">
              <span>፭ ፮ ፯ ፰ ፱ ፲ · EXPEDITION CHARTER</span>
              <span>MAP TILE 01 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <img src="/images/yenege-inverted-logo.png" alt="Yenege Logo" style={{ height: "55px", width: "auto" }} />
                  <div style={{ fontSize: "0.8rem", color: "#c9933b", fontWeight: 800, letterSpacing: "2px", marginTop: "4px" }}>YENEGE PLC</div>
                </div>
                <div className="wax-seal-badge">
                  <FaTrophy />
                </div>
              </div>

              <h1 className="editorial-h1-lg">
                {isAmharic ? <>ትሬዠር ሀንት<br /><span style={{ color: "#c9933b" }}>ኢትዮጵያ ®</span></> : <>TREASURE HUNT<br /><span style={{ color: "#c9933b" }}>ETHIOPIA ®</span></>}
              </h1>

              <p style={{ fontSize: "1.2rem", color: "#e9d9b4", maxWidth: "680px", marginTop: "12px", lineHeight: 1.5 }}>
                {isAmharic 
                  ? "የኮርፖሬት ቡድኖች የሚፎካከሩበት የአንድ ቀን ስትራቴጂክ አድቬንቸርና የቡድን ግንባታ ውድድር" 
                  : "1-Day Strategic Adventure & Team-Building Championship for Executive Corporate Teams."}
              </p>

              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", marginTop: "28px", borderTop: "1px dashed rgba(201, 147, 59, 0.4)", paddingTop: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#c9933b", fontWeight: 800 }}>ORGANIZER</div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Yenege PLC</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#c9933b", fontWeight: 800 }}>DATE</div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{isAmharic ? "እሁድ፣ ነሐሴ 24 ቀን 2018 ዓ.ም." : "Sunday, August 30, 2026"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#c9933b", fontWeight: 800 }}>DESTINATION</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#c9933b" }}>Addis Ababa, Ethiopia</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8a6d4d", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
              <span>YENEGE EXPERIENCE ARCHITECTURE</span>
              <span>CHAPTER I</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 2: PHILOSOPHY ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፠ ፟ ፝ ፞ ፟ ፠ · QUEST PHILOSOPHY</span>
              <span>MAP TILE 02 / 09</span>
            </div>

            <div style={{ margin: "auto 0", textAlign: "center" }}>
              <FaQuoteLeft style={{ fontSize: "2.5rem", color: "#800000", marginBottom: "16px" }} />
              <h2 className="editorial-h1" style={{ fontSize: "2.4rem", maxWidth: "820px", margin: "0 auto", lineHeight: 1.3 }}>
                {isAmharic 
                  ? "«ስትራቴጂክ አስተሳሰብ፣ ፈጣን ውሳኔ አሰጣጥ፣ እና የተጠናከረ የቡድን ስራ—ለኮርፖሬት የበላይነት።»" 
                  : "«Strategic Thinking, Rapid Decision-Making, and High-Impact Team Synergy—the Ultimate Pillars of Corporate Market Dominance.»"}
              </h2>
              <div style={{ width: "80px", height: "3px", background: "#800000", margin: "24px auto 0" }}></div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>LEADERSHIP MANIFESTO</span>
              <span>CHAPTER II</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 3: EXECUTIVE MISSION ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፪ ፫ ፬ ፭ · EXECUTIVE MISSION</span>
              <span>MAP TILE 03 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "መግቢያ እና ስለ ዝግጅቱ" : "Event Overview & 3 Strategic Pillars"}
              </h2>
              <p style={{ fontSize: "1.05rem", color: "#2e170c", lineHeight: 1.5, marginBottom: "24px" }}>
                {isAmharic 
                  ? "የነገ ኃ/የተ/የግ/ማኅበር (Yenege PLC) ተቋማት ለሠራተኞቻቸው ልዩ የሆነ፣ ከወትሮው የስራ ከባቢ የተለየ ተሞክሮ የሚያገኙበትን «ትሬዠር ሀንት ኢትዮጵያ» ኮርፖሬት እትም በማዘጋጀት ላይ ይገኛል።" 
                  : "Yenege PLC is proud to announce the Corporate Edition of \"Treasure Hunt Ethiopia ®\", offering team members an extraordinary experience."}
              </p>

              <div className="grid-3">
                <div style={{ borderTop: "2px solid #800000", paddingTop: "10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#800000" }}>{isAmharic ? "ሀ. የቡድን ትስስር" : "A. Team Synergy"}</div>
                  <div style={{ fontSize: "0.82rem", color: "#4a2d18" }}>{isAmharic ? "ፍንጮችን በመፍታትና አካላዊ/አዕምሮአዊ ፈተናዎችን በማለፍ የተደበቁ ሀብቶችን ይፈልጋሉ።" : "Employees solve complex clues and navigate physical/mental challenges."}</div>
                </div>
                <div style={{ borderTop: "2px solid #800000", paddingTop: "10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#800000" }}>{isAmharic ? "ለ. የብራንድ ተጋላጭነት" : "B. TV Brand Exposure"}</div>
                  <div style={{ fontSize: "0.82rem", color: "#4a2d18" }}>{isAmharic ? "በብሔራዊ ቴሌቪዥንና በሺዎች ለሚቆጠሩ ተመልካቾች ፊት በክብርና በጎላ ሁኔታ ይታወቃሉ።" : "Your firm is showcased with premium coverage on national TV."}</div>
                </div>
                <div style={{ borderTop: "2px solid #800000", paddingTop: "10px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#800000" }}>{isAmharic ? "ሐ. የንግድ ትውውቅ" : "C. Executive Network"}</div>
                  <div style={{ fontSize: "0.82rem", color: "#4a2d18" }}>{isAmharic ? "ከተለያዩ መሪ ድርጅቶች ከተወጣጡ ተሳታፊዎች ጋር የላቀ የንግድ ትስስር ይፈጥራሉ።" : "Representatives collaborate directly with leaders from top-tier organizations."}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>THREE STRATEGIC PILLARS</span>
              <span>CHAPTER III</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 4: MEDIA ENGINE ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment dark-parchment">
            <div className="rune-cipher-banner">
              <span>፮ ፯ ፰ ፱ · MEDIA BOOST ENGINE</span>
              <span>MAP TILE 04 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "ድርጅትዎ የሚያገኘው የብራንድ ጥቅም" : "4-Tier Corporate Media Visibility"}
              </h2>

              <div className="grid-4" style={{ marginTop: "18px" }}>
                <div className="benefit-box">
                  <FaTv style={{ color: "#c9933b", fontSize: "1.4rem", marginBottom: "8px" }} />
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3e5c8" }}>{isAmharic ? "የብሔራዊ TV ስርጭት" : "National TV Broadcast"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bfa382", marginTop: "4px" }}>{isAmharic ? "በአባይ ቴሌቪዥን ወይም ናሁ ቴሌቪዥን ሙሉ የዝግጅቱ ሽፋን ይተላለፋል።" : "Coverage broadcasted in high definition on Abbay TV or Nahoo TV."}</div>
                </div>

                <div className="benefit-box">
                  <FaShareAlt style={{ color: "#c9933b", fontSize: "1.4rem", marginBottom: "8px" }} />
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3e5c8" }}>{isAmharic ? "የሶሻል ሚዲያ Boost" : "Social Media Boosts"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bfa382", marginTop: "4px" }}>{isAmharic ? "የድርጅትዎ አርማ በየነገ PLC ማህበራዊ ሚዲያዎች በክፍያ ይተዋወቃል።" : "Targeted digital campaigns across Yenege PLC social channels."}</div>
                </div>

                <div className="benefit-box">
                  <FaVideo style={{ color: "#c9933b", fontSize: "1.4rem", marginBottom: "8px" }} />
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3e5c8" }}>{isAmharic ? "Co-Branded ቪዲዮዎች" : "Co-Branded Video Reels"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bfa382", marginTop: "4px" }}>{isAmharic ? "ለሰራተኞችና ለደንበኞች የሚያጋራው ሙያዊ ቪዲዮና HD ፎቶዎች ይሰጠዋል።" : "High-resolution video reels and photo packages provided."}</div>
                </div>

                <div className="benefit-box">
                  <FaTshirt style={{ color: "#c9933b", fontSize: "1.4rem", marginBottom: "8px" }} />
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3e5c8" }}>{isAmharic ? "የማልያ & ባነር አርማ" : "Jersey & Stage Logos"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#bfa382", marginTop: "4px" }}>{isAmharic ? "የድርጅትዎ አርማ በስፖርት ማልያዎችና በፈተና ማዕከላት ባነሮች ይደምቃል።" : "Prominent brand placement on player jerseys and banners."}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8a6d4d", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
              <span>BRAND VISIBILITY ENGINE</span>
              <span>CHAPTER IV</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 5: ROI EVIDENCE ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፲ ፲፩ ፲፪ · DATA-DRIVEN ROI EVIDENCE</span>
              <span>MAP TILE 05 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "ለምን ስፖንሰርሺፕና አድቬንቸር ይሰራል?" : "Data-Driven Sponsorship ROI"}
              </h2>

              <div className="grid-4" style={{ marginTop: "18px" }}>
                <div className="stat-card-cream">
                  <div className="stat-num-lg">84%</div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#800000" }}>{isAmharic ? "የስራ ተነሳሽነት" : "Engagement Surge"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#4a2d18", marginTop: "4px" }}>{isAmharic ? "የሰራተኞች ታማኝነት በ84% ይጨምራል (Harvard Business Review)።" : "Surge in employee performance and brand loyalty."}</div>
                </div>

                <div className="stat-card-cream">
                  <div className="stat-num-lg">3.4x</div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#800000" }}>{isAmharic ? "የብራንድ ማስታወስ" : "Brand Recall"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#4a2d18", marginTop: "4px" }}>{isAmharic ? "በቲቪና ዲጂታል በሚታይ ውድድር ላይ የሚሳተፉ ብራንዶች 3.4x ይስታወሳሉ።" : "3.4x higher brand recall compared to standard ads."}</div>
                </div>

                <div className="stat-card-cream">
                  <div className="stat-num-lg">250K+</div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#800000" }}>{isAmharic ? "የTV & ዲጂታል እይታዎች" : "Broadcast Reach"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#4a2d18", marginTop: "4px" }}>{isAmharic ? "ከ250,000 በላይ ተመልካቾች ዘንድ ይደርሳል።" : "Guaranteed exposure to over 250,000 viewers nationwide."}</div>
                </div>

                <div className="stat-card-cream">
                  <div className="stat-num-lg">78%</div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#800000" }}>{isAmharic ? "የB2B ንግድ እምነት" : "B2B Trust Rate"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#4a2d18", marginTop: "4px" }}>{isAmharic ? "78% የድርጅት መሪዎች ለባህላቸው ቦታ የሚሰጡ ተቋማትን ያምናሉ።" : "Executives express higher confidence in team-first firms."}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>RESEARCH & ROI PROOF</span>
              <span>CHAPTER V</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 6: SQUAD MATRIX ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፲፫ ፲፬ ፲፭ · SQUAD MATRIX</span>
              <span>MAP TILE 06 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "15 ድርጅቶች | 5 የተቀላቀሉ ቡድኖች" : "15 Corporate Leaders | 5 Combined Squads"}
              </h2>

              <div style={{ background: "rgba(74, 38, 16, 0.08)", border: "1px dashed #800000", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button 
                      key={num} 
                      className={`squad-pill ${selectedSquad === num ? 'active' : ''}`} 
                      onClick={() => setSelectedSquad(num)}
                    >
                      {isAmharic ? `ቡድን ${num}` : `Squad ${num}`} ({num === 1 ? "Alpha" : num === 2 ? "Bravo" : num === 3 ? "Charlie" : num === 4 ? "Delta" : "Echo"})
                    </button>
                  ))}
                </div>

                <div className="grid-3">
                  {currentSquadData[selectedSquad].map((item, idx) => (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74, 38, 16, 0.3)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#800000", marginBottom: "4px" }}>{item.company}</div>
                      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        {item.members.map((m, mIdx) => (
                          <span key={mIdx} style={{ background: "rgba(128,0,0,0.1)", padding: "2px 6px", borderRadius: "6px", fontSize: "0.72rem", color: "#2e170c" }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>SQUAD DYNAMICS MATRIX</span>
              <span>CHAPTER VI</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 7: BROADCAST OPTIONS ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፲፮ ፲፯ ፲፰ · BROADCAST PACKAGES</span>
              <span>MAP TILE 07 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "የቴሌቪዥን አጋር ምርጫ እና የተሳትፎ ክፍያ" : "Television Broadcast Packages"}
              </h2>

              <div className="grid-2" style={{ marginTop: "14px" }}>
                <div 
                  style={{ 
                    background: selectedTv === 'abbay' ? 'rgba(128,0,0,0.12)' : 'rgba(255,255,255,0.4)', 
                    border: selectedTv === 'abbay' ? '2px solid #800000' : '1px solid rgba(74, 38, 16, 0.3)', 
                    borderRadius: "12px", 
                    padding: "18px", 
                    cursor: "pointer" 
                  }} 
                  onClick={() => setSelectedTv('abbay')}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#800000", letterSpacing: "1px" }}>OPTION A</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2e170c", margin: "2px 0" }}>
                    {isAmharic ? "አባይ ቴሌቪዥን (Abbay TV)" : "Abbay TV Broadcast"}
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#800000", fontFamily: "'Cinzel', serif" }}>ETB 25,000</div>
                  <ul style={{ listStyle: "none", fontSize: "0.82rem", color: "#4a2d18", lineHeight: "1.6", marginTop: "8px" }}>
                    <li>✓ {isAmharic ? "በአባይ ቴሌቪዥን የስርጭት ሽፋን" : "Abbay TV Coverage"}</li>
                    <li>✓ {isAmharic ? "የሶሻል ሚዲያ Boosted Posts" : "Social Media Boosted Campaigns"}</li>
                    <li>✓ {isAmharic ? "ኦፊሴላዊ የቡድን ማልያ እና መለያ" : "Official Custom Jerseys & Badges"}</li>
                  </ul>
                </div>

                <div 
                  style={{ 
                    background: selectedTv === 'nahoo' ? 'rgba(128,0,0,0.12)' : 'rgba(255,255,255,0.4)', 
                    border: selectedTv === 'nahoo' ? '2px solid #800000' : '1px solid rgba(74, 38, 16, 0.3)', 
                    borderRadius: "12px", 
                    padding: "18px", 
                    cursor: "pointer" 
                  }} 
                  onClick={() => setSelectedTv('nahoo')}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#800000", letterSpacing: "1px" }}>OPTION B</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2e170c", margin: "2px 0" }}>
                    {isAmharic ? "ናሁ ቴሌቪዥን (Nahoo TV)" : "Nahoo TV Broadcast"}
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#800000", fontFamily: "'Cinzel', serif" }}>ETB 20,000</div>
                  <ul style={{ listStyle: "none", fontSize: "0.82rem", color: "#4a2d18", lineHeight: "1.6", marginTop: "8px" }}>
                    <li>✓ {isAmharic ? "በናሁ ቴሌቪዥን የስርጭት ሽፋን" : "Nahoo TV Coverage"}</li>
                    <li>✓ {isAmharic ? "የሶሻል ሚዲያ Boosted Posts" : "Social Media Boosted Campaigns"}</li>
                    <li>✓ {isAmharic ? "ኦፊሴላዊ የቡድን ማልያ እና መለያ" : "Official Custom Jerseys & Badges"}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>BROADCAST PACKAGES</span>
              <span>CHAPTER VII</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 8: 4 CHECKPOINTS ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment">
            <div className="rune-cipher-banner">
              <span>፲፱ ፳ ፳፩ · THE 4 CHECKPOINTS</span>
              <span>MAP TILE 08 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <h2 className="editorial-h1">
                {isAmharic ? "4ቱ የፈተና ማዕከላት (CHECKPOINTS)" : "The 4 Strategic Checkpoints"}
              </h2>

              <div className="grid-2" style={{ marginTop: "14px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74, 38, 16, 0.3)", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "#800000" }}>CHECKPOINT 1</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#2e170c" }}>{isAmharic ? "የመነሻ ነጥብ & ፍንጭ 1" : "Cipher Decryption & Strategy"}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74, 38, 16, 0.3)", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "#800000" }}>CHECKPOINT 2</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#2e170c" }}>{isAmharic ? "አካላዊና አዕምሮአዊ ፈተና" : "Physical & Mental Agility Test"}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74, 38, 16, 0.3)", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "#800000" }}>CHECKPOINT 3</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#2e170c" }}>{isAmharic ? "የብራንድ እና ታሪክ ፍንጭ" : "Brand Heritage Clue Hunt"}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74, 38, 16, 0.3)", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "#800000" }}>CHECKPOINT 4</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#2e170c" }}>{isAmharic ? "የሀብቱ መገኛ & ሻምፒዮና" : "Treasure Vault & Trophy Award"}</div>
                  </div>
                </div>

                <div style={{ borderRadius: "12px", overflow: "hidden", position: "relative", height: "230px", border: "2px solid #5a351a" }}>
                  <img src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&auto=format&fit=crop" alt="Trophy Victory" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(34,20,12,0.95), transparent)", padding: "12px" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f3e5c8", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaTrophy style={{ color: "#c9933b" }} /> {isAmharic ? "የሻምፒዮና ዋንጫና ሽልማት" : "Championship Trophy"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#5a351a", borderTop: "1px solid rgba(74, 38, 16, 0.2)", paddingTop: "8px" }}>
              <span>QUEST ROUTE</span>
              <span>CHAPTER VIII</span>
            </div>
          </div>
        </section>

        {/* ================= MAP TILE 9: X MARKS THE SPOT ================= */}
        <section className="parchment-map-tile">
          <div className="map-card-fragment dark-parchment">
            <div className="rune-cipher-banner">
              <span>፳፪ ፳፫ ፳፬ · X MARKS THE SPOT</span>
              <span>MAP TILE 09 / 09</span>
            </div>

            <div style={{ margin: "auto 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#c9933b", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "2px" }}>
                <FaCrosshairs /> WAYPOINT 09 · TREASURE VAULT
              </div>
              <h2 className="editorial-h1" style={{ fontSize: "3rem" }}>
                {isAmharic ? "ተሳትፎዎን አሁኑኑ ያረጋግጡ" : "Secure Your Corporate Spot"}
              </h2>
              <p style={{ fontSize: "1.05rem", color: "#e9d9b4", maxWidth: "720px", lineHeight: 1.5, marginBottom: "24px" }}>
                {isAmharic 
                  ? "ድርጅትዎ እሁድ፣ ነሐሴ 24 ቀን 2018 ዓ.ም. በሚካሄደው «ትሬዠር ሀንት ኢትዮጵያ» ኮርፖሬት እትም ላይ በንቁ ተሳታፊነት እንዲቀላቀል በአክብሮት እንጋብዛለን።" 
                  : "We cordially invite your firm to join the Corporate Edition of \"Treasure Hunt Ethiopia ®\" on Sunday, August 30, 2026."}
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button onClick={() => setIsModalOpen(true)} style={{ background: "linear-gradient(135deg, #800000 0%, #4a0000 100%)", border: "1px solid #c9933b", color: "#f3e5c8", padding: "12px 28px", borderRadius: "8px", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaEdit /> {isAmharic ? "ምዝገባውን ያጠናቅቁ" : "Complete Registration"}
                </button>
                <a href="tel:0978639887" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#f3e5c8", padding: "12px 28px", borderRadius: "8px", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <FaPhoneAlt /> {isAmharic ? "0978639887 ይደውሉ" : "Call +251 978 639 887"}
                </a>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8a6d4d", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
              <span>YENEGE PLC · OFFICIAL INVITATION</span>
              <span>CHAPTER IX</span>
            </div>
          </div>
        </section>

      </main>

      {/* Registration Modal Drawer */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-box">
          <button onClick={() => setIsModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#2e170c", cursor: "pointer", fontSize: "1.1rem" }}>
            <FaTimes />
          </button>

          {!isSubmitted ? (
            <>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: "0.8rem", color: "#800000", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
                OFFICIAL REGISTRATION DRAFT
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#800000", marginBottom: "14px" }}>
                {isAmharic ? "«ትሬዠር ሀንት ኢትዮጵያ» ምዝገባ" : "Treasure Hunt Ethiopia ®"}
              </h3>

              <form onSubmit={handleRegistrationSubmit}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e170c" }}>
                    {isAmharic ? "የድርጅት ስም (Company Name)" : "Company / Organization Name"}
                  </label>
                  <input 
                    type="text" 
                    className="form-field" 
                    placeholder={isAmharic ? "ምሳሌ፦ አዋሽ ባንክ" : "e.g. Awash Bank"} 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required 
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e170c" }}>
                    {isAmharic ? "የተመረጠ የቴሌቪዥን አጋር (TV Partner)" : "Selected Broadcast Package"}
                  </label>
                  <select 
                    className="form-field"
                    value={selectedTv}
                    onChange={(e) => setSelectedTv(e.target.value as "abbay" | "nahoo")}
                  >
                    <option value="abbay">
                      {isAmharic ? "አባይ ቴሌቪዥን (Abbay TV) — ETB 25,000" : "Abbay TV Broadcast — ETB 25,000"}
                    </option>
                    <option value="nahoo">
                      {isAmharic ? "ናሁ ቴሌቪዥን (Nahoo TV) — ETB 20,000" : "Nahoo TV Broadcast — ETB 20,000"}
                    </option>
                  </select>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e170c" }}>
                      {isAmharic ? "ተሳታፊ 1" : "Executive Participant 1"}
                    </label>
                    <input 
                      type="text" 
                      className="form-field" 
                      placeholder={isAmharic ? "ስምና የአባት ስም" : "Full Name"} 
                      value={participant1}
                      onChange={(e) => setParticipant1(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e170c" }}>
                      {isAmharic ? "ተሳታፊ 2" : "Executive Participant 2"}
                    </label>
                    <input 
                      type="text" 
                      className="form-field" 
                      placeholder={isAmharic ? "ስምና የአባት ስም" : "Full Name"} 
                      value={participant2}
                      onChange={(e) => setParticipant2(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e170c" }}>
                    {isAmharic ? "ተወካይ ስልክ ቁጥር" : "Representative Phone Number"}
                  </label>
                  <input 
                    type="tel" 
                    className="form-field" 
                    placeholder={isAmharic ? "09..." : "+251 9..."} 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #800000 0%, #4a0000 100%)", border: "1px solid #d4af37", color: "#f3e5c8", padding: "12px", borderRadius: "8px", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                  <FaPaperPlane /> {isAmharic ? "ምዝገባውን አረጋግጥ & Pass ውሰድ" : "Confirm Registration & Get Pass"}
                </button>
              </form>
            </>
          ) : (
            <div id="confirmPass" style={{ textAlign: "center", padding: "16px 0" }}>
              <FaCheckCircle style={{ width: "48px", height: "48px", color: "#800000", marginBottom: "10px" }} />
              <h4 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#800000" }}>
                {isAmharic ? "ምዝገባዎ በስኬት ተጠናቋል!" : "Registration Successfully Completed!"}
              </h4>
              <div id="confirmDetails" style={{ fontSize: "0.9rem", color: "#2e170c", margin: "12px 0", textAlign: "left", background: "rgba(255,255,255,0.7)", padding: "14px", borderRadius: "10px", lineHeight: 1.5, border: "1px solid rgba(74,38,16,0.3)" }}>
                <strong>{isAmharic ? "ድርጅት፦" : "Company:"}</strong> {companyName}<br />
                <strong>{isAmharic ? "የተመረጠ የቲቪ አጋር፦" : "TV Partner:"}</strong> {selectedTv === "abbay" ? (isAmharic ? "አባይ ቴሌቪዥን (Abbay TV) — ETB 25,000" : "Abbay TV Broadcast (ETB 25,000)") : (isAmharic ? "ናሁ ቴሌቪዥን (Nahoo TV) — ETB 20,000" : "Nahoo TV Broadcast (ETB 20,000)")}<br />
                <strong>{isAmharic ? "ተሳታፊዎች፦" : "Executives:"}</strong> {participant1} {isAmharic ? "እና" : "&"} {participant2}<br />
                <strong>{isAmharic ? "ስልክ ቁጥር፦" : "Phone:"}</strong> {phone}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handlePrint} style={{ background: "rgba(74, 38, 16, 0.1)", border: "1px solid #5a351a", color: "#2e170c", padding: "10px 20px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaPrint /> {isAmharic ? "ማረጋገጫውን አትም" : "Print Confirmation"}
                </button>
                <button onClick={() => { setIsModalOpen(false); setIsSubmitted(false); }} style={{ background: "#800000", border: "none", color: "#f3e5c8", padding: "10px 20px", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>
                  {isAmharic ? "ዝጋ" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreasureHuntProposal;