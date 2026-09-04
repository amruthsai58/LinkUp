// LinkUp AI Social Post & Caption Generator Service
const OPENROUTER_API_KEY = typeof process !== 'undefined' && process.env?.VITE_OPENROUTER_API_KEY ? process.env.VITE_OPENROUTER_API_KEY : '';

export const AI_TONES = [
  { id: 'vibe', label: '🎧 Music & Vibe', emoji: '🎶', desc: 'Chill, rhythmic & melody-inspired' },
  { id: 'hype', label: '🔥 Mass & Hype', emoji: '💥', desc: 'Energetic, blockbuster movie mass feel' },
  { id: 'aesthetic', label: '✨ Aesthetic & Poetic', emoji: '🌅', desc: 'Thoughtful, nostalgic, poetic lines' },
  { id: 'casual', label: '💬 Casual & Friendly', emoji: '☕', desc: 'Everyday conversations with friends' },
  { id: 'funny', label: '😂 Humorous & Relatable', emoji: '🤣', desc: 'Witty, punchy, meme-style humor' },
  { id: 'tech', label: '🚀 Tech & Creative', emoji: '⚡', desc: 'Building, coding, and creative updates' },
];

export const AI_LANGUAGES = [
  { id: 'english', label: 'English', flag: '🌐' },
  { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)', flag: '🟡🔴' },
  { id: 'telugu', label: 'తెలుగు (Telugu)', flag: '🟠🟢' },
  { id: 'tamil', label: 'தமிழ் (Tamil)', flag: '🔴⚪' },
  { id: 'hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { id: 'malayalam', label: 'മലയാളം (Malayalam)', flag: '🌴' },
];

// Helper to sanitize language key
const normalizeLang = (lang) => {
  if (!lang) return 'english';
  const l = lang.toLowerCase();
  if (l.includes('kannada')) return 'kannada';
  if (l.includes('telugu')) return 'telugu';
  if (l.includes('tamil')) return 'tamil';
  if (l.includes('hindi')) return 'hindi';
  if (l.includes('malayalam')) return 'malayalam';
  return 'english';
};

/**
 * High-quality multi-language template engine
 */
function getLocalisedOptions(prompt, tone, lang) {
  const normLang = normalizeLang(lang);
  const cleanPrompt = (prompt || '').trim();

  // KANNADA
  if (normLang === 'kannada') {
    if (tone === 'hype') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} — ಮಾಸ್ ಎನರ್ಜಿ ಅನ್‌ಮ್ಯಾಚ್ಡ್! 🔥⚡ ಕ್ರಾಂತಿ ತರಹದ ರೋಷ, ಜೋಶ್ ನೆಕ್ಸ್ಟ್ ಲೆವೆಲ್! 🚀`
            : `ಮಾಸ್ ಎನರ್ಜಿ ಅನ್‌ಮ್ಯಾಚ್ಡ್! 🔥⚡ ಕ್ರಾಂತಿ ತರಹದ ರೋಷ, ಜೋಶ್ ನೆಕ್ಸ್ಟ್ ಲೆವೆಲ್! ಬಾಸ್ ವೈಬ್ಸ್ ಆನ್! 🚀`,
          feeling: 'ಫುಲ್ ಮಾಸ್ ಎನರ್ಜಿ 🔥',
          hashtags: ['#LinkUp', '#KannadaMass', '#BossVibes', '#KGFMass', '#SandalwoodHype'],
          suggestedMusic: 'Sulthana',
        },
        {
          caption: `ಎನರ್ಜಿ ಲೆವೆಲ್ 1000%! 💥 ರೌದ್ರಾವತಾರದ ಜೋಶ್, ತಡೆಯೋರೆ ಇಲ್ಲ! Let's conquer the day! 🦁⚡`,
          feeling: 'ಅನ್‌ಸ್ಟಾಪಬಲ್ 💥',
          hashtags: ['#LinkUp', '#KannadaVibes', '#MassBeats', '#Dheera'],
          suggestedMusic: 'Dheera Dheera',
        },
        {
          caption: `ಬೆಂಗಳೂರಿನ ರಸ್ತೆಗಳಲ್ಲಿ ಸೌಂಡ್ ಬಾಕ್ಸ್ ಬ್ಲಾಸ್ಟ್! 🔊🔥 ಸಖತ್ ಕಿಕ್ ಕೊಡುವ ಸಾಂಗ್ ಜೊತೆ ಫುಲ್ ಸ್ವಾಗ್! 🤙`,
          feeling: 'ಫುಲ್ ಕಿಕ್ 🤙',
          hashtags: ['#LinkUp', '#BangaloreSwag', '#KannadaHits'],
          suggestedMusic: 'Tagaru Banthu Tagaru',
        },
      ];
    }
    if (tone === 'aesthetic') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} 🌅✨ ಮಳೆಯ ಹನಿಗಳು, ಸಂಜೆಯ ಸೂರ್ಯಾಸ್ತ ಮತ್ತು ಕಿವಿಯಲ್ಲಿ ಇಂಪಾದ ಕನ್ನಡ ಮೆಲೋಡಿ... ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ! ☕🌧️`
            : `ಬೆಂಗಳೂರಿನ ತಂಪಾದ ಮಳೆ, ಬಿಸಿ ಫಿಲ್ಟರ್ ಕಾಫಿ ಮತ್ತು ಕಿವಿಯಲ್ಲಿ ಸುಮಧುರ ರಾಗ... ಜೀವನದ ಸುಂದರ ಕ್ಷಣಗಳು ☕🌧️✨`,
          feeling: 'ಶಾಂತಿ ಮತ್ತು ನೆಮ್ಮದಿ 🌧️',
          hashtags: ['#LinkUp', '#KannadaMelody', '#BangaloreRains', '#SandalwoodPeace'],
          suggestedMusic: 'Anisuthide',
        },
        {
          caption: `ಕಣ್ಣುಗಳಲ್ಲೇ ಕವಿತೆ ಬರೆಯುವ ಈ ಪ್ರಕೃತಿ ಸೌಂದರ್ಯ 🍃✨ ಮೌನದಲ್ಲೂ ಸಂಗೀತವಿದೆ, ಆಲಿಸುವ ಮನಸಿರಬೇಕಷ್ಟೇ. 🕊️`,
          feeling: 'ಕಾವ್ಯಾತ್ಮಕ ಮೂಡ್ ✨',
          hashtags: ['#LinkUp', '#BelakinaKavithe', '#NatureVibes', '#KannadaKavya'],
          suggestedMusic: 'Belakina Kavithe',
        },
        {
          caption: `ಸಂಜೆಯ ತಂಗಾಳಿಗೆ ಮನಸು ತೇಲಾಡುತ್ತಿದೆ 🌅🎶 ನೆನಪುಗಳ ಮೆರವಣಿಗೆಯಲ್ಲಿ ಸುಂದರ ಪಯಣ.`,
          feeling: 'ನಾಸ್ಟಾಲ್ಜಿಕ್ ಮೆಲೋಡಿ 🎶',
          hashtags: ['#LinkUp', '#GoldenHour', '#KannadaSong'],
          suggestedMusic: 'Singara Siriye',
        },
      ];
    }
    if (tone === 'tech') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} 💻⚡ ಸಿಲಿಕಾನ್ ಸಿಟಿ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಲೇಟ್ ನೈಟ್ ಕೋಡಿಂಗ್ ವೈಬ್ಸ್! ಬಗ್ಸ್ ಫಿಕ್ಸ್, ಹೊಸ ಫೀಚರ್ಸ್ ಲೈವ್! 🚀`
            : `ಸಿಲಿಕಾನ್ ಸಿಟಿ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಲೇಟ್ ನೈಟ್ ಕೋಡಿಂಗ್ ವೈಬ್ಸ್! 💻⚡ ಕಾಫಿ ಕಪ್ ಜೊತೆ ಹೊಸ ಇನೋವೇಶನ್! ☕🚀`,
          feeling: 'ಕೋಡಿಂಗ್ ಮೋಡ್ ಆನ್ ⚡',
          hashtags: ['#LinkUp', '#NammaBengaluru', '#BangaloreTech', '#KannadaCoders'],
          suggestedMusic: 'Kantara Theme',
        },
        {
          caption: `ಕನಸುಗಳನ್ನು ಕೋಡ್ ಮಾಡ್ತಾ, ರಿಯಾಲಿಟಿಯಾಗಿ ಬಿಲ್ಡ್ ಮಾಡ್ತಾ... ನಮ್ಮ ಕಾಯಕವೇ ಕೈಲಾಸ! 🛠️✨`,
          feeling: 'ಕ್ರಿಯೇಟಿವ್ ಫ್ಲೋ 💡',
          hashtags: ['#LinkUp', '#FullStackKannada', '#BuildInPublic'],
          suggestedMusic: 'Singara Siriye',
        },
        {
          caption: `ಟರ್ಮಿನಲ್‌ನಲ್ಲಿ ಗ್ರೀನ್ ಟೆಕ್ಸ್ಟ್, ಕಿವಿಯಲ್ಲಿ ಸಾಂಗ್ಸ್, ಮನಸ್ಸಿನಲ್ಲಿ ನೆಕ್ಸ್ಟ್ ಬಿಗ್ ಐಡಿಯಾ! 🚀🔥`,
          feeling: 'ಪ್ರಾಡಕ್ಟಿವ್ ಮೂಡ್ 💻',
          hashtags: ['#LinkUp', '#TechLife', '#BangaloreDevs'],
          suggestedMusic: 'Sulthana',
        },
      ];
    }
    // Default Vibe / Casual
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🎶✨ ವೀಕೆಂಡ್ ವೈಬ್ಸ್ ಶುರು! ಸೂಪರ್ ಕನ್ನಡ ಟ್ರ್ಯಾಕ್ಸ್ ಜೊತೆ ಹೊಸ ಮೆಮೊರೀಸ್ ಕ್ರಿಯೇಟ್ ಮಾಡೋಣ! 🚀`
          : `ವೀಕೆಂಡ್ ವೈಬ್ಸ್ ಶುರು! 🎶✨ ಫೇವರಿಟ್ ಕನ್ನಡ ಹಾಡುಗಳ ಜೊತೆ ಫ್ರೆಂಡ್ಸ್ ಜೊತೆಗಿನ ಖುಷಿಯ ಸಮಯ! 🚀`,
        feeling: 'ಸಖತ್ ವೈಬ್ಸ್ 🎶',
        hashtags: ['#LinkUp', '#KannadaVibes', '#NammaKarnataka', '#WeekendMood'],
        suggestedMusic: 'Singara Siriye',
      },
      {
        caption: `ನಮ್ಮ ಊರು, ನಮ್ಮ ಹೆಮ್ಮೆ, ನಮ್ಮ ಸಾಂಗ್ಸ್! ❤️💛 ಪ್ರತಿಯೊಂದು ಕ್ಷಣದಲ್ಲೂ ಕನ್ನಡದ ಸಂಭ್ರಮ!`,
        feeling: 'ಹೆಮ್ಮೆಯ ಕನ್ನಡಿಗ ❤️💛',
        hashtags: ['#LinkUp', '#KarnatakaPride', '#KannadaHits'],
        suggestedMusic: 'Anisuthide',
      },
      {
        caption: `ಲೈಫ್ ಇರೋದೇ ಎಂಜಾಯ್ ಮಾಡೋಕೆ! 🌟 ಗುಡ್ ವೈಬ್ಸ್ ಓನ್ಲಿ, ನೋ ನೆಗೆಟಿವಿಟಿ! ಮಜಾ ಮಾಡಿ! 🤙`,
        feeling: 'ಚಿಲ್ ಮೂಡ್ ☕',
        hashtags: ['#LinkUp', '#GoodVibesKannada', '#LifeIsGood'],
        suggestedMusic: 'Belakina Kavithe',
      },
    ];
  }

  // TELUGU
  if (normLang === 'telugu') {
    if (tone === 'hype') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} — ఫుల్ మాస్ ఎనర్జీ! 🔥💥 రచ్చ రంబోలా బీట్స్, తగ్గేదే లే! 🚀`
            : `ఫుల్ మాస్ ఎనర్జీ! 🔥💥 బాక్స్ ఆఫీస్ బద్దలయ్యే రేంజ్ జోష్! తగ్గేదే లే! 🚀`,
          feeling: 'ఫుల్ మాస్ జోష్ 🔥',
          hashtags: ['#LinkUp', '#TeluguMass', '#ThaggedeLe', '#PushpaEnergy', '#TollywoodHype'],
          suggestedMusic: 'Devara Thandavam',
        },
        {
          caption: `ఎనర్జీ పీక్స్ లో ఉంది! 💥 బ్లాక్‌బస్టర్ మూడ్ ఆన్! లెట్స్ రాక్ ది డే! 🦁🔥`,
          feeling: 'అన్‌స్టాపబుల్ ఎనర్జీ ⚡',
          hashtags: ['#LinkUp', '#MassVibes', '#TeluguBeats', '#Blockbuster'],
          suggestedMusic: 'Ramuloo Ramulaa',
        },
        {
          caption: `హైదరాబాద్ రోడ్స్ పై ఫుల్ బీట్స్ తో స్పీడ్ డ్రైవ్! 🏎️🎶 రచ్చ లేపుదాం! 🤙`,
          feeling: 'ఫుల్ కిక్ 🤙',
          hashtags: ['#LinkUp', '#HyderabadVibes', '#TeluguHits'],
          suggestedMusic: 'Butta Bomma',
        },
      ];
    }
    if (tone === 'aesthetic') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} 🌅✨ సాయంత్రం వేళ, చల్లని గాలి మరియు చెవుల్లో మధురమైన తెలుగు పాట... మనసుకు ఎంతో ప్రశాంతత! ☕🌧️`
            : `సాయంత్రం వేళ, చల్లని గాలి మరియు చెవుల్లో మెలోడీ పాట... జీవితంలో చిన్న చిన్న ఆనందాలు ☕🌅✨`,
          feeling: 'మనసుకు ప్రశాంతత 🌅',
          hashtags: ['#LinkUp', '#TeluguMelody', '#Samajavaragamana', '#PeacefulVibes'],
          suggestedMusic: 'Samajavaragamana',
        },
        {
          caption: `కవితలాంటి ఈ సాయంత్రం, జ్ఞాపకాల అలలు 🍃✨ ప్రతి క్షణం ఒక మధుర భావన! 🕊️`,
          feeling: 'ఫీలింగ్ పొయెటిక్ ✨',
          hashtags: ['#LinkUp', '#TeluguKavitha', '#SunsetVibes'],
          suggestedMusic: 'Inkem Inkem',
        },
        {
          caption: `వర్షపు చినుకులు, వేడి టీ మరియు సిధ్ శ్రీరామ్ పాటలు ☕🌧️ ప్యూర్ మ్యాజిక్!`,
          feeling: 'వర్షపు జ్ఞాపకాలు 🌧️',
          hashtags: ['#LinkUp', '#RainyVibes', '#TeluguSong'],
          suggestedMusic: 'Priyathama',
        },
      ];
    }
    // Default Telugu Vibe
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🎶✨ వీకెండ్ వైబ్స్ అదిరిపోయాయి! మంచి మ్యూజిక్ తో ఫ్రెండ్స్ తో ఎంజాయ్ చేస్తున్నాం! 🚀`
          : `వీకెండ్ వైబ్స్ అదిరిపోయాయి! 🎶✨ సూపర్ తెలుగు ట్రాక్స్ తో రోజు సూపర్ పాజిటివ్! 🚀`,
        feeling: 'సూపర్ వైబ్స్ 🎶',
        hashtags: ['#LinkUp', '#TeluguVibes', '#WeekendFun', '#ManaTelugu'],
        suggestedMusic: 'Butta Bomma',
      },
      {
        caption: `మన స్నేహం, మన పాటలు, ఎప్పటికీ స్పెషల్! 🌟 మంచి వైబ్స్ తో ముందుకు సాగుదాం! 🤙`,
        feeling: 'హ్యాపీ మూడ్ 🌟',
        hashtags: ['#LinkUp', '#TeluguFriends', '#GoodTimes'],
        suggestedMusic: 'Samajavaragamana',
      },
      {
        caption: `జీవితం అంటే ఎంజాయ్ చేయడమే! ☕✨ నో టెన్షన్, ఓన్లీ పాజిటివ్ వైబ్స్! 🌈`,
        feeling: 'చిల్ ఫీలింగ్ ☕',
        hashtags: ['#LinkUp', '#PositiveLife', '#TollywoodBeats'],
        suggestedMusic: 'Inkem Inkem',
      },
    ];
  }

  // TAMIL
  if (normLang === 'tamil') {
    if (tone === 'hype') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} — வெறித்தனம் மாஸ் எனர்ஜி! 🔥💥 அனிருత్ பீட்ஸ் ஆன், எவன் தடுத்தாலும் நிக்காது! 🚀`
            : `வெறித்தனம் மாஸ் எனர்ஜி! 🔥💥 தலைவர் வைப்ஸ், தியேட்டர் அதிரும் பீட்ஸ்! ஹுக்கும்! 🚀`,
          feeling: 'வெறித்தனம் மாஸ் 🔥',
          hashtags: ['#LinkUp', '#TamilMass', '#Hukum', '#ThalaivarVibes', '#KollywoodHype'],
          suggestedMusic: 'Hukum',
        },
        {
          caption: `எனர்ஜி லெவல் உச்சக்கட்டம்! 💥 தளபதி & அனிருத் காம்போ மாதிரி மரண மாஸ்! 🔥🦁`,
          feeling: 'அட்டகாசம் 💥',
          hashtags: ['#LinkUp', '#ArabicKuthu', '#KollywoodBeats', '#MassMood'],
          suggestedMusic: 'Arabic Kuthu',
        },
        {
          caption: `சென்னை சாலைகளில் சவுண்ட் சிஸ்டம் பிளாஸ்ட்! 🔊🔥 தெறிக்க விடுவோமா! 🤙`,
          feeling: 'ஃபுல் தெறிப்பு 🤙',
          hashtags: ['#LinkUp', '#ChennaiSwag', '#TamilHits'],
          suggestedMusic: 'Naa Ready',
        },
      ];
    }
    if (tone === 'aesthetic') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} 🌅✨ சென்னையின் இதமான மாலை, காற்றில் கலக்கும் இளையராஜா ராகம்... மனதிற்கு அமைதி! ☕🌧️`
            : `சென்னையின் இதமான மாலை, சூடான ஃபில்டர் காபி மற்றும் இளையராஜாவின் மெல்லிசை... வாழ்க்கையின் அழகான தருணங்கள் ☕🌅✨`,
          feeling: 'அமைதியான தருணம் 🌅',
          hashtags: ['#LinkUp', '#TamilMelody', '#IlaiyaraajaMagic', '#ChennaiMoments'],
          suggestedMusic: 'Naan Pizhai',
        },
        {
          caption: `கடற்கரை காற்று, கவிதையான சூரிய அஸ்தமனம் 🍃✨ இசைக்குள் மூழ்கும் இதயம்! 🕊️`,
          feeling: 'கவிதை மனநிலை ✨',
          hashtags: ['#LinkUp', '#MarinaVibes', '#TamilPoetry'],
          suggestedMusic: 'Megham Karukatha',
        },
        {
          caption: `மழைத்துளிகள் மற்றும் ஏ.ஆர். ரஹ்மான் இசை 🌧️🎶 தூய்மையான மேஜிக்!`,
          feeling: 'மழை நினைவுகள் 🌧️',
          hashtags: ['#LinkUp', '#ARRahman', '#TamilMusic'],
          suggestedMusic: 'Kaadhal Sadugudu',
        },
      ];
    }
    // Default Tamil Vibe
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🎶✨ வார இறுதி வைப்ஸ் ஆரம்பம்! சூப்பர் தமிழ் பாடல்களுடன் நண்பர்களுடன் கொண்டாட்டம்! 🚀`
          : `வார இறுதி வைப்ஸ் ஆரம்பம்! 🎶✨ பிடித்த தமிழ் பாடல்களுடன் இந்த நாள் அருமை! 🚀`,
        feeling: 'செம வைப்ஸ் 🎶',
        hashtags: ['#LinkUp', '#TamilVibes', '#WeekendFun', '#NammaTamil'],
        suggestedMusic: 'Hukum',
      },
      {
        caption: `நட்பும் இசையும் சேர்ந்தால் எப்போதுமே கொண்டாட்டம் தான்! 🌟 பாசிட்டிவ் வைப்ஸ் மட்டும்! 🤙`,
        feeling: 'மகிழ்ச்சியான நாள் 🌟',
        hashtags: ['#LinkUp', '#TamilFriends', '#GoodVibes'],
        suggestedMusic: 'Naan Pizhai',
      },
      {
        caption: `வாழ்க்கை வாழ்வதற்கே! ☕✨ நோ ஸ்ட்ரெஸ், ஒன்லி ஜாலி! 🌈`,
        feeling: 'சில் மூட் ☕',
        hashtags: ['#LinkUp', '#JollyLife', '#KollywoodHits'],
        suggestedMusic: 'Arabic Kuthu',
      },
    ];
  }

  // HINDI
  if (normLang === 'hindi') {
    if (tone === 'hype') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} — फुल जोश और धमाकेदार एनर्जी! 🔥💥 रुकने का तो सवाल ही नहीं उठता! 🚀`
            : `फुल जोश और धमाकेदार एनर्जी! 🔥💥 जब मूड हो ब्लॉकबस्टर, तो माहौल अपने आप सेट हो जाता है! 🚀`,
          feeling: 'फुल जोश और आग 🔥',
          hashtags: ['#LinkUp', '#HindiHype', '#FullJosh', '#BollywoodBeats'],
          suggestedMusic: 'Apna Bana Le',
        },
        {
          caption: `एनर्जी लेवल 1000%! 💥 लाइफ में स्वैग और बीट्स का तड़का जरूरी है! 🔥🦁`,
          feeling: 'रॉकिंग मूड 💥',
          hashtags: ['#LinkUp', '#DesiSwag', '#BlockbusterEnergy'],
          suggestedMusic: 'Kesariya',
        },
        {
          caption: `लाउड म्यूजिक, हाई स्पीड और दोस्तों की टोली! 🔊🔥 पार्टी तो अभी शुरू हुई है! 🤙`,
          feeling: 'पार्टी वाइब्स 🤙',
          hashtags: ['#LinkUp', '#PartyNight', '#HindiHits'],
          suggestedMusic: 'Tum Hi Ho',
        },
      ];
    }
    if (tone === 'aesthetic') {
      return [
        {
          caption: cleanPrompt
            ? `${cleanPrompt} 🌅✨ सुहाना मौसम, गर्म चाय की प्याली और रूहानी धुनें... दिल को सुकून! ☕🌧️`
            : `सुहाना मौसम, गर्म चाय की प्याली और अरिजीत के गाने... जिंदगी के खूबसूरत पल ☕🌅✨`,
          feeling: 'रूहानी सुकून 🌅',
          hashtags: ['#LinkUp', '#ChaiShai', '#Sukoon', '#HindiMelody'],
          suggestedMusic: 'Kesariya',
        },
        {
          caption: `खूबसूरत शाम, ढलता सूरज और यादों का सफर 🍃✨ हर लम्हे में एक नई दास्तान है! 🕊️`,
          feeling: 'शायराना मिजाज ✨',
          hashtags: ['#LinkUp', '#Shayari', '#GoldenHourHindi'],
          suggestedMusic: 'Tum Hi Ho',
        },
        {
          caption: `बारिश की बूँदें और दिल को छू लेने वाला संगीत 🌧️🎶 ज़िंदगी बेहद हसीन है!`,
          feeling: 'बरसात का अहसास 🌧️',
          hashtags: ['#LinkUp', '#RainLovers', '#BollywoodAcoustic'],
          suggestedMusic: 'Apna Bana Le',
        },
      ];
    }
    // Default Hindi Vibe
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🎶✨ वीकेंड वाइब्स ऑन! अच्छे गाने, बेहतरीन दोस्त और ढेर सारी खुशियाँ! 🚀`
          : `वीकेंड वाइब्स ऑन! 🎶✨ अच्छे गाने, बेहतरीन दोस्त और पॉजिटिव एनर्जी! 🚀`,
        feeling: 'मस्त वाइब्स 🎶',
        hashtags: ['#LinkUp', '#HindiVibes', '#WeekendMasti', '#DesiTadka'],
        suggestedMusic: 'Kesariya',
      },
      {
        caption: `दोस्ती और संगीत का साथ हमेशा खास होता है! 🌟 सिर्फ पॉजिटिव वाइब्स! 🤙`,
        feeling: 'खुशनुमा पल 🌟',
        hashtags: ['#LinkUp', '#Dosti', '#GoodTimes'],
        suggestedMusic: 'Apna Bana Le',
      },
      {
        caption: `जिंदगी को खुलकर जियो! ☕✨ मुस्कुराओ और हर लम्हे का लुत्फ उठाओ! 🌈`,
        feeling: 'चिल मूड ☕',
        hashtags: ['#LinkUp', '#Zindagi', '#HindiHits'],
        suggestedMusic: 'Tum Hi Ho',
      },
    ];
  }

  // MALAYALAM
  if (normLang === 'malayalam') {
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🌴🌧️ മഴയും കാപ്പിയും നല്ലൊരു മെലഡിയും... വേറെ ലെവൽ ഫീലിംഗ്! ☕✨`
          : `മഴയും കാപ്പിയും നല്ലൊരു മെലഡിയും... മനസ്സിന് കുളിർമയേകുന്ന മനോഹര നിമിഷങ്ങൾ! ☕🌧️✨`,
        feeling: 'കുളിർമയേകുന്ന മൂഡ് 🌧️',
        hashtags: ['#LinkUp', '#MalayalamVibes', '#KeralaRains', '#MalluGram'],
        suggestedMusic: 'Singara Siriye',
      },
      {
        caption: `വേറെ ലെവൽ എനർജി! 🔥⚡ ഫുൾ പവർ ഓൺ, നാളെക്കായി കാത്തിരിക്കാതെ ഇന്നിൽ ജീവിക്കാം! 🚀`,
        feeling: 'ഫുൾ പവർ 🔥',
        hashtags: ['#LinkUp', '#KeralaMass', '#MalluBeats'],
        suggestedMusic: 'Sulthana',
      },
      {
        caption: `നല്ല പാട്ടും ചങ്ങായിമാരും ഉണ്ടെങ്കിൽ ലൈഫ് കളർഫുൾ ആണ്! 🎶🌟 പോസിറ്റീവ് വൈബ്സ് മാത്രം! 🤙`,
        feeling: 'ചങ്ക്സ് വൈബ്സ് 🌟',
        hashtags: ['#LinkUp', '#Nattuvazhi', '#MalayalamHits'],
        suggestedMusic: 'Anisuthide',
      },
    ];
  }

  // ENGLISH
  if (tone === 'hype') {
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} — Pure adrenaline & unmatched energy! 🔥⚡ Level 1000 vibe today, let's crush it! 🚀`
          : `Pure adrenaline & unmatched energy! 🔥⚡ Level 1000 vibe today, let's crush it! 🚀`,
        feeling: 'fired up & energized 🔥',
        hashtags: ['#LinkUp', '#MassEnergy', '#Unstoppable', '#GoHard'],
        suggestedMusic: 'Hukum',
      },
      {
        caption: `Zero hesitation, full throttle! 💥 Taking giant leaps and making things happen! 🦁`,
        feeling: 'relentless momentum 💥',
        hashtags: ['#LinkUp', '#BlockbusterMindset', '#CrushingGoals'],
        suggestedMusic: 'Sulthana',
      },
      {
        caption: `Unstoppable beats on full blast! 🔊⚡ Fuelled up and ready for whatever comes next! 🤙`,
        feeling: 'hyped up 🤙',
        hashtags: ['#LinkUp', '#EnergyHigh', '#BeastMode'],
        suggestedMusic: 'Devara Thandavam',
      },
    ];
  }
  if (tone === 'aesthetic') {
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 🌅✨ Golden hour reflections, slow acoustic beats, and finding beauty in the little details... 🕊️☕`
          : `Golden hour reflections, slow acoustic beats, and finding beauty in the little details... 🕊️☕✨`,
        feeling: 'poetic & serene 🌅',
        hashtags: ['#LinkUp', '#AestheticMoments', '#GoldenHour', '#MelodyNights'],
        suggestedMusic: 'Anisuthide',
      },
      {
        caption: `Tranquil skies and acoustic melodies 🍃✨ Soft whispers of the evening breeze creating pure magic.`,
        feeling: 'deeply peaceful 🍃',
        hashtags: ['#LinkUp', '#SlowLiving', '#VisualPoetry'],
        suggestedMusic: 'Singara Siriye',
      },
      {
        caption: `Warm coffee, cozy ambiance, and a playlist that understands your soul ☕🌧️ Life is beautiful.`,
        feeling: 'cozy nostalgia ☕',
        hashtags: ['#LinkUp', '#CozyVibes', '#AcousticSoul'],
        suggestedMusic: 'Samajavaragamana',
      },
    ];
  }
  if (tone === 'tech') {
    return [
      {
        caption: cleanPrompt
          ? `${cleanPrompt} 💻⚡ Turning complex problems into elegant code! Late night developer momentum! 🚀`
          : `Late night engineering sessions: terminal glowing, coffee steaming, and deploying smooth features! 💻⚡☕`,
        feeling: 'in the zone 🚀',
        hashtags: ['#LinkUp', '#BuildInPublic', '#DevLife', '#FullStack'],
        suggestedMusic: 'Singara Siriye',
      },
      {
        caption: `Ship code, fix bugs, repeat 🛠️✨ When your build passes and tests turn green on first push!`,
        feeling: 'triumphantly productive 💡',
        hashtags: ['#LinkUp', '#TechVibes', '#CodeLife'],
        suggestedMusic: 'Kantara Theme',
      },
      {
        caption: `Dreaming in algorithms, building with passion ⚡ Constantly iterating, learning, and elevating!`,
        feeling: 'creative momentum ⚡',
        hashtags: ['#LinkUp', '#DeveloperMindset', '#SoftwareCraft'],
        suggestedMusic: 'Sulthana',
      },
    ];
  }

  // Default English Vibe
  return [
    {
      caption: cleanPrompt
        ? `${cleanPrompt} 🎶✨ Good music, genuine smiles, and contagious energy! Making every moment count on LinkUp. 🚀`
        : `Weekend vibes hit different when the playlist is pure fire! 🎶✨ Sharing special moments with good music and good people. 🚀`,
      feeling: 'chilling & vibing 🎶',
      hashtags: ['#LinkUp', '#WeekendVibes', '#GoodEnergy', '#StayConnected'],
      suggestedMusic: 'Singara Siriye',
    },
    {
      caption: `Surround yourself with genuine energy, heartfelt music, and inspiring conversations 🌟 Good vibes only!`,
      feeling: 'grateful & uplifted 🌟',
      hashtags: ['#LinkUp', '#CommunityVibes', '#PositiveLiving'],
      suggestedMusic: 'Anisuthide',
    },
    {
      caption: `Chasing sunsets, bumping favorite regional tracks, and making memories that stick 🌅🤙`,
      feeling: 'pure joy 🤙',
      hashtags: ['#LinkUp', '#MemoryLane', '#LifeIsGood'],
      suggestedMusic: 'Butta Bomma',
    },
  ];
}

/**
 * Generate creative post/caption variations
 * @param {Object} params
 * @param {string} params.prompt - Topic, mood, or idea
 * @param {string} params.tone - One of AI_TONES
 * @param {string} params.language - Selected language
 * @param {string} [params.attachedSong] - Optional song name to theme around
 * @returns {Promise<Array<{caption: string, feeling: string, hashtags: string[], suggestedMusic?: string}>>}
 */
export async function generateSocialPost({ prompt, tone = 'vibe', language = 'english', attachedSong = '' }) {
  if (OPENROUTER_API_KEY) {
    const systemPrompt = `You are "LinkUp AI", the intelligent social media assistant for "LinkUp" — a social networking platform that connects people with modern social feeds, stories, reels, and regional Indian music (Kannada, Telugu, Tamil, Hindi, Malayalam).

Your job is to generate 3 diverse, viral, engaging social media post options based on the user's input.
CRITICAL LANGUAGE RULES:
- If language is Kannada, write the caption and feeling in authentic Kannada script (ಕನ್ನಡ).
- If language is Telugu, write the caption and feeling in authentic Telugu script (తెలుగు).
- If language is Tamil, write the caption and feeling in authentic Tamil script (தமிழ்).
- If language is Hindi, write the caption and feeling in authentic Hindi script (हिंदी).
- If language is Malayalam, write the caption and feeling in authentic Malayalam script (മലയാളം).
- If language is English, write in punchy, modern English.
- Always include natural emojis, recommended feeling, and 3-5 hashtags (including #LinkUp).
- Output MUST be valid JSON with no markdown backticks or commentary.

Format:
{
  "options": [
    {
      "caption": "Post text in the chosen language script with emojis...",
      "feeling": "short feeling phrase in that language",
      "hashtags": ["#LinkUp", "#RelevantTag"],
      "suggestedMusic": "Song name matching the region"
    }
  ]
}`;

    const userContent = `Topic/Idea: "${prompt || 'Sharing good vibes and weekend moments'}"
Tone: ${tone}
Requested Language: ${language}
${attachedSong ? `Current Song: "${attachedSong}"` : ''}

Generate 3 unique post options in the exact requested language script.`;

    const models = ['openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct', 'deepseek/deepseek-chat'];

    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'LinkUp Social Network',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent },
            ],
            temperature: 0.8,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.options && Array.isArray(parsed.options) && parsed.options.length > 0) {
            return parsed.options;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next...`, err);
      }
    }
  }

  // Instant, authentic native-script generator tailored to language and tone
  return getLocalisedOptions(prompt, tone, language);
}
