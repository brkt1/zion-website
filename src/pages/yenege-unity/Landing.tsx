import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaUsers, FaHandshake, FaChartBar, FaChevronDown, FaCheckCircle, FaUserCheck } from 'react-icons/fa';

export default function YenegeUnityLanding() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Yenege Unity?",
      a: "Yenege Unity is an invitation-only premium business networking summit designed specifically for executive leadership, venture investors, scale-up founders, and key policy makers. Rather than standard lectures, the event focuses on pre-arranged, high-value connections and cross-industry matchmaking."
    },
    {
      q: "How does the qualification process work?",
      a: "All attendees must apply through our multi-step platform. Our committee reviews every application, assesses their current industry footprint, targets, and value contributions. If qualified, a phone consultation is scheduled to refine networking goals and pre-arrange introductions before the event."
    },
    {
      q: "What are target networking sectors?",
      a: "These are specific industries you intend to build relationships with (e.g., a software founder seeking contacts in logistics or manufacturing). Our matchmaking CRM maps these requests to design curated seating charts and 1-on-1 introductions."
    },
    {
      q: "Is there a registration fee?",
      a: "Yes. Once approved, attendees receive an official invitation letter containing payment instructions. Select VIP guests, speakers, and enterprise sponsors may have fees waived."
    },
    {
      q: "Can I sponsor Yenege Unity?",
      a: "Yes, we offer custom sponsorship packages (Platinum, Gold, Silver). Sponsors gain premium exhibition booths, VIP access, and placement in our strategic industry matchmaking matrix. Indicate your interest in the application form, and our Sponsor Manager will reach out."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Decorative Glow Elements */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <FaCrown className="animate-pulse" /> Invitation-Only Executive Summit
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Where Visionaries <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                Align & Scale
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Yenege Unity is the ultimate networking ecosystem for C-Suites, founders, and investors. We bypass standard presentations to prioritize strategic matchmaking and pre-arranged relationships.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/yenege-unity/apply"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-xl text-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-300"
              >
                Apply to Join Yenege Unity
              </Link>
              <a
                href="#agenda"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-center border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                Explore Experience
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0 border-t border-white/10">
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">120</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Vetted Leaders</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">30+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">VC Funds</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-amber-400">1-on-1</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Matchmaking</p>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Image Visualization */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative group max-w-md w-full">
              {/* Outer Golden Border/Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
              
              {/* Main Card Container */}
              <div className="relative bg-neutral-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/yenege_unity_hero.png" 
                  alt="Yenege Unity Premium Networking" 
                  className="w-full h-80 object-cover opacity-90 object-top"
                />
                
                {/* Micro-Details Overlay */}
                <div className="p-6 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Addis Ababa, Ethiopia</p>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Executive Summit 2026</h3>
                  <p className="text-sm text-gray-400">
                    A curated cohort experience matching technology, finance, and industrial capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Intro Section */}
      <section className="bg-neutral-950 border-y border-white/5 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              The Antidote to Standard Business Conventions
            </h2>
            <p className="text-gray-400 leading-relaxed font-light mb-4">
              Typical events involve sitting in auditoriums listening to general presentations, hoping to run into the right person by chance. Yenege Unity operates differently.
            </p>
            <p className="text-gray-400 leading-relaxed font-light">
              We collect deep sector data, identify your strategic target sectors, match connections manually using networking coordinators, and set up your meetings ahead of schedule. Your time is valuable; we treat it as currency.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-black border border-white/10 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <FaCrown size={20} />
              </div>
              <h4 className="font-bold text-lg">Curated Intake</h4>
              <p className="text-sm text-gray-500">Every single application is reviewed manually to ensure high cohort alignment.</p>
            </div>
            <div className="p-6 bg-black border border-white/10 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <FaUsers size={20} />
              </div>
              <h4 className="font-bold text-lg">Targeted Matchmaking</h4>
              <p className="text-sm text-gray-500">We align who you want to meet with who can contribute direct value back to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The Unity Advantage</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-light">
            Designed to bridge structural networking gaps and build tangible business relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaHandshake className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">Manual Connections</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We employ professional Networking Coordinators to analyze target sectors and engineer direct face-to-face handshakes at the summit.
            </p>
          </div>
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaChartBar className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">Industrial Synergy</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Whether you represent Energy, Manufacturing, Finance, or Tech, our platform visualizes and groups cross-industry integration opportunities.
            </p>
          </div>
          <div className="p-8 bg-neutral-900/50 border border-white/10 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors duration-300">
            <FaUserCheck className="text-amber-400 text-4xl" />
            <h3 className="text-xl font-bold">VIP Seating Charts</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Networking circles and cocktail roundtables are strategically organized according to your business scale, challenge parameters, and objectives.
            </p>
          </div>
        </div>
      </section>

      {/* Networking Opportunities - Industry Targets Showcase */}
      <section className="bg-neutral-950 border-t border-white/5 py-24 px-4 md:px-8" id="agenda">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Deep Matchmaking & Industry Targets
              </h2>
              <p className="text-gray-400 leading-relaxed font-light">
                Our application form captures not just who you are, but the exact industries you want to engage with and what you can offer to others.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <FaCheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">Cross-Industry Alignment</h5>
                    <p className="text-xs text-gray-500">Connecting agro-processors with fintech developers, and real estate developers with green energy providers.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FaCheckCircle className="text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">Pre-Vetted Profiles</h5>
                    <p className="text-xs text-gray-500">Every attendee goes through telephonic pre-screening to verify their goals and business scale.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 bg-black border border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
              <h4 className="font-bold text-amber-400 uppercase tracking-widest text-xs">Simulated Networking Flow</h4>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                  <div>
                    <h5 className="font-bold text-white">Submit Intake Dossier</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Input your job parameters, target networking sectors, connection purpose, and value offering.</p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                  <div>
                    <h5 className="font-bold text-white">Matchmaking & CRM Pre-Screening</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Our Call Team logs your interest level, designs internal tags, and coordinates your schedule.</p>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                  <div>
                    <h5 className="font-bold text-white">Receive Curated Intro Agenda</h5>
                    <p className="text-xs text-gray-400 mt-0.5">Before entering the room, receive a custom matchmaking schedule detailing who you are sitting next to and why.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Showcase */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Corporate Backing</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">Summit Sponsors & Partners</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="h-20 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center p-6 text-gray-500 hover:text-white transition-colors duration-200">
            <span className="font-extrabold tracking-wider text-sm md:text-base">APEX CAPITAL</span>
          </div>
          <div className="h-20 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center p-6 text-gray-500 hover:text-white transition-colors duration-200">
            <span className="font-extrabold tracking-wider text-sm md:text-base">WEST AFRICA PLASTICS</span>
          </div>
          <div className="h-20 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center p-6 text-gray-500 hover:text-white transition-colors duration-200">
            <span className="font-extrabold tracking-wider text-sm md:text-base">VANCE ENERGY</span>
          </div>
          <div className="h-20 bg-neutral-900 border border-white/5 rounded-2xl flex items-center justify-center p-6 text-gray-500 hover:text-white transition-colors duration-200">
            <span className="font-bold text-sm md:text-base">MENSH BDS</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-900/40 border-t border-white/5 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Voices of Yenege Unity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-black border border-white/10 rounded-3xl space-y-4">
              <p className="italic text-gray-300 text-sm leading-relaxed">
                "I was skeptical about another networking event. But Yenege Unity matched me directly with two agro-exporters looking for local logistic warehouses. We closed a contract within three weeks of the summit. Unparalleled value."
              </p>
              <div>
                <p className="font-bold text-amber-400">Tewodros Kassaye</p>
                <p className="text-xs text-gray-500">CEO, Kassaye Supply Chains</p>
              </div>
            </div>
            <div className="p-8 bg-black border border-white/10 rounded-3xl space-y-4">
              <p className="italic text-gray-300 text-sm leading-relaxed">
                "As an investor, finding vetted deals is incredibly time-consuming. Yenege Unity pre-screened the founders, matched their needs with our investment ticket criteria, and saved us months of scouting."
              </p>
              <div>
                <p className="font-bold text-amber-400">Michael Chen</p>
                <p className="text-xs text-gray-500">Managing Partner, Apex Capital</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-sm">Everything you need to know about the Yenege Unity platform and registration workflow.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-neutral-850"
              >
                <span>{faq.q}</span>
                <FaChevronDown className={`text-amber-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Application CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-neutral-950 to-black py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Apply to the Seeding Cohort</h2>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-light">
            Our seating availability is capped strictly at 120 executives to guarantee matchmaking quality. Submit your business intelligence file now.
          </p>
          <div className="pt-4">
            <Link
              to="/yenege-unity/apply"
              className="inline-block px-10 py-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black rounded-2xl text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-amber-300"
            >
              Apply to Join Yenege Unity
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
