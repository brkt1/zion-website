export type Language = 'en' | 'am' | 'om';

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
  home: {
    academyLabel: string;
    academyTitle: string;
    academyDesc: string;
    featureCert: string;
    featureMasterclass: string;
    featureProjects: string;
    featureMentors: string;
    enrollNow: string;
    seeMasterclass: string;
    communityMembers: string;
    studentRating: string;
    eliteCircleTitle: string;
    eliteCircleDesc: string;
    curatedExperiences: string;
    featuredEvents: string;
    viewAll: string;
    distinctionLabel: string;
    distinctionTitle: string;
    distinctionDesc: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    unityBadge: string;
    unityTitle: string;
    unityDesc: string;
    exploreUnity: string;
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
    subtitle: string;
    description: string;
    originLabel: string;
    originQuote: string;
    originQuoteSub: string;
    originDesc: string;
    exec: string;
    execDesc: string;
    edu: string;
    eduDesc: string;
    comm: string;
    commDesc: string;
    missionTitle: string;
    missionHeading: string;
    missionDesc: string;
    visionTitle: string;
    visionHeading: string;
    visionDesc: string;
    ceoLabel: string;
    ceoTitle: string;
    ceoName: string;
    ceoRole: string;
    ceoBio: string;
    joinCohort: string;
    contactLead: string;
    check1: string;
    check2: string;
    check3: string;
    check4: string;
  };
  contact: {
    label: string;
    title: string;
    subtitle: string;
    desc: string;
    headStudioTitle: string;
    emailEnquiriesTitle: string;
    phoneHotlineTitle: string;
    officialChannelsTitle: string;
    formTitle: string;
    formSub: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    send: string;
    waSuccess: string;
  };
  notFound: {
    title: string;
    subtitle: string;
    description: string;
    goHome: string;
    goBack: string;
    lookingFor: string;
  };
  eventsPage: {
    title: string;
    subtitle: string;
    all: string;
    upcoming: string;
    past: string;
    register: string;
    details: string;
    noEvents: string;
    filterCategory: string;
    date: string;
    location: string;
    searchPlaceholder: string;
    clearFilters: string;
    hostWithUs: string;
    wantToHost: string;
    submitBriefDesc: string;
    submitBriefBtn: string;
    waInquiry: string;
    free: string;
  };
  masterclassPage: {
    title: string;
    subtitle: string;
    enrollNow: string;
    programOverview: string;
    schedule: string;
    curriculum: string;
    tuition: string;
    certifiedCohort: string;
    question6Label: string;
    applyHeader: string;
    whyChooseTitle: string;
    whyChooseSubtitle: string;
    featuredPrograms: string;
    exploreTitle: string;
    exploreSubtitle: string;
    gotQuestions: string;
    faqTitle: string;
    startLearningTitle: string;
    startLearningSubtitle: string;
    satisfaction: string;
    topRated: string;
    practicalDrills: string;
    digitalLive: string;
    verifiedCerts: string;
    cvReady: string;
    programLength: string;
    cohortLength: string;
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
      tagline: "በልምድ አርክቴክቸር የላቀ ብቃት",
      specialEvents: "ልዩ ኢቨንቶች",
      description: "ስትራቴጂካዊ አፈፃፀም እና ቴክኒካዊ ልህቀትን የሚያረጋግጡ የልምድ አርክቴክቸር ስርዓቶችን እንገነባለን — ከከፍተኛ የድርጅት ፕሮግራሞች ጀምሮ እስከ ተመረጡ የንግድ መድረኮች። ጥብቅ እቅድን ከፈጠራ አርክቴክቸር ጋር በማጣመር ውስብስብ ራዕዮችን ወደ እውን እንለውጣለን።",
      exploreEvents: "ስትራቴጂካዊ የምክክር ጥያቄ",
      contactWa: "የድርጅት ማግበር ጥያቄ",
    },
    home: {
      academyLabel: "ልዩ ስልጠና · Special Training",
      academyTitle: "የኢቨንት አርክቴክቸር ጥበብን ይማሩ",
      academyDesc: "በምስራቅ አፍሪካ አጠቃላይ እና ዘመናዊ የኢቨንት ስልጠና ፕሮግራም። ከዝግጅት እስከ ቀጥታ አፈፃፀም — የተመሰከረላቸው የወደፊት የኢቨንት መሪዎችን እንገነባለን።",
      featureCert: "ሙያዊ ሰርተፍኬት",
      featureMasterclass: "ተግባራዊ ማስተር ክላስ",
      featureProjects: "እውነተኛ ፕሮጀክቶች",
      featureMentors: "የዘርፉ ባለሙያዎች",
      enrollNow: "አሁኑኑ ይመዝገቡ",
      seeMasterclass: "ማስተር ክላስ ይመልከቱ",
      communityMembers: "የማህበረሰብ አባላት",
      studentRating: "የተማሪዎች ደረጃ",
      eliteCircleTitle: "የምርጦቹ ማህበረሰብ አካል ይሁኑ",
      eliteCircleDesc: "ምዝገባውን ለ50 መስራች ተማሪዎች መወሰናችን የቅርብ ክትትል እና 100% የልምድ ዲዛይን እውቀት እንድንሰጥ ያስችለናል።",
      curatedExperiences: "የተመረጡ ገጠመኞች",
      featuredEvents: "ዋና ዋና ኢቨንቶች",
      viewAll: "ሁሉንም ይመልከቱ",
      distinctionLabel: "የየነገ ልዩነት",
      distinctionTitle: "የልህቀት ጉዞአችን",
      distinctionDesc: "የስራ መንገዳችን የፈጠራ፣ የትምህርት እና የተረጋገጡ ውጤቶች ቀጣይነት ያለው ኡደት ነው።",
      step1Title: "የአርክቴክቸር ልህቀት",
      step1Desc: "እያንዳንዱ ዝርዝር የታሰበበት እና እያንዳንዱ ጊዜ ተፅእኖ የሚፈጥርበት የልምድ ስርአት እንነድፋለን።",
      step2Title: "የእውቀት ማዕከል",
      step2Desc: "በምስራቅ አፍሪካ ቀዳሚ የኢቨንት አካደሚ ባለቤት በመሆናችን ቡድናችን ሁልጊዜ በዘርፉ ግንባር ቀደም ነው።",
      step3Title: "ሁለንተናዊ ተደራሽነት",
      step3Desc: "አንድ ኢቨንት አዘጋጅተን አዲስ አበባን ከኢትዮጵያውያን ዲያስፖራ ጋር በማገናኘት ሁለት ተመልካቾችን እናደርሳለን።",
      step4Title: "የተረጋገጠ አሻራ",
      step4Desc: "ሺህዎች ስኬታማ ኢቨንቶች እና አለም አቀፍ ማህበረሰብ — ምስክርነታችን የስራችን ውጤት ነው።",
      unityBadge: "የነገ ዩኒቲ",
      unityTitle: "ልዩ ተደራሽነት። ከፍተኛ ደረጃ ያላቸው ግንኙነቶች።",
      unityDesc: "ለስትራቴጂካዊ አጋርነቶች እና ለብራንድ እውቅና ተብሎ የተዘጋጀ ልዩ የቢዝነስ አካባቢ። ድርጅትዎን ያሳድጉ።",
      exploreUnity: "የነገ ዩኒቲን ይመልከቱ",
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
      title: "ስለ የነገ",
      subtitle: "የምስራቅ አፍሪካን የልምድ ኢኮኖሚ መገንባት",
      description: "የነገ በባለሙያ አፈፃፀም፣ በትምህርት እና በማህበረሰብ መገናኛ ላይ የሚሰራ በአዲስ አበባ የሚገኝ ዘመናዊ የልምድ አርክቴክቸር ድርጅት እና አካደሚ ነው።",
      originLabel: "የነገ አመጣጥ",
      originQuote: "ብዙዎች በኢቨንት ላይ ይገኛሉ።",
      originQuoteSub: "ጥቂቶች ግን ኢቨንቱን ይቀርጻሉ።",
      originDesc: "የነገ በአዲስ አበባ የተመሰረተው የሰዎች ስብሰባዎችን እና ዝግጅቶችን በዓለም አቀፍ ደረጃ እና በትክክለኛ አፈፃፀም የመምራት ህልም በመያዝ ነው።",
      exec: "ሙያዊ አፈፃፀም",
      execDesc: "ከፍተኛ የኢቨንት ዝግጅት፣ የድምፅ እና የመድረክ ንድፍ እንዲሁም የሎጂስቲክስ አስተዳደር።",
      edu: "የአመራር ስልጠና",
      eduDesc: "የወደፊቱን የተረጋገጡ የኢቨንት መሪዎችን እና ፕሮጀክት አስተዳዳሪዎችን የሚያሰለጥን አካደሚ።",
      comm: "ንቁ ማህበረሰብ",
      commDesc: "ድርጅቶችን፣ የፈጠራ ሰዎችን እና አጋሮችን የሚያገናኝ የጋራ ማህበረሰብ።",
      missionTitle: "ተልእኳችን",
      missionHeading: "በስልታዊ አመራር እና በጥራት ነገን ማብቃት",
      missionDesc: "በስልታዊ አመራር፣ በፈጠራ የኢቨንት ንድፍ እና በትክክለኛ አፈፃፀም ነገን ማብቃት።",
      visionTitle: "ራእያችን",
      visionHeading: "በምስራቅ አፍሪካ ግንባር ቀደም የልምድ አርክቴክት መሆን",
      visionDesc: "በምስራቅ አፍሪካ ግንባር ቀደም የኢቨንት እና የልምድ ንድፍ መሪ መሆን።",
      ceoLabel: "አመራር",
      ceoTitle: "የኢትዮጵያን የፈጠራ መፃኢ እድል መቅረጽ",
      ceoName: "በረከት ዮሴፍ",
      ceoRole: "መስራች እና ስራ አስፈፃሚ",
      ceoBio: "በረከት ዮሴፍ በኢቨንት ፕሮዳክሽን እና በብራንድ ስትራቴጂ ዘርፍ ከ10 ዓመታት በላይ ልምድ ያለው የየነገ መስራች እና ስራ አስፈፃሚ ነው።",
      joinCohort: "አካደሚውን ይቀላቀሉ",
      contactLead: "አመራሩን ያግኙ",
      check1: "የተዋቀረ እቅድ እና የአጋሮች መመሪያ ስርዓት",
      check2: "የፋይናንስ ስትራቴጂ እና የገቢ ዘላቂነት ሞዴል",
      check3: "የቦታ ዲዛይን፣ የመድረክ ዝግጅት እና የድምፅ ቴክኖሎጂ",
      check4: "ኢትዮጵያን ከአለም አቀፍ ታዳሚ ጋር የሚያገናኝ የሃይብሪድ ስራ",
    },
    contact: {
      label: "ያግኙን",
      title: "የሚቀጥለውን ታሪክዎን አብረን እንስራ",
      subtitle: "የማይረሳ ገጠመኝ አብረን እንቅረፅ",
      desc: "ስለ ኢቨንት ማዘጋጀት፣ ስለ ስፖንሰርሺፕ ስትራቴጂ ወይም አካደሚውን ስለመቀላቀል ጥያቄ አለዎት? የነገ ቡድን እርስዎን ለመርዳት ዝግጁ ነው።",
      headStudioTitle: "ዋና ቢሮ እና ስቱዲዮ",
      emailEnquiriesTitle: "የኢሜይል ጥያቄዎች",
      phoneHotlineTitle: "የቀጥታ ስልክ እና ድጋፍ",
      officialChannelsTitle: "ኦፊሴላዊ የማህበራዊ ገጾች",
      formTitle: "ቀጥታ መልዕክት ይላኩ",
      formSub: "መረጃዎን ያስገቡ፤ መልዕክትዎ ተዘጋጅቶ በዋትስአፕ በቀጥታ ወደ ቡድናችን ይላካል።",
      name: "ሙሉ ስም",
      email: "ኢሜይል አድራሻ",
      phone: "ስልክ ቁጥር",
      message: "መልዕክት ወይም ጥያቄ",
      send: "በዋትስአፕ መልዕክት ይላኩ",
      waSuccess: "የዋትስአፕ ውይይት ተጀምሯል! ለመላክ የዋትስአፕ መስኮቱን ይመልከቱ።",
    },
    notFound: {
      title: "ገጹ አልተገኘም",
      subtitle: "ይቅርታ! የፈለጉት ገጽ የለም።",
      description: "ገጹ ተሰርዞ፣ ተለውጦ ወይም የተሳሳተ ሊንክ ተጠቅመው ሊሆን ይችላል።",
      goHome: "ወደ መነሻ ገጽ",
      goBack: "ተመለስ",
      lookingFor: "ምናልባት እነዚህን ፈልገው ሊሆን ይችላል:",
    },
    eventsPage: {
      title: "የነገ ኢቨንቶች እና መድረኮች",
      subtitle: "በኢትዮጵያ ውስጥ ያሉ ምርጥ የንግድ እና የባህል ዝግጅቶች",
      all: "ሁሉም ዝግጅቶች",
      upcoming: "የሚመጡ ዝግጅቶች",
      past: "ያለፉ ዝግጅቶች",
      register: "አሁኑኑ ይመዝገቡ",
      details: "ዝርዝር መረጃ ይመልከቱ",
      noEvents: "በዚህ ዘርፍ በአሁኑ ጊዜ የተመዘገበ ዝግጅት የለም።",
      filterCategory: "የዝግጅት አይነት ይምረጡ",
      date: "ቀን",
      location: "ቦታ",
      searchPlaceholder: "በስም፣ በዘርፍ ወይም በከተማ ይፈልጉ...",
      clearFilters: "ማጣሪያውን አፅዳ",
      hostWithUs: "ከእኛ ጋር ያዘጋጁ",
      wantToHost: "ልዩ ኢቨንት ማዘጋጀት ይፈልጋሉ?",
      submitBriefDesc: "የቴክኒክ ብቃት፣ የበጀት መዋቅር እና የኦፕሬሽን ROIን ባለሙያዎቻችን እንዲገመግሙት የኢቨንት ጥያቄ ቅጽ ያስገቡ።",
      submitBriefBtn: "የኢቨንት ጥያቄ ያስገቡ",
      waInquiry: "በዋትስአፕ ይጠይቁ",
      free: "ነፃ / Free",
    },
    masterclassPage: {
      title: "የነገ አካደሚ ማስተር ክላስ",
      subtitle: "የ8 ሳምንታት ፕሮፌሽናል የኢቨንት ፕላኒንግ እና ዲዛይን ስልጠና",
      enrollNow: "አሁኑኑ ይመዝገቡ",
      programOverview: "የስልጠናው አጠቃላይ መግለጫ",
      schedule: "የስልጠና ጊዜ እና መርሃ-ግብር",
      curriculum: "የትምህርት ይዘት",
      tuition: "የስልጠና ክፍያ እና ፓኬጆች",
      certifiedCohort: "በእውቅና ማረጋገጫ የታገዘ ስልጠና",
      question6Label: "የስልጠና ክፍለ-ጊዜ ይምረጡ (ጥያቄ 6)",
      applyHeader: "የማስተር ክላስ መመዝገቢያ ቅጽ",
      whyChooseTitle: "የዘርፉን መሪዎች ለመቅረጽ የተዘጋጀ",
      whyChooseSubtitle: "የኢቨንት ፕላኒንግ፣ የቡድን ስራ እና አፈጻጸምን በአንድ ምቹ አካባቢ ለመማር የሚያስፈልግዎት ነገር ሁሉ።",
      featuredPrograms: "የተመረጡ የስልጠና ፕሮግራሞች",
      exploreTitle: "የማስተር ክላስ ስልጠናዎችን ይመልከቱ",
      exploreSubtitle: "ተስማሚ ስልጠና መርጠው ሙያዎን ዛሬውኑ ያሳድጉ።",
      gotQuestions: "ጥያቄዎች አሉዎት?",
      faqTitle: "ተደጋግመው የሚጠየቁ ጥያቄዎች",
      startLearningTitle: "ዛሬ ተማሩ፤ ነገን መሩ።",
      startLearningSubtitle: "በኢትዮጵያ ውስጥ ከብዙ ሰልጣኞች ጋር በመቀላቀል የኢቨንት አመራር ብቃትን ያዳብሩ።",
      satisfaction: "የሰልጣኞች እርካታ",
      topRated: "ከፍተኛ ደረጃ የተሰጠው አካደሚ",
      practicalDrills: "የተግባር ልምምድ",
      digitalLive: "ኦንላይን + በቀጥታ ዝግጅቶች",
      verifiedCerts: "የተረጋገጠ ሰርተፍኬት",
      cvReady: "ለCV እና ለሊንክድኢን የሚሆን",
      programLength: "የስልጠናው ቆይታ",
      cohortLength: "የ8 ሳምንታት አጠቃላይ ስልጠና",
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
      tagline: "Mastery in Experience Architecture",
      specialEvents: "Special Events",
      description: "We design curated business environments and strategic navigation systems — from elite corporate programs to custom travel systems. By pairing rigorous planning with precision experience architecture, we turn complex visions into measurable strategic assets.",
      exploreEvents: "Request a Strategic Consultation",
      contactWa: "Inquire for Corporate Activation",
    },
    home: {
      academyLabel: "Special Training",
      academyTitle: "Learn the Art of Event Architecture.",
      academyDesc: "East Africa's most comprehensive event training program. From logistics to live execution — we build the next generation of certified event architects.",
      featureCert: "Professional Certification",
      featureMasterclass: "Hands-on Masterclasses",
      featureProjects: "Real-world Projects",
      featureMentors: "Industry Mentors",
      enrollNow: "Enroll Now",
      seeMasterclass: "See Masterclass",
      communityMembers: "Community Members",
      studentRating: "Student Rating",
      eliteCircleTitle: "Join the Elite Circle.",
      eliteCircleDesc: "Limiting enrollment to a Founding 50 allows for high-touch mentorship and 100% mastery in experience mapping and ROI modeling.",
      curatedExperiences: "Curated Experiences",
      featuredEvents: "Featured Events",
      viewAll: "View All",
      distinctionLabel: "The Yenege Distinction",
      distinctionTitle: "Our Journey of Excellence.",
      distinctionDesc: "Our methodology is a continuous cycle of innovation, education, and proven results.",
      step1Title: "Architectural Mastery",
      step1Desc: "We design experience systems where every detail is intentional and every moment is impactful.",
      step2Title: "Educational Core",
      step2Desc: "As home to East Africa's leading Event Academy, our team stays at the industry's absolute forefront.",
      step3Title: "Hybrid Delivery",
      step3Desc: "We host one event and reach two audiences — connecting Addis Ababa to the global Ethiopian diaspora.",
      step4Title: "Verified Footprint",
      step4Desc: "Thousands of successful events and a community spanning the globe — our track record speaks for itself.",
      unityBadge: "Yenege Unity",
      unityTitle: "Curated Access. Premium Connections.",
      unityDesc: "A curated business environment designed strictly for strategic partnerships and brand visibility. Elevate your enterprise and connect directly with key decision-makers.",
      exploreUnity: "Explore Yenege Unity",
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
      label: "OUR STORY & PHILOSOPHY",
      title: "About Yenege",
      subtitle: "Architecting East Africa's Experience Economy",
      description: "Yenege is an experience architecture studio and event leadership academy headquartered in Addis Ababa, Ethiopia.",
      originLabel: "THE YENEGE ORIGIN",
      originQuote: "Many Attend Events.",
      originQuoteSub: "Few Architect Them.",
      originDesc: "Yenege was born in Addis Ababa from a vision to bring world-class precision to the art of human gathering. We believe events should be engineered with strategic rigor, financial clarity, and emotional resonance.",
      exec: "Professional Execution",
      execDesc: "High-level event production, sound design, spatial architecture, and multi-venue logistics management.",
      edu: "Executive Education",
      eduDesc: "East Africa's premier academy training the next generation of certified event directors and project leads.",
      comm: "Vibrant Community",
      commDesc: "A collaborative ecosystem uniting corporate clients, creatives, vendors, and international event organizers.",
      missionTitle: "OUR MISSION",
      missionHeading: "Empowering Tomorrow Through Strategic Precision",
      missionDesc: "Empowering Tomorrow through Strategic Management, Experience Architecture, and Production Precision.",
      visionTitle: "OUR VISION",
      visionHeading: "Becoming East Africa's Premier Experience Architect",
      visionDesc: "Becoming East Africa’s premier 'Experience Economy' architect, shaping a generation of opportunity-ready creative leaders.",
      ceoLabel: "LEADERSHIP",
      ceoTitle: "Crafting Ethiopia's Creative Future",
      ceoName: "Bereket Yosef",
      ceoRole: "Founder & Executive Director",
      ceoBio: "Bereket Yosef is a visionary strategist and the architect behind YENEGE. With over a decade of experience in high-level event production, strategic logistics, and brand architecture, he is dedicated to professionalizing the experience industry in East Africa.",
      joinCohort: "Join Academy Cohort",
      contactLead: "Contact Leadership",
      check1: "Structured planning & vendor governance frameworks",
      check2: "Financial strategy and revenue sustainability modeling",
      check3: "Spatial design, staging, and technical audiovisual production",
      check4: "Hybrid event delivery connecting Ethiopia to global audiences",
    },
    contact: {
      label: "CONNECT WITH OUR TEAM",
      title: "Let's Architect Your Next",
      subtitle: "Unforgettable Experience",
      desc: "Have a question about event execution, sponsorship strategy, or enrolling in Yenege Academy? We are here to help.",
      headStudioTitle: "Our Head Studio",
      emailEnquiriesTitle: "Email Enquiries",
      phoneHotlineTitle: "Direct Line & Support",
      officialChannelsTitle: "Official Channels",
      formTitle: "Send Us a Direct Message",
      formSub: "Fill in your details below. Your message will be formatted and sent directly to our team via WhatsApp for an immediate response.",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Message or Inquiry",
      send: "Send Message Via WhatsApp",
      waSuccess: "WhatsApp conversation initiated! Check your WhatsApp window to send.",
    },
    notFound: {
      title: "Page Not Found",
      subtitle: "Oops! The page you're looking for doesn't exist.",
      description: "It might have been moved, deleted, or you entered the wrong URL.",
      goHome: "Go to Homepage",
      goBack: "Go Back",
      lookingFor: "You might be looking for:",
    },
    eventsPage: {
      title: "Yenege Events & Experiences",
      subtitle: "Curated business networking and luxury lifestyle experiences",
      all: "All Events",
      upcoming: "Upcoming Events",
      past: "Past Events",
      register: "Register Now",
      details: "View Details",
      noEvents: "No events currently available in this category.",
      filterCategory: "Filter by Category",
      date: "Date",
      location: "Location",
      searchPlaceholder: "Search by name, category or city...",
      clearFilters: "Clear Filters",
      hostWithUs: "Host With Us",
      wantToHost: "Want to Host an Exceptional Event?",
      submitBriefDesc: "Submit a feasibility brief and let our experience architects assess technical viability, budget structure, and operational ROI.",
      submitBriefBtn: "Submit Event Brief",
      waInquiry: "WhatsApp Inquiry",
      free: "Free",
    },
    masterclassPage: {
      title: "Yenege Academy Masterclass",
      subtitle: "8-Week Intensive Event Planning & Experience Architecture Program",
      enrollNow: "Enroll Now",
      programOverview: "Program Overview",
      schedule: "Class Schedule & Sessions",
      curriculum: "Curriculum Modules",
      tuition: "Tuition & Packages",
      certifiedCohort: "Certified Professional Cohort",
      question6Label: "Preferred Session Schedule (Question 6)",
      applyHeader: "Masterclass Application Form",
      whyChooseTitle: "Designed to Build Industry Leaders",
      whyChooseSubtitle: "Everything you need to master event planning, teamwork, and execution in one complete learning environment.",
      featuredPrograms: "Featured Programs",
      exploreTitle: "Explore Masterclasses",
      exploreSubtitle: "Select a course and start your transformation today.",
      gotQuestions: "Got Questions?",
      faqTitle: "Frequently Asked Questions",
      startLearningTitle: "Start Learning Today. Lead Tomorrow.",
      startLearningSubtitle: "Join students mastering event leadership across Ethiopia. Flexible learning, local payment, and certified credentials.",
      satisfaction: "Satisfaction Rate",
      topRated: "Top-rated academy",
      practicalDrills: "Practical Drills",
      digitalLive: "Digital + Live Events",
      verifiedCerts: "Verified Certificates",
      cvReady: "CV & LinkedIn Ready",
      programLength: "Program Length",
      cohortLength: "8 Weeks Comprehensive Cohort",
    },
  },
  om: {
    header: {
      skipMain: "Gara Qabiyyee Ijoo Darbi",
      wa: "WhatsApp",
      home: "Fuula Duree",
      events: "Qophiiwwan",
      masterclass: "Mastaarkilaasii",
      about: "Waa'ee Keenyaa",
      contact: "Nu Quunnamaa",
    },
    hero: {
      tagline: "Ijaarsa Muxannoo Bifa Ogummaa Ol'aanaan",
      specialEvents: "Qophiiwwan Addaa",
      description: "Nuun sirna ijaarsa muxannoo hammayyaa fi dandeettii karoorsuuf barnoota teeknikaa sagantaalee gurguddoo dhiheessina — sagantaalee dhaabbatoota irraa kaasee hanga toora daldala addaatti.",
      exploreEvents: "Mareijatama Toora Karoorawwan Keenyaa",
      contactWa: "Gaaffii Qophii Dhaabbataa Dhiheessaa",
    },
    home: {
      academyLabel: "Leenjii Addaa · Special Training",
      academyTitle: "Ogummaa Ijaarsa Qophii Baradhaa",
      academyDesc: "Baha Afrikaatti sagantaa leenjii qophii isa bal'aa fi hammayyaa. Lojistikii irraa kaasee hanga raawwii kallattiitti — ogeessota qophii boruu leenjifna.",
      featureCert: "Waraqaa Ragaa Ogummaa",
      featureMasterclass: "Mastaarkilaasii Shaakalaa",
      featureProjects: "Pirojektoota Dhugaa",
      featureMentors: "Leenjistoota Ogummaa",
      enrollNow: "Amma Galmaa'aa",
      seeMasterclass: "Mastaarkilaasii Ilaalaa",
      communityMembers: "Hawaasni",
      studentRating: "Sadarkaa Barattootaa",
      eliteCircleTitle: "Kutaa Hawaasa Ogummaa Ol'aanaatti Makamaa",
      eliteCircleDesc: "Galmee barattoota 50 qofaaf daangessuun hordoffii gahaa fi ogummaa Ijaarsa Muxannoo 100% leenjisuuf nu gargaara.",
      curatedExperiences: "Muxannoowwan Filataman",
      featuredEvents: "Qophiiwwan Ijoo",
      viewAll: "Hunda Ilaalaa",
      distinctionLabel: "Garaagarummaa Yenege",
      distinctionTitle: "Imala Keenya Ogummaa Ol'aanaa",
      distinctionDesc: "Adeemsi hojii keenya haaraomsa, barnoota fi bu'aa mirkanaa'e irratti kan hundaa'e dha.",
      step1Title: "Ijaarsa Ogummaa Ol'aanaa",
      step1Desc: "Sirna muxannoo kan tokkoon tokkoo fakkii isaa karoorfame fi dhiibbaa uumu ijaarrah.",
      step2Title: "Giddougaleessa Barnootaa",
      step2Desc: "Akaadaamii Qophii Baha Afrikaa isa dursaa ta'uu keenyaan, gareen keenya yeroo hunda saayinsii qophiitiin dursee jira.",
      step3Title: "Dhiheessa Waliigalaa",
      step3Desc: "Qophii tokko qopheessuun bakka duukaa lamas gahuu — Finfinnee hawaasa Itoophiyaa addunyaa waliin walquunnamsiisuu.",
      step4Title: "Mirkanaa'ina Faana Keenyaa",
      step4Desc: "Qophiiwwan libaa kumaatamaan lakka'aman fi hawaasa addunyaa irra jiru — ragaan hojii keenyaa nuhadiha.",
      unityBadge: "Yenege Unity",
      unityTitle: "Seensa Addaa. Quunnamsiisa Sadarkaa Ol'aanaa.",
      unityDesc: "Waltajjii daldalaa qophaa'e kan tumsa strateejii fi beeksisa dhaabbataaf oolu. Dhaabbata keessan ol-kaasaa.",
      exploreUnity: "Yenege Unity Daawwadhaa",
    },
    stats: {
      happyMembers: "Ijaartota Ragaa Qaban",
      avgRating: "Sadarkaa Giddu-galeessaa",
      destinations: "Bakkeewwan",
    },
    portfolio: {
      title: "Hojiiwwan Keenya",
      subtitle: "Bakkeewwan Filataman, Yeroo Addaa",
      eventsTitle: "Qophiiwwan",
      eventsDesc: "Waltajjiiwwan daldalaa fi sagantaalee gurguddoo dandeettii karoorsuu.",
      communityTitle: "Hawaasa",
      communityDesc: "Hawaasa ijaartota qophii ragaa qabanitti makamaa. Muuxannoo qoodachuu fi tumsa uumaa.",
      discover: "Barkeessaa",
    },
    experiences: {
      title: "Muxannoowwan Argaman",
      noUpcoming: "Qophiin fuula duraa ammaan tana hin jiru.",
      curatingSpecial: "Qophii addaa qopheessaa jirra; yeroo biraa deebi'aadhaa ilaalaa.",
      explorePortfolio: "Hojiiwwan Keenya Ilaalaa",
    },
    academy: {
      title: "Leenjii Ogummaa",
      masterPlanning: "Karoora Qophii Baradhaa",
      joinProgram: "Sagantaa leenjii torban 8 irretti hirmaachuun waraqaa ragaa argadhaa. Dandeettii qophii hammayyaa gonfadhaa.",
      feature8weeks: "Leenjii shaakalaa torban 8",
      featureRealPlanning: "Guyyaa jalqabaa irraa kaasee shaakala qophii dhugaa",
      featureCert: "Waraqaa ragaa beekamtii qabu",
      joinMasterclass: "Mastaarkilaasitti Makamaa",
      nextCohort: "Sagantaan itti aanu dhiyootti jalqaba",
    },
    strategy: {
      title: "Galii fi Toftaa",
      subtitle: "Business & Strategy",
      isFeasible: "Yaadni Qophii Kee Bu'aa Ni Qabaa?",
      beforeInvest: "Qabeenya keessan invesiti gochuun dura bu'a-qabeessummaa isaa ogessoota keenyaan qorachiisaa.",
      consult: "Ogeessota Keenya Mariyachiisaa",
      roiFocus: "Bu'aa Irretti Xiyyeeffate",
      marketAnalysis: "Qorannoo Gabaa",
    },
    gallery: {
      title: "Galaana Suuraa Keenya",
      subtitle: "Muxannoowwan fi yeroo gaarii keenya daawwadhaa",
      wedding: "Qophii Cidhaa",
      weddingDesc: "Bareechaa fi kan hin irraanfatamne.",
      private: "Ayyaaneffannoo Dhuunfaa",
      privateDesc: "Guyyaa dhalootaa fi sagantaalee addaa.",
      corporate: "Qophii Dhaabbatootaa",
      corporateDesc: "Sadarkaa ogummaa ol'aanaa.",
    },
    footer: {
      description: "Sirna ijaarsa muxannoo dhiibbaa qabu sagantaalee fi hirmaannaa hawaasaatiin ijaaruu.",
      quickLinks: "Liinkiwwan Saffisaa",
      contact: "Nu Quunnamaa",
      stayUpdated: "Odeeffannoo Haaraa",
      subscribe: "Galmaa'aa",
      subscribePlaceholder: "Imeelii keessan galchaa",
      subscribeText: "Odeeffannoo qophii haaraa argachuuf galmaa'aa.",
      allRights: "Mirgi hundi seeraan kan eegame dha.",
      privacy: "Imoo Qabiyyee Dhuunfaa",
      terms: "Seera fi Haala Fayyadamaa",
    },
    cta: {
      readyBegin: "Jalqabuuf Qophiidhaa?",
      readyJoin: "Hawaasa Ogummaa Ol'aanaatti Makamuuf Qophiidhaa?",
      bePartOf: "Kutaa hawaasa ijaarsa muxannoo fi karoora qophii ogummaa ol'aanaa qabu ta'aa.",
    },
    about: {
      label: "SEENAA FI FILOSOFII KEENYA",
      title: "Sabaaba Yenege",
      subtitle: "Diinagdee Muxannoo Baha Afrikaa Ijaaruu",
      description: "Yenege waltajjii ijaarsa muxannoo fi akaadaamii leenjii qophii teessoo isaa Finfinnee godhate dha.",
      originLabel: "MALA YENEGE",
      originQuote: "Baay'een Qophii Irratti Argamu.",
      originQuoteSub: "Mata-duree Kan Ijaaru Muraasa.",
      originDesc: "Yenege wal-gahii fi qophiilee uummataa sadarkaa ol'aanaatti geggeessuuf abjuu qabateen Finfinnee keessatti hundaa'e.",
      exec: "Raawwii Ogummaa",
      execDesc: "Qophii dirree sadarkaa olaanaa, sagantaa fi lojistikii ammayyaa.",
      edu: "Leenjii Geggeessummaa",
      eduDesc: "Leenjisaa fi ogeessota qophii boruu leenjisuu.",
      comm: "Hawaasa Bayyee Dammaqaa",
      commDesc: "Waltajjii tumsa uummaafi ogeessotaa.",
      missionTitle: "ERGAMA KEENYA",
      missionHeading: "Karoora Sirriitiin Boruu Cimsuu",
      missionDesc: "Gulaala sirrii, qophii uumamaa fi raawwii guutuun boruu cimsuu.",
      visionTitle: "MUL'ATA KEENYA",
      visionHeading: "Baha Afrikaatti Ijaaraa Muxannoo Ol'aanaa Ta'uu",
      visionDesc: "Baha Afrikaatti giddala qophii fi hojii seenaa ta'uu.",
      ceoLabel: "GEGGEESSUMMAA",
      ceoTitle: "Gara Boruu Uumamaa Itoophiyaa Ijaaruu",
      ceoName: "Barekat Yoseef",
      ceoRole: "Hundessaa fi Daarektara Raawwachiisaa",
      ceoBio: "Barekat Yoseef waggoota 10 oliif leenjii fi qophii dirree irratti muuxannoo kan qabu hundessaa Yenege ti.",
      joinCohort: "Akaadaamiitti Makamaa",
      contactLead: "Geggeessitoota Quunnamaa",
      check1: "Qajeelfama karoora fi bulchiinsa ogeessotaa",
      check2: "Strateejii faayinaansii fi wabii galii",
      check3: "Ijaarsa waltajjii fi teknoolojii sagantaa",
      check4: "Qophii intarneetii Itoophiyaa addunyaatti hidhu",
    },
    contact: {
      label: "GAREEN KEENYA WALIIN WAL QUUNNAMAA",
      title: "Seenaa Keessan Itti Aanu Waliin",
      subtitle: "Muxannoo Hin Dagatamne Haaijaarru",
      desc: "Gaffii waa'ee qophii, strateejii sponsorship yookiin leenjii Yenege Academy qabduu? Nu quunnamaa.",
      headStudioTitle: "Studio Keessoo Keenya",
      emailEnquiriesTitle: "Gaaffii Imeelii",
      phoneHotlineTitle: "Bilbila Kallattii fi Deeggarsa",
      officialChannelsTitle: "Kalaalaasota Seeraa",
      formTitle: "Ergaa Kallattii Ergadhaa",
      formSub: "Odeeffannoo keessan galchaa; ergaan keessan kallattiin WhatsApp-iin garee keenyaf ni ergama.",
      name: "Maqaa Guutuu",
      email: "Teessoo Imeelii",
      phone: "Lakk. Bilbilaa",
      message: "Ergaa yookiin Gaaffii",
      send: "WhatsApp-iin Ergaa",
      waSuccess: "Mariin WhatsApp jalqabameera! Erguuf foddaa WhatsApp keessan sakatta'aa.",
    },
    notFound: {
      title: "Fuulli Hin Argamne",
      subtitle: "Dhiifama! Fuulli barbaaddan hin jiru.",
      description: "Maneen kun moodeffameera yookiin teessoo dogoggoraa galchitan.",
      goHome: "Gara Fuula Duree",
      goBack: "Deebi'aa",
      lookingFor: "Tarii kanneen barbaadaa jirtu ta'a:",
    },
    eventsPage: {
      title: "Qophiiwwan Yenege",
      subtitle: "Qophiiwwan daldalaa fi aadaa Itoophiyaa keessatti qopha'an",
      all: "Qophiiwwan Hunda",
      upcoming: "Qophiiwwan Gara Fuulduraa",
      past: "Qophiiwwan Darban",
      register: "Amma Galmaa'aa",
      details: "Odeeffannoo Guutuu Ilaalaa",
      noEvents: "Qophiin toora kanaa ammaan tana hin jiru.",
      filterCategory: "Gosa Qophiitiin Filadhaa",
      date: "Guyyaa",
      location: "Bakka",
      searchPlaceholder: "Maqaa, gosa ykn magaalaan barbaadaa...",
      clearFilters: "Filannoowwan Qulqulleessi",
      hostWithUs: "Nu Waliin Qopheessaa",
      wantToHost: "Qophii Addaa Qopheessuu Barbaaduu?",
      submitBriefDesc: "Bu'a-qabeessummaa, baajata fi toftaa qophii keessanii ogeessota keenyaan qorachiisuuf uunka dhiheessaa.",
      submitBriefBtn: "Ergaa Qophii Dhiheessaa",
      waInquiry: "WhatsApp-iin Nu Quunnamaa",
      free: "Bilisaa / Free",
    },
    masterclassPage: {
      title: "Mastaarkilaasii Akaadaamii Yenege",
      subtitle: "Leenjii Ogummaa Karoora Qophii Torban 8",
      enrollNow: "Amma Galmaa'aa",
      programOverview: "Waa'ee Sagantaa",
      schedule: "Yeroo fi Sagantaa Leenjii",
      curriculum: "Qabiyyee Barnootaa",
      tuition: "Kaffaltii Leenjii",
      certifiedCohort: "Sagantaa Ragaa Beekamtii",
      question6Label: "Filannoo Yeroo Leenjii (Gaaffii 6)",
      applyHeader: "Uunka Galmee Mastaarkilaasii",
      whyChooseTitle: "Dursootas Qophii Ijaaruuf Kan Qophaa'e",
      whyChooseSubtitle: "Garaagartummaa fi dandeettii karoorsuu, hojii garee fi raawwachiisa qophii iddoo tokkotti leenji'aa.",
      featuredPrograms: "Sagantaalee Filataman",
      exploreTitle: "Mastaarkilaasiiwwan Keenya Sakatta'aa",
      exploreSubtitle: "Koorsii isiniif ta'u filachuun ogummaa keessan har'a haaromsaa.",
      gotQuestions: "Gaaffii Qabduu?",
      faqTitle: "Gaaffiilee Yeroo Baay'ee Gaafataman",
      startLearningTitle: "Har'a Baradhaa. Boru Dursaa.",
      startLearningSubtitle: "Hirmaattota Itoophiyaa keessaa waliin ogummaa dursoommaa qophii baradha.",
      satisfaction: "Sadarkaa Gammachuu",
      topRated: "Akaadaamii Filatamaa",
      practicalDrills: "Shaakala Dhugaa",
      digitalLive: "Interneetiin + Qophii Dhugaa",
      verifiedCerts: "Waraqaa Ragaa Beekamtii",
      cvReady: "CV fi LinkedIn-f Kan Ta'u",
      programLength: "Dheerina Leenjii",
      cohortLength: "Leenjii Guutuu Torban 8",
    },
  },
};
