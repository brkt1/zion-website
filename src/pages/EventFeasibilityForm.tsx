import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { BRAND, GRADIENT } from "../styles/theme";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface FormData {
  eventType: string;
  proposedDate: string;
  primaryObjective: string;
  attendeeMin: string;
  attendeeMax: string;
  totalBudget: string;
  financialModel: string;
  budgetFlexibility: string;
  venueStatus: string;
  technicalPriorities: [string, string, string];
  eventDuration: string;
  setupWindow: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "5px 16px",
      borderRadius: "999px",
      background: "rgba(255,212,71,0.1)",
      border: "1px solid rgba(255,212,71,0.25)",
      marginBottom: "28px",
    }}
  >
    <span
      style={{
        background: GRADIENT.brand,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {children}
    </span>
  </div>
);

const FieldLabel = ({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) => (
  <label
    style={{
      display: "block",
      marginBottom: "10px",
      fontFamily: "'Manrope', sans-serif",
    }}
  >
    <span
      style={{
        fontSize: "10px",
        fontWeight: 900,
        color: BRAND.gold,
        letterSpacing: "0.15em",
        marginRight: "10px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {String(number).padStart(2, "0")}
    </span>
    <span
      style={{
        fontSize: "13px",
        fontWeight: 700,
        color: BRAND.navy,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  </label>
);

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "14px",
  border: "1.5px solid rgba(15,23,42,0.10)",
  background: "#FFFFFF",
  fontFamily: "'Manrope', sans-serif",
  fontSize: "14px",
  fontWeight: 500,
  color: BRAND.navy,
  outline: "none",
  transition: "border-color 0.25s, box-shadow 0.25s",
  boxSizing: "border-box",
  appearance: "none",
  WebkitAppearance: "none",
};

const selectWrap: React.CSSProperties = {
  position: "relative",
};

const selectArrow: React.CSSProperties = {
  position: "absolute",
  right: "18px",
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  color: BRAND.gray400,
};

/* ─────────────────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────────────────── */
function useFocusStyle(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = () => {
      (el as HTMLElement).style.borderColor = BRAND.navy;
      (el as HTMLElement).style.boxShadow = `0 0 0 4px rgba(15,23,42,0.06)`;
    };
    const onBlur = () => {
      (el as HTMLElement).style.borderColor = "rgba(15,23,42,0.10)";
      (el as HTMLElement).style.boxShadow = "none";
    };
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, [ref]);
}

/* Interactive field wrapper that adds focus ring without hooks-in-loop */
const Field = ({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) => (
  <div style={{ marginBottom: "32px" }}>
    {children}
    {hint && (
      <p
        style={{
          marginTop: "7px",
          fontSize: "12px",
          color: BRAND.gray400,
          fontFamily: "'Manrope', sans-serif",
          lineHeight: 1.5,
        }}
      >
        {hint}
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Step-Card for Profitability section
───────────────────────────────────────────────────────────── */
const StepCard = ({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "24px",
      padding: "32px",
      border: "1px solid rgba(15,23,42,0.06)",
      boxShadow: "0 8px 32px rgba(15,23,42,0.04)",
      flex: "1 1 260px",
      minWidth: "220px",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: BRAND.navy,
        color: BRAND.gold,
        fontSize: "13px",
        fontWeight: 900,
        fontFamily: "'Manrope', sans-serif",
        marginBottom: "16px",
      }}
    >
      {step}
    </div>
    <h4
      style={{
        fontSize: "15px",
        fontWeight: 800,
        color: BRAND.navy,
        marginBottom: "10px",
        fontFamily: "'Manrope', sans-serif",
        lineHeight: 1.3,
      }}
    >
      {title}
    </h4>
    <p
      style={{
        fontSize: "13px",
        color: BRAND.gray600,
        lineHeight: 1.7,
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {body}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────── */
const EventFeasibilityForm = () => {
  const [form, setForm] = useState<FormData>({
    eventType: "",
    proposedDate: "",
    primaryObjective: "",
    attendeeMin: "",
    attendeeMax: "",
    totalBudget: "",
    financialModel: "",
    budgetFlexibility: "",
    venueStatus: "",
    technicalPriorities: ["", "", ""],
    eventDuration: "",
    setupWindow: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "technicalPriorities", string>>>({});

  // Refs for focus styling
  const eventTypeRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const setupRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useFocusStyle(eventTypeRef as React.RefObject<HTMLElement>);
  useFocusStyle(dateRef as React.RefObject<HTMLElement>);
  useFocusStyle(objectiveRef as React.RefObject<HTMLElement>);
  useFocusStyle(budgetRef as React.RefObject<HTMLElement>);
  useFocusStyle(durationRef as React.RefObject<HTMLElement>);
  useFocusStyle(setupRef as React.RefObject<HTMLElement>);
  useFocusStyle(nameRef as React.RefObject<HTMLElement>);
  useFocusStyle(emailRef as React.RefObject<HTMLElement>);
  useFocusStyle(phoneRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    document.title = "Event Feasibility Form | YENEGE";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Submit your event brief for a professional feasibility and ROI assessment. A strategy consultant will review and contact you within 48 hours."
      );
    }
  }, []);

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setPriority = (index: 0 | 1 | 2, value: string) => {
    setForm((prev) => {
      const next = [...prev.technicalPriorities] as [string, string, string];
      next[index] = value;
      return { ...prev, technicalPriorities: next };
    });
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.eventType) newErrors.eventType = "Please select an event type.";
    if (!form.proposedDate) newErrors.proposedDate = "Please pick a date.";
    if (!form.primaryObjective.trim()) newErrors.primaryObjective = "Please state your primary objective.";
    if (!form.attendeeMin || !form.attendeeMax) newErrors.attendeeMin = "Both min and max attendee counts are required.";
    if (!form.totalBudget.trim()) newErrors.totalBudget = "Please enter your total investment.";
    if (!form.financialModel) newErrors.financialModel = "Please choose a financial model.";
    if (!form.budgetFlexibility) newErrors.budgetFlexibility = "Please indicate budget flexibility.";
    if (!form.venueStatus) newErrors.venueStatus = "Please select your venue status.";
    if (form.technicalPriorities.some((p) => !p.trim())) newErrors.technicalPriorities = "Please fill all three priorities.";
    if (!form.eventDuration.trim()) newErrors.eventDuration = "Please enter event duration.";
    if (!form.setupWindow.trim()) newErrors.setupWindow = "Please enter setup window.";
    if (!form.contactName.trim()) newErrors.contactName = "Name is required.";
    if (!form.contactEmail.trim()) newErrors.contactEmail = "Email is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitStatus("submitting");

    let waUrl = `https://wa.me/251978639887`;

    try {
      // Save to database
      await api.submitFeasibilityBrief({
        event_type: form.eventType,
        proposed_date: form.proposedDate,
        primary_objective: form.primaryObjective,
        attendee_min: parseInt(form.attendeeMin),
        attendee_max: parseInt(form.attendeeMax),
        total_budget: form.totalBudget,
        financial_model: form.financialModel,
        budget_flexibility: form.budgetFlexibility,
        venue_status: form.venueStatus,
        technical_priorities: form.technicalPriorities,
        event_duration: form.eventDuration,
        setup_window: form.setupWindow,
        contact_name: form.contactName,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone || undefined,
      });

      // Build WhatsApp message
    const msg = [
      `*EVENT FEASIBILITY BRIEF — YENEGE*`,
      ``,
      `*Section 1: Core Scope*`,
      `• Event Type: ${form.eventType}`,
      `• Date: ${form.proposedDate}`,
      `• Primary Objective: ${form.primaryObjective}`,
      `• Attendee Count: ${form.attendeeMin}–${form.attendeeMax} guests`,
      ``,
      `*Section 2: Financial Infrastructure*`,
      `• Total Investment: ${form.totalBudget}`,
      `• Financial Model: ${form.financialModel}`,
      `• Budget Flexibility: ${form.budgetFlexibility}`,
      ``,
      `*Section 3: Logistics & Production*`,
      `• Venue Status: ${form.venueStatus}`,
      `• Technical Priority 1: ${form.technicalPriorities[0]}`,
      `• Technical Priority 2: ${form.technicalPriorities[1]}`,
      `• Technical Priority 3: ${form.technicalPriorities[2]}`,
      `• Event Duration: ${form.eventDuration}`,
      `• Setup Window: ${form.setupWindow}`,
      ``,
      `*Contact*`,
      `• Name: ${form.contactName}`,
      `• Email: ${form.contactEmail}`,
      `• Phone: ${form.contactPhone || "Not provided"}`,
    ].join("\n");

      const encoded = encodeURIComponent(msg);
      waUrl = `https://wa.me/251978639887?text=${encoded}`;

      await new Promise((r) => setTimeout(r, 800));
      setSubmitStatus("success");
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error submitting brief:", err);
      // Fallback to WhatsApp even if DB save fails, but notify user or log it
      setSubmitStatus("success"); 
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  const errorMsg = (field: keyof FormData | "technicalPriorities") =>
    errors[field] ? (
      <p
        style={{
          marginTop: "6px",
          fontSize: "12px",
          color: BRAND.coral,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600,
        }}
      >
        {errors[field]}
      </p>
    ) : null;

  const radioOption = (
    field: keyof FormData,
    value: string,
    label: string
  ) => {
    const checked = form[field] === value;
    return (
      <label
        key={value}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "14px 18px",
          borderRadius: "14px",
          border: `1.5px solid ${checked ? BRAND.navy : "rgba(15,23,42,0.10)"}`,
          background: checked ? "rgba(15,23,42,0.03)" : "#fff",
          cursor: "pointer",
          transition: "all 0.2s",
          marginBottom: "10px",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            border: `2px solid ${checked ? BRAND.navy : "rgba(15,23,42,0.2)"}`,
            background: checked ? BRAND.navy : "transparent",
            flexShrink: 0,
            marginTop: "1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          {checked && (
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: BRAND.gold,
              }}
            />
          )}
        </div>
        <input
          type="radio"
          name={field}
          value={value}
          checked={checked}
          onChange={() => set(field, value)}
          style={{ display: "none" }}
        />
        <span
          style={{
            fontSize: "13.5px",
            fontWeight: checked ? 700 : 500,
            color: checked ? BRAND.navy : BRAND.gray600,
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
      </label>
    );
  };

  if (submitStatus === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BRAND.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');
        `}</style>
        <div
          style={{
            textAlign: "center",
            maxWidth: "540px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: BRAND.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BRAND.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 6vw, 52px)",
              fontWeight: 900,
              color: BRAND.navy,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Brief Submitted
          </h2>
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "16px",
              color: BRAND.gray600,
              lineHeight: 1.7,
              marginBottom: "40px",
            }}
          >
            Your event feasibility brief has been sent via WhatsApp. A strategy consultant will review your metrics and contact you within{" "}
            <strong style={{ color: BRAND.navy }}>48 hours</strong>.
          </p>
          <a
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: BRAND.navy,
              color: BRAND.gold,
              padding: "16px 36px",
              borderRadius: "999px",
              fontFamily: "'Manrope', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Back to Events
          </a>
        </div>
      </div>
    );
  }

  /* ── Main Form ──────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .efs-input:focus { border-color: ${BRAND.navy} !important; box-shadow: 0 0 0 4px rgba(15,23,42,0.06) !important; }

        .efs-section {
          background: #fff;
          border-radius: 32px;
          padding: 44px 48px;
          border: 1px solid rgba(15,23,42,0.05);
          box-shadow: 0 8px 48px rgba(15,23,42,0.04);
          margin-bottom: 32px;
        }

        .efs-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .efs-priority-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .efs-section { padding: 28px 20px; border-radius: 20px; }
          .efs-grid-2 { grid-template-columns: 1fr; }
          .efs-priority-grid { grid-template-columns: 1fr; }
          .efs-hero-title { font-size: 44px !important; }
        }

        .step-cards-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 20px;
          border-radius: 18px;
          background: ${BRAND.navy};
          color: ${BRAND.gold};
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .submit-btn:hover {
          background: #1E293B;
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(15,23,42,0.18);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.4;
          cursor: pointer;
        }
      `}</style>

      {/* ── Hero ───────────────────────────────────────── */}
      <section
        style={{
          padding: "140px 0 80px",
          background: BRAND.primary,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            right: "-5%",
            bottom: "-20%",
            fontSize: "clamp(120px, 20vw, 280px)",
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: "rgba(255,212,71,0.03)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          FEASIBILITY
        </div>
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "-10%",
            width: "50%",
            height: "50%",
            background: "radial-gradient(circle, rgba(255,111,94,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <SectionLabel>Event Strategy</SectionLabel>
          <h1
            className="efs-hero-title"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(46px, 7vw, 80px)",
              fontWeight: 900,
              color: BRAND.white,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
            }}
          >
            Feasibility &amp;{" "}
            <span
              style={{
                fontStyle: "italic",
                background: GRADIENT.brand,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Strategy Form
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: "18px",
              color: "rgba(255,255,255,0.5)",
              maxWidth: "560px",
              lineHeight: 1.7,
            }}
          >
            Complete this brief so our strategists can assess the technical
            feasibility and ROI potential of your event before we begin.
          </p>
        </div>
      </section>

      {/* ── Body ───────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "64px 32px 120px",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>

          {/* ─── SECTION 1 ───────────────────────────────── */}
          <div className="efs-section">
            <SectionLabel>Section 01</SectionLabel>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 900,
                color: BRAND.navy,
                marginBottom: "36px",
                letterSpacing: "-0.01em",
              }}
            >
              The Core Scope
            </h2>

            {/* Q1 Event Type */}
            <Field>
              <FieldLabel number={1}>Event Type</FieldLabel>
              <div style={selectWrap}>
                <select
                  ref={eventTypeRef}
                  value={form.eventType}
                  onChange={(e) => set("eventType", e.target.value)}
                  className="efs-input"
                  style={{ ...fieldStyle, paddingRight: "44px", cursor: "pointer" }}
                >
                  <option value="">Select a category…</option>
                  {[
                    "Conference",
                    "Corporate Team-Building",
                    "Product Launch",
                    "Social Gala",
                    "Exhibition",
                    "Other",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span style={selectArrow}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errorMsg("eventType")}
            </Field>

            {/* Q2 Proposed Date */}
            <Field>
              <FieldLabel number={2}>Proposed Event Date</FieldLabel>
              <input
                ref={dateRef}
                type="date"
                value={form.proposedDate}
                onChange={(e) => set("proposedDate", e.target.value)}
                className="efs-input"
                style={fieldStyle}
                min={new Date().toISOString().split("T")[0]}
              />
              {errorMsg("proposedDate")}
            </Field>

            {/* Q3 Primary Objective */}
            <Field hint="Think: brand launch, community building, revenue generation, team alignment, etc.">
              <FieldLabel number={3}>Primary Objective</FieldLabel>
              <textarea
                ref={objectiveRef}
                value={form.primaryObjective}
                onChange={(e) => set("primaryObjective", e.target.value)}
                placeholder="What is the single most important outcome of this event?"
                className="efs-input"
                style={{ ...fieldStyle, resize: "vertical", minHeight: "100px" }}
              />
              {errorMsg("primaryObjective")}
            </Field>

            {/* Q4 Attendee Count */}
            <Field hint="Provide realistic estimates — this directly impacts per-head cost calculations.">
              <FieldLabel number={4}>Target Attendee Count</FieldLabel>
              <div className="efs-grid-2">
                <div>
                  <input
                    type="number"
                    placeholder="Minimum guests"
                    value={form.attendeeMin}
                    onChange={(e) => set("attendeeMin", e.target.value)}
                    className="efs-input"
                    style={fieldStyle}
                    min={1}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Maximum guests"
                    value={form.attendeeMax}
                    onChange={(e) => set("attendeeMax", e.target.value)}
                    className="efs-input"
                    style={fieldStyle}
                    min={1}
                  />
                </div>
              </div>
              {errorMsg("attendeeMin")}
            </Field>
          </div>

          {/* ─── SECTION 2 ───────────────────────────────── */}
          <div className="efs-section">
            <SectionLabel>Section 02</SectionLabel>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 900,
                color: BRAND.navy,
                marginBottom: "36px",
                letterSpacing: "-0.01em",
              }}
            >
              Financial Infrastructure
            </h2>

            {/* Q5 Total Budget */}
            <Field hint="Include all anticipated costs — venue, production, catering, logistics, marketing.">
              <FieldLabel number={5}>Total Estimated Investment</FieldLabel>
              <input
                ref={budgetRef}
                type="text"
                placeholder="e.g. ETB 500,000 or USD 10,000"
                value={form.totalBudget}
                onChange={(e) => set("totalBudget", e.target.value)}
                className="efs-input"
                style={fieldStyle}
              />
              {errorMsg("totalBudget")}
            </Field>

            {/* Q6 Financial Model */}
            <Field>
              <FieldLabel number={6}>Financial Model</FieldLabel>
              <div style={{ marginTop: "4px" }}>
                {radioOption("financialModel", "Pre-allocated Corporate/Private Budget", "Pre-allocated Corporate / Private Budget")}
                {radioOption("financialModel", "Ticket Sales / Registration Fees", "Ticket Sales / Registration Fees")}
                {radioOption("financialModel", "Sponsorships & Partnerships", "Sponsorships & Partnerships")}
                {radioOption("financialModel", "Mixed (Budget + Sales)", "Mixed (Budget + Revenue)")}
              </div>
              {errorMsg("financialModel")}
            </Field>

            {/* Q7 Budget Flexibility */}
            <Field>
              <FieldLabel number={7}>Budget Flexibility</FieldLabel>
              <div style={{ marginTop: "4px" }}>
                {radioOption("budgetFlexibility", "Strict cap — no overrun permitted", "Strict cap — no overrun is permitted")}
                {radioOption("budgetFlexibility", "Fixed but with a 10–15% buffer for premium additions", "Fixed, but with a 10–15% buffer for premium additions")}
                {radioOption("budgetFlexibility", "Flexible — quality takes priority", "Flexible — quality takes priority over cost")}
              </div>
              {errorMsg("budgetFlexibility")}
            </Field>
          </div>

          {/* ─── SECTION 3 ───────────────────────────────── */}
          <div className="efs-section">
            <SectionLabel>Section 03</SectionLabel>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 900,
                color: BRAND.navy,
                marginBottom: "36px",
                letterSpacing: "-0.01em",
              }}
            >
              Logistics &amp; Production
            </h2>

            {/* Q8 Venue Status */}
            <Field>
              <FieldLabel number={8}>Venue Status</FieldLabel>
              <div style={{ marginTop: "4px" }}>
                {radioOption("venueStatus", "Venue already secured", "Venue is already secured and confirmed")}
                {radioOption("venueStatus", "Require sourcing and procurement assistance", "We require sourcing, scouting, and procurement assistance")}
                {radioOption("venueStatus", "Open to venue recommendations", "Open to venue recommendations from the Yenege team")}
              </div>
              {errorMsg("venueStatus")}
            </Field>

            {/* Q9 Technical Priorities */}
            <Field hint="Examples: High-end AV, custom stage build, immersive branding, gourmet catering, live streaming, décor theme, etc.">
              <FieldLabel number={9}>Top 3 Technical Priorities</FieldLabel>
              <div className="efs-priority-grid" style={{ marginTop: "4px" }}>
                {([0, 1, 2] as const).map((i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "14px",
                        left: "16px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "8px",
                        background: BRAND.navy,
                        color: BRAND.gold,
                        fontSize: "10px",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Manrope', sans-serif",
                        zIndex: 1,
                        pointerEvents: "none",
                      }}
                    >
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      placeholder={
                        ["High-end AV System", "Custom Stage Build", "Immersive Branding"][i]
                      }
                      value={form.technicalPriorities[i]}
                      onChange={(e) => setPriority(i, e.target.value)}
                      className="efs-input"
                      style={{ ...fieldStyle, paddingLeft: "46px" }}
                    />
                  </div>
                ))}
              </div>
              {errorMsg("technicalPriorities")}
            </Field>

            {/* Q10 & Q11 Duration + Setup Window */}
            <div className="efs-grid-2">
              <Field hint="Total live hours including pre/post sessions.">
                <FieldLabel number={10}>Event Duration</FieldLabel>
                <input
                  ref={durationRef}
                  type="text"
                  placeholder="e.g. 8 hours / 2 days"
                  value={form.eventDuration}
                  onChange={(e) => set("eventDuration", e.target.value)}
                  className="efs-input"
                  style={fieldStyle}
                />
                {errorMsg("eventDuration")}
              </Field>

              <Field hint="Hours or days available for move-in and rigging.">
                <FieldLabel number={11}>Setup Window</FieldLabel>
                <input
                  ref={setupRef}
                  type="text"
                  placeholder="e.g. 4 hours / 1 day"
                  value={form.setupWindow}
                  onChange={(e) => set("setupWindow", e.target.value)}
                  className="efs-input"
                  style={fieldStyle}
                />
                {errorMsg("setupWindow")}
              </Field>
            </div>
          </div>

          {/* ─── CONTACT ─────────────────────────────────── */}
          <div className="efs-section">
            <SectionLabel>Your Details</SectionLabel>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 900,
                color: BRAND.navy,
                marginBottom: "36px",
                letterSpacing: "-0.01em",
              }}
            >
              Contact Information
            </h2>

            <div className="efs-grid-2">
              <Field>
                <FieldLabel number={12}>Full Name</FieldLabel>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Your name"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className="efs-input"
                  style={fieldStyle}
                />
                {errorMsg("contactName")}
              </Field>

              <Field>
                <FieldLabel number={13}>Email Address</FieldLabel>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@company.com"
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className="efs-input"
                  style={fieldStyle}
                />
                {errorMsg("contactEmail")}
              </Field>
            </div>

            <Field hint="Optional — for faster coordination.">
              <FieldLabel number={14}>Phone / WhatsApp</FieldLabel>
              <input
                ref={phoneRef}
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                className="efs-input"
                style={{ ...fieldStyle, maxWidth: "340px" }}
              />
            </Field>
          </div>

          {/* ─── SUBMIT ──────────────────────────────────── */}
          <button
            type="submit"
            className="submit-btn"
            disabled={submitStatus === "submitting"}
          >
            {submitStatus === "submitting" ? (
              <>
                <svg
                  style={{ animation: "spin 1s linear infinite" }}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing Brief…
              </>
            ) : (
              <>
                Submit Feasibility Brief
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* ─── Disclaimer ──────────────────────────────── */}
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "12px",
              color: BRAND.gray400,
              fontFamily: "'Manrope', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Data collected is used solely to assess the technical feasibility and ROI potential of your project.
            A strategy consultant will review these metrics and contact you within{" "}
            <strong style={{ color: BRAND.navy }}>48 hours</strong>.
          </p>
        </form>

        {/* ─── Profitability Filter ─────────────────────── */}
        <section style={{ marginTop: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <SectionLabel>Our Internal Process</SectionLabel>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 900,
                color: BRAND.navy,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              How We Assess Your Brief
            </h2>
            <p
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: "15px",
                color: BRAND.gray500,
                marginTop: "16px",
                maxWidth: "540px",
                margin: "16px auto 0",
                lineHeight: 1.7,
              }}
            >
              Once your form arrives, our strategists apply the{" "}
              <strong style={{ color: BRAND.navy }}>3-Step Profitability Filter</strong> to
              determine feasibility and the optimal engagement structure.
            </p>
          </div>

          <div className="step-cards-row">
            <StepCard
              step="01"
              title="Per-Head Reality Check"
              body="We divide your Total Investment by the max attendee count. This instantly reveals whether your budget can realistically support your listed technical priorities. A mismatch flags a high-stress, low-margin project before any commitment."
            />
            <StepCard
              step="02"
              title="Complexity vs. Time Ratio"
              body="We compare your Technical Priorities against your Setup Window. A custom stage build in a 4-hour window skyrockets labor costs. If the budget doesn't reflect this urgency, the profit margin disappears — and we'll tell you upfront."
            />
            <StepCard
              step="03"
              title="Risk Assessment"
              body="We evaluate your Financial Model. A pre-allocated budget is low-risk — we structure our fee with confidence. Ticket-dependent events carry payment risk; for these, we require a higher upfront deposit to protect both parties."
            />
          </div>

          {/* Risk legend */}
          <div
            style={{
              marginTop: "32px",
              padding: "28px 32px",
              borderRadius: "20px",
              background: BRAND.navy,
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "10px",
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Risk Legend
              </p>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4ADE80" }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "13px", color: "#fff", fontWeight: 600 }}>
                    High Profit / Low Risk — Pre-allocated Budget
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: BRAND.coral }} />
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: "13px", color: "#fff", fontWeight: 600 }}>
                    Low Profit / High Risk — Ticket Sales Model
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                maxWidth: "260px",
                lineHeight: 1.6,
              }}
            >
              Ticket-based projects require a higher upfront deposit to be eligible for full Yenege strategy support.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventFeasibilityForm;
