export type Language = 'en' | 'am';

export interface Translations {
  header: {
    skipMain: string;
    wa: string;
    home: string;
    events: string;
    masterclass: string;
    about: string;
    contact: string;
  };
  hero: {
    tagline: string;
    specialEvents: string;
    description: string;
    exploreEvents: string;
    contactWa: string;
  };
  stats: {
    happyMembers: string;
    avgRating: string;
    destinations: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    eventsTitle: string;
    eventsDesc: string;
    communityTitle: string;
    communityDesc: string;
    discover: string;
  };
  experiences: {
    title: string;
    noUpcoming: string;
    curatingSpecial: string;
    explorePortfolio: string;
  };
  academy: {
    title: string;
    masterPlanning: string;
    joinProgram: string;
    feature8weeks: string;
    featureRealPlanning: string;
    featureCert: string;
    joinMasterclass: string;
    nextCohort: string;
  };
  strategy: {
    title: string;
    subtitle: string;
    isFeasible: string;
    beforeInvest: string;
    consult: string;
    roiFocus: string;
    marketAnalysis: string;
  };
  gallery: {
    title: string;
    subtitle: string;
    wedding: string;
    weddingDesc: string;
    private: string;
    privateDesc: string;
    corporate: string;
    corporateDesc: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    contact: string;
    stayUpdated: string;
    subscribe: string;
    subscribePlaceholder: string;
    subscribeText: string;
    allRights: string;
    privacy: string;
    terms: string;
  };
  cta: {
    readyBegin: string;
    readyJoin: string;
    bePartOf: string;
  };
  about: {
    label: string;
    title: string;
    description: string;
    origin: string;
    exec: string;
    execDesc: string;
    edu: string;
    eduDesc: string;
    comm: string;
    commDesc: string;
  };
  contact: {
    label: string;
    title: string;
    desc: string;
    formTitle: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
  };
  notFound: {
    title: string;
    subtitle: string;
    description: string;
    goHome: string;
    goBack: string;
    lookingFor: string;
  };
}

export const translations: Record<Language, Translations> = {
  am: {
    header: {
      skipMain: "ወደ ዋናው ይዘት እለፍ",
      wa: "ዋትስአፕ",
      home: "መነሻ",
      events: "ኢቨንቶች",
      masterclass: "ማስተር ክላስ",
      about: "ስለ እኛ",
      contact: "ያግኙን",
    },
    hero: {
      tagline: "ስትራቴጂካዊ አፈፃፀም። ቴክኒካዊ ልህቀት።",
      specialEvents: "ልዩ ኢቨንቶች",
      description: "ስትራቴጂካዊ አፈፃፀም እና ቴክኒካዊ ልህቀትን የሚያረጋግጡ የልምድ አርክቴክቸር ስርዓቶችን እንገነባለን — ከከፍተኛ የድርጅት ፕሮግራሞች ጀምሮ እስከ ተመረጡ የንግድ መድረኮች። ጥብቅ እቅድን ከፈጠራ አርክቴክቸር ጋር በማጣመር ውስብስብ ራዕዮችን ወደ እውን እንለውጣለን።",
      exploreEvents: "ስትራቴጂካዊ የምክክር ጥያቄ",
      contactWa: "የድርጅት ማግበር ጥያቄ",
    },
    stats: {
      happyMembers: "የተመሰከረላቸው አርክቴክቶች",
      avgRating: "አማካይ ደረጃ",
      destinations: "መዳረሻዎች",
    },
    portfolio: {
      title: "የስራዎቻችን ማህደር",
      subtitle: "የተመረጡ መዳረሻዎች፣ ልዩ ጊዜያት",
      eventsTitle: "Events",
      eventsDesc: "ስትራቴጂካዊ የኔትወርክ አክቲቬሽኖች፣ ሙያዊ ውድድሮች እና የንግድ መድረኮች።",
      communityTitle: "Community",
      communityDesc: "የዘርፉን ስትራቴጂካዊ መሪዎች ይቀላቀሉ። ልምዶችን ያካፍሉ፣ ይገናኙ እና ዘላቂ ሙያዊ ግንኙነቶችን ይገንቡ።",
      discover: "ይመልከቱ",
    },
    experiences: {
      title: "የሚገኙ ገጠመኞች",
      noUpcoming: "በአሁኑ ጊዜ የሚጠበቁ ኢቨንቶች የሉም።",
      curatingSpecial: "ልዩ ነገር እያዘጋጀን ነው፤ በቅርቡ የሚኖሩንን ዝግጅቶች ለማየት በሌላ ጊዜ ተመልሰው ይዩን።",
      explorePortfolio: "ስራዎቻችንን ይመልከቱ",
    },
    academy: {
      title: "ልዩ ስልጠና",
      masterPlanning: "የኢቨንት ፕላኒንግን ይማሩ",
      joinProgram: "የ8 ሳምንት ስልጠናችንን በመውሰድ ሰርተፍኬት ያግኙ። የተሳካ የኢቨንት አደራጅ ለመሆን በተግባር የታገዘ ስልጠና ይውሰዱ።",
      feature8weeks: "የ8 ሳምንት ተግባራዊ ስልጠና",
      featureRealPlanning: "ከመጀመሪያው ቀን ጀምሮ ትክክለኛ የኢቨንት ስራዎችን መለማመድ",
      featureCert: "በዘርፉ ታዋቂ በሆኑ ድርጅቶች እውቅና ያለው ሰርተፍኬት",
      joinMasterclass: "ስልጠናውን ይቀላቀሉ",
      nextCohort: "ቀጣዩ ስልጠና በቅርቡ ይጀምራል",
    },
    strategy: {
      title: "ቢዝነስ እና ስትራቴጂ",
      subtitle: "Revenue & Strategy",
      isFeasible: "የኢቨንት ሃሳብዎ ያዋጣል?",
      beforeInvest: "ገንዘብዎን ከማውጣትዎ በፊት የሃሳብዎን ትርፋማነት በባለሙያዎቻችን ያስገመግሙ።",
      consult: "ከአማካሪዎቻችን ጋር ይወያዩ",
      roiFocus: "በትርፋማነት ላይ ያተኮረ",
      marketAnalysis: "የገበያ ጥናት",
    },
    gallery: {
      title: "የፎቶ ማህደር",
      subtitle: "ከዚህ ቀደም የነበሩ ድንቅ ገጠመኞች",
      wedding: "የሰርግ ኢቨንቶች",
      weddingDesc: "ውብ እና የማይረሱ",
      private: "ልዩ የደስታ ጊዜያት",
      privateDesc: "ልደቶች፣ የእጮኝነት ግብዣዎች እና ሌሎች",
      corporate: "የድርጅት ኢቨንቶች",
      corporateDesc: "ሙያዊ ብቃት የተላበሱ",
    },
    footer: {
      description: "ስትራቴጂካዊ አፈፃፀም እና ቴክኒካዊ ልህቀት በልምድ አርክቴክቸር ስርአቶች አማካኝነት።",
      quickLinks: "ፈጣን ሊንኮች",
      contact: "ያግኙን",
      stayUpdated: "ሁሌም ይከታተሉን",
      subscribe: "ይመዝገቡ",
      subscribePlaceholder: "ኢሜይልዎን ያስገቡ",
      subscribeText: "አዳዲስ ኢቨንቶችን እና መረጃዎችን ለማግኘት ይመዝገቡ።",
      allRights: "መብቱ በህግ የተጠበቀ ነው።",
      privacy: "የግል መረጃ ጥበቃ",
      terms: "የአጠቃቀም ደንቦች",
    },
    cta: {
      readyBegin: "ለመጀመር ዝግጁ ነዎት?",
      readyJoin: "አርክቴክቸር ቡድኑን ለመቀላቀል ዝግጁ ነዎት?",
      bePartOf: "ስትራቴጂካዊ ክንዋኔዎችን እና የልምድ አርክቴክቸር ስርዓቶችን የሚቆጣጠሩ የተመሰከረላቸው ባለሙያዎች ማህበረሰብ አባል ይሁኑ።",
    },
    about: {
      label: "ስለ አርክቴክቸር",
      title: "ከጊዜያዊ ኢቨንት ባሻገር እንገነባለን",
      description: "የነገ በባለሙያ አፈፃፀም ፣ በትምህርት እና በማህበረሰብ መገናኛ ላይ የሚሰሩ በአዲስ አበባ የሚገኝ ዘመናዊ የአኗኗር ዘይቤ እና ገጠመኝ መድረክ ነው።",
      origin: "የነገ ህልም",
      exec: "በባለሙያ ማከናወን",
      execDesc: "ከፍተኛ ደረጃ ያላቸው የኢቨንት ፕሮዳክሽን እና የሎጂስቲክስ ስራዎች።",
      edu: "የባለሙያ ስልጠና",
      eduDesc: "ለቀጣዩ ትውልድ የኢቨንት ዲዛይነሮች የሚሰጥ ስልጠና።",
      comm: "ደመቅ ያለ ማህበረሰብ",
      commDesc: "የፈጣሪዎች እና የባለሙያዎች የትብብር ስነ-ምህዳር።",
    },
    contact: {
      label: "ያግኙን",
      title: "የሚቀጥለውን ታሪክዎን አብረን እንስራ",
      desc: "የእርስዎን ኢቨንቶች ለማዘመን ዝግጁ ነዎት? አደራጅ፣ አጋር ወይም ተማሪ ከሆኑ የኛ ቡድን እርስዎን ለመርዳት ዝግጁ ነው።",
      formTitle: "መልዕክት ይላኩ",
      name: "ሙሉ ስም",
      email: "ኢሜይል",
      phone: "ስልክ ቁጥር",
      message: "እንዴት እንርዳዎት?",
      send: "በዋትስአፕ ይላኩ",
    },
    notFound: {
      title: "ገጹ አልተገኘም",
      subtitle: "ይቅርታ! የፈለጉት ገጽ የለም።",
      description: "ገጹ ተሰርዞ፣ ተለውጦ ወይም የተሳሳተ ሊንክ ተጠቅመው ሊሆን ይችላል።",
      goHome: "ወደ መነሻ ገጽ",
      goBack: "ተመለስ",
      lookingFor: "ምናልባት እነዚህን ፈልገው ሊሆን ይችላል:",
    },
  },
  en: {
    header: {
      skipMain: "Skip to main content",
      wa: "WhatsApp",
      home: "Home",
      events: "Events",
      masterclass: "Masterclass",
      about: "About",
      contact: "Contact",
    },
    hero: {
      tagline: "Precision in Experience Architecture",
      specialEvents: "Special Events",
      description: "We design curated business environments and strategic navigation systems — from elite corporate programs to custom travel systems. By pairing rigorous planning with precision experience architecture, we turn complex visions into measurable strategic assets.",
      exploreEvents: "Request a Strategic Consultation",
      contactWa: "Inquire for Corporate Activation",
    },
    stats: {
      happyMembers: "Certified Architects",
      avgRating: "Average Rating",
      destinations: "Destinations",
    },
    portfolio: {
      title: "The Portfolio",
      subtitle: "Selected Destinations, Exclusive Moments",
      eventsTitle: "Events",
      eventsDesc: "Strategic networking activations, executive challenges, and professional exchange environments.",
      communityTitle: "Community",
      communityDesc: "Join Ethiopia's elite circle of certified event architects. Share insights, collaborate, and build strategic networks.",
      discover: "Discover",
    },
    experiences: {
      title: "Available Experiences",
      noUpcoming: "No upcoming experiences right now",
      curatingSpecial: "We're curating something special. Check back later to discover our latest bespoke experiences.",
      explorePortfolio: "Explore Portfolio",
    },
    academy: {
      title: "Professional Academy",
      masterPlanning: "Master Event Planning",
      joinProgram: "Join our 8-week certification program. Get hands-on training and real-world skills to become a successful event professional.",
      feature8weeks: "8 weeks of hands-on, intensive training",
      featureRealPlanning: "Real event planning from day one",
      featureCert: "Certification recognised by industry leaders",
      joinMasterclass: "Join Masterclass",
      nextCohort: "Next cohort starting soon",
    },
    strategy: {
      title: "Revenue & Strategy",
      subtitle: "Business & Strategy",
      isFeasible: "Is Your Event Idea Feasible & Profitable?",
      beforeInvest: "Before you invest, let our experts assess the technical feasibility and ROI of your next big move.",
      consult: "Consult Our Strategists",
      roiFocus: "ROI Focus",
      marketAnalysis: "Market Analysis",
    },
    gallery: {
      title: "Our Gallery",
      subtitle: "Explore our amazing moments and experiences",
      wedding: "Wedding Experiences",
      weddingDesc: "Elegant, seamless, unforgettable.",
      private: "Private Celebrations",
      privateDesc: "Birthdays, engagements, and special moments designed with care.",
      corporate: "Corporate Events",
      corporateDesc: "Professional, polished, and impactful.",
    },
    footer: {
      description: "Designing impactful experience systems through events, travel adventures, and community connections.",
      quickLinks: "Quick Links",
      contact: "Contact",
      stayUpdated: "Stay Updated",
      subscribe: "Subscribe",
      subscribePlaceholder: "Enter your email",
      subscribeText: "Subscribe to get notified about upcoming events and adventures.",
      allRights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    cta: {
      readyBegin: "Ready to Begin?",
      readyJoin: "Ready to Join the Elite Circle?",
      bePartOf: "Be part of an elite circle that masters strategic execution, coordinates complex systems, and designs impactful experience environments.",
    },
    about: {
      label: "Architecture of Experiences",
      title: "We Build Beyond Moments",
      description: "Yenege is a modern lifestyle and experience platform based in Addis Ababa, operating at the intersection of professional execution, education, and community.",
      origin: "The Yenege Dream",
      exec: "Professional Execution",
      execDesc: "High-level event production and logistics management.",
      edu: "Expert Education",
      eduDesc: "Professional training for the next generation of event designers.",
      comm: "Vibrant Community",
      commDesc: "A collaborative ecosystem of creatives and professionals.",
    },
    contact: {
      label: "Get in Touch",
      title: "Let's Build Your Next Story",
      desc: "Ready to revolutionize your events? Whether you're an organizer, partner, or student, our team is here to help you scale and succeed.",
      formTitle: "Send a Message",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "How can we help?",
      send: "Send via WhatsApp",
    },
    notFound: {
      title: "Page Not Found",
      subtitle: "Oops! The page you're looking for doesn't exist.",
      description: "It might have been moved, deleted, or you entered the wrong URL.",
      goHome: "Go to Homepage",
      goBack: "Go Back",
      lookingFor: "You might be looking for:",
    },
  },
};
