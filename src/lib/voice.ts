/**
 * Inzovate HRMS — Intelligent Multilingual AI Voice & Command Engine
 * Full Native Support for:
 * - தமிழ் (Tamil - ta-IN)
 * - English (en-IN / en-US)
 * - తెలుగు (Telugu - te-IN)
 * - മലയാളം (Malayalam - ml-IN)
 * - ಕನ್ನಡ (Kannada - kn-IN)
 * - हिन्दी (Hindi - hi-IN)
 */

export interface VoiceRouteTarget {
  route: string;
  nameEnglish: string;
  nameTamil: string;
  nameTelugu: string;
  nameMalayalam: string;
  nameKannada: string;
  nameHindi: string;
  keywords: string[];
}

export const ROUTE_DIRECTORY: VoiceRouteTarget[] = [
  {
    route: "/dashboard",
    nameEnglish: "Executive Dashboard",
    nameTamil: "முதன்மை முகப்பு",
    nameTelugu: "ఎగ్జిక్యూటివ్ డాష్‌బోర్డ్",
    nameMalayalam: "എക്സിക്യൂട്ടീവ് ഡാഷ്‌ബോർഡ്",
    nameKannada: "ಕಾರ್ಯನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nameHindi: "कार्यकारी डैशबोर्ड",
    keywords: [
      // English
      "dashboard", "home", "main", "overview", "hq", "dash", "home page", "main page", "open dashboard", "dashboard open",
      // Tamil
      "டேஷ்போர்டு", "டேஷ்போர்ட்", "முகப்பு", "ஹோம்", "ஹெச்கியூ", "டேஷ்போர்டு திற", "முகப்பு பக்கம்", "டேஷ்போர்டு ஓபன் பண்ணு", "முகப்பு திற",
      // Telugu
      "డాష్‌బోర్డ్", "హోమ్", "డాష్‌బోర్డ్ తెరువు", "డాష్బోర్డ్",
      // Malayalam
      "ഡാഷ്‌ബോർഡ്", "ഹോം", "ഡാഷ്‌ബോർഡ് തുറക്കുക", "ഡാഷ്ബോർഡ്",
      // Kannada
      "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ಮುಖಪುಟ", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
      // Hindi
      "डैशबोर्ड", "होम", "डैशबोर्ड खोलो", "मुख्य पृष्ठ"
    ],
  },
  {
    route: "/employees",
    nameEnglish: "Employee Master Directory",
    nameTamil: "பணியாளர்கள் பட்டியல்",
    nameTelugu: "ఉద్యోగుల డైరెక్టరీ",
    nameMalayalam: "ജീവനക്കാരുടെ ഡയറക്ടറി",
    nameKannada: "ನೌಕರರ ಡೈರೆಕ್ಟರಿ",
    nameHindi: "कर्मचारी डायरेक्टरी",
    keywords: [
      // English
      "employee", "employees", "staff", "workers", "directory", "people", "team", "members", "open employees", "employee page", "staff list",
      // Tamil
      "பணியாளர்", "பணியாளர்கள்", "ஊழியர்", "ஊழியர்கள்", "ஸ்டாப்", "எம்ப்ளாய்", "எம்ப்ளாயி", "எம்ப்ளாய் பேஜ்", "பணியாளர் பட்டியல்", "பணியாளர்கள் திற", "எம்ப்ளாய் ஓபன் பண்ணு",
      // Telugu
      "ఉద్యోగులు", "ఉద్యోగి", "సిబ్బంది", "ఎంప్లాయ్", "ఉద్యోగుల పేజీ", "ఉద్యోగులు తెరువు",
      // Malayalam
      "ജീവനക്കാർ", "ജീവനക്കാരൻ", "സ്റ്റാഫ്", "എംപ്ലോയി", "ജീവനക്കാരുടെ പേജ്",
      // Kannada
      "ನೌಕರರು", "ನೌಕರ", "ಸಿಬ್ಬಂದಿ", "ಉದ್ಯೋಗಿಗಳು", "ಎಂಪ್ಲಾಯೀಸ್", "ನೌಕರರ ಪುಟ",
      // Hindi
      "कर्मचारी", "स्टाफ", "एम्प्लॉई", "कर्मचारियों की सूची", "कर्मचारी पृष्ठ खोलो"
    ],
  },
  {
    route: "/attendance",
    nameEnglish: "Attendance & Shift Punch",
    nameTamil: "வருகை மற்றும் பணி நேரம்",
    nameTelugu: "హాజరు మరియు షిఫ్ట్",
    nameMalayalam: "ഹാജർ നില",
    nameKannada: "ಹಾಜರಾತಿ ಮತ್ತು ಶಿಫ್ಟ್",
    nameHindi: "उपस्थिति एवं शिफ्ट",
    keywords: [
      // English
      "attendance", "attenden", "atendans", "clock", "shift", "checkin", "checkout", "presence", "attendance page", "punch page", "shift time", "open attendance",
      // Tamil
      "அட்டென்டன்ஸ்", "அட்டண்டன்ஸ்", "அட்டன்டன்ஸ்", "வருகை", "பணி நேரம்", "வருகைப் பதிவு", "அட்டெண்டன்ஸ் பேஜ்", "வருகை பக்கம்", "அட்டென்டன்ஸ் திற", "அட்டெண்டன்ஸ் ஓபன் பண்ணு",
      // Telugu
      "హాజరు", "అటెండెన్స్", "షిఫ్ట్", "హాజరు పేజీ తెరువు",
      // Malayalam
      "ഹാജർ", "അറ്റൻഡൻസ്", "ഷിഫ്റ്റ് സമയം", "ഹാജർ നില തുറക്കുക",
      // Kannada
      "ಹಾಜರಾತಿ", "ಅಟೆಂಡೆನ್ಸ್", "ಶಿಫ್ಟ್", "ಹಾಜರಾತಿ ಪುಟ ತೆರೆಯಿರಿ",
      // Hindi
      "उपस्थिति", "अटेंडेंस", "हाजिरी", "शिफ्ट का समय", "उपस्थिति पृष्ठ खोलो"
    ],
  },
  {
    route: "/leave",
    nameEnglish: "Leave Approvals & Workflows",
    nameTamil: "விடுப்பு விண்ணப்பங்கள்",
    nameTelugu: "సెలవు ఆమోదాలు",
    nameMalayalam: "അവധി അപേക്ഷകൾ",
    nameKannada: "ರಜೆ ಅನುಮೋದನೆಗಳು",
    nameHindi: "अवकाश एवं स्वीकृति",
    keywords: [
      // English
      "leave", "leaves", "vacation", "holiday", "permission", "absence", "time off", "leave page", "open leave", "leave approvals",
      // Tamil
      "லீவ்", "விடுப்பு", "விடுமுறை", "அனுமதி", "விடுப்பு ஒப்புதல்", "லீவ் பேஜ்", "லீவ் பக்கம்", "விடுப்பு திற", "லீவ் ஓபன் பண்ணு",
      // Telugu
      "సెలవు", "సెలవులు", "లీవ్", "సెలవు పేజీ", "లీవ్ తెరువు",
      // Malayalam
      "അവധി", "ലീവ്", "അവധി പേജ്", "ലീവ് തുറക്കുക",
      // Kannada
      "ರಜೆ", "ರಜೆಗಳು", "ಲೀವ್", "ರಜೆ ಪುಟ", "ಲೀವ್ ತೆರೆಯಿರಿ",
      // Hindi
      "छुट्टी", "अवकाश", "लीव", "छुट्टी पृष्ठ", "अवकाश स्वीकृतियां"
    ],
  },
  {
    route: "/payroll",
    nameEnglish: "Statutory Payroll Run",
    nameTamil: "சம்பளக் கணக்கீடு",
    nameTelugu: "పేరోల్ మరియు వేతనాలు",
    nameMalayalam: "ശമ്പള വിവരങ്ങൾ",
    nameKannada: "ವೇತನ ಮತ್ತು ಪೇರೋಲ್",
    nameHindi: "पेरोल एवं वेतन",
    keywords: [
      // English
      "payroll", "salary calculation", "epf", "esic", "professional tax", "compensation", "payroll run", "salary run", "open payroll", "payroll page",
      // Tamil
      "பேரோல்", "சம்பளம்", "சம்பள கணக்கீடு", "பிஎப்", "இஎஸ்ஐ", "சம்பள பக்கம்", "பேரோல் பக்கம்", "பேரோல் திற", "பேரோல் ஓபன் பண்ணு",
      // Telugu
      "పేరోల్", "జీతం", "జీతాల గణన", "పేరోల్ తెరువు",
      // Malayalam
      "പേറോൾ", "ശമ്പളം", "ശമ്പള കണക്കുകൂട്ടൽ", "പേറോൾ തുറക്കുക",
      // Kannada
      "ಪೇರೋಲ್", "ವೇತನ", "ಸಂಬಳ", "ಪೇರೋಲ್ ತೆರೆಯಿರಿ",
      // Hindi
      "पेरोल", "वेतन", "सैलरी", "पेरोल पृष्ठ खोलो"
    ],
  },
  {
    route: "/payroll/payslips",
    nameEnglish: "Employee Payslips",
    nameTamil: "சம்பளச் சீட்டு",
    nameTelugu: "పేస్లిప్‌లు",
    nameMalayalam: "പേസ്ലിപ്പുകൾ",
    nameKannada: "ಸಂಬಳದ ಚೀಟಿ",
    nameHindi: "वेतन पर्ची (पेस्लिप)",
    keywords: [
      // English
      "payslip", "payslips", "salary slip", "slip", "salary statement", "my payslip", "download payslip",
      // Tamil
      "பேஸ்லிப்", "சம்பள சீட்டு", "சம்பள ரசீது", "என் சம்பளம்", "பேஸ்லிப் திற",
      // Telugu
      "పేస్లిప్", "జీతం స్లిప్", "పేస్లిప్‌లు",
      // Malayalam
      "പേസ്ലിപ്പ്", "ശമ്പള സ്ലിപ്പ്",
      // Kannada
      "ಪೇಸ್ಲಿಪ್", "ವೇತನ ಚೀಟಿ",
      // Hindi
      "पेस्लिप", "सैलरी स्लिप", "वेतन पर्ची"
    ],
  },
  {
    route: "/org-chart",
    nameEnglish: "Organization Hierarchy Chart",
    nameTamil: "நிறுவன படிநிலை வரைபடம்",
    nameTelugu: "సంస్థ క్రమశ్రేణి",
    nameMalayalam: "ഓർഗനൈസേഷൻ ഘടന",
    nameKannada: "ಸಂಸ್ಥೆಯ ಕ್ರಮಾನುಗತ",
    nameHindi: "संगठनात्मक पदानुक्रम",
    keywords: [
      // English
      "org chart", "org", "hierarchy", "chart", "structure", "tree", "reporting", "organization", "organisation", "organization chart", "organizational hierarchy", "open org chart", "org page",
      // Tamil
      "ஆர்க் சார்ட்", "படிநிலை", "நிறுவன வரைபடம்", "பதவி வரைபடம்", "நிறுவன படிநிலை", "தலைமை", "ஆர்கனைசேஷன் சார்ட்", "ஆர்கனைசேஷன்", "சார்ட் திற", "நிறுவன வரைபடம் திற", "ஆர்கனைசேஷன் ஓபன் பண்ணு",
      // Telugu
      "సంస్థ", "ఆర్గనైజేషన్", "సంస్థ చార్ట్", "హైరార్కీ", "ఆర్గనైజేషన్ చార్ట్ తెరువు",
      // Malayalam
      "ഓർഗനൈസേഷൻ", "ഹൈറാർക്കി", "ഓർഗനൈസേഷൻ ചാർട്ട്", "ഘടന",
      // Kannada
      "ಸಂಸ್ಥೆ", "ಆರ್ಗನೈಸೇಶನ್", "ಶ್ರೇಣಿ ಚಾರ್ಟ್", "ಆರ್ಗನೈಸೇಶನ್ ಚಾರ್ಟ್",
      // Hindi
      "संगठन", "ऑर्ग चार्ट", "पदानुक्रम", "संगठनात्मक चार्ट खोलो",
      // Leadership names
      "gokul", "mousik", "gousik", "founder", "managing director", "chairman"
    ],
  },
  {
    route: "/internship",
    nameEnglish: "Internship Programs & Telemetry",
    nameTamil: "இன்டர்ன்ஷிப் மேலாண்மை",
    nameTelugu: "ఇంటర్న్‌షిప్ ప్రోగ్రామ్‌లు",
    nameMalayalam: "ഇന്റേൺഷിപ്പ് പ്രോഗ്രാമുകൾ",
    nameKannada: "ಇಂಟರ್ನ್‌ಶಿಪ್ ಕಾರ್ಯಕ್ರಮಗಳು",
    nameHindi: "इंटर्नशिप प्रोग्राम",
    keywords: [
      // English
      "intern", "interns", "internship", "students", "trainees", "domains", "student details", "intern fee", "open internship", "internship page",
      // Tamil
      "இன்டர்ன்ஷிப்", "இன்டர்ன்", "மாணவர்", "மாணவர்கள்", "பயிற்சி", "இன்டர்ன்ஷிப் பக்கம்", "இன்டர்ன்ஷிப் ஓபன் பண்ணு", "இன்டர்ன் விவரங்கள்", "மாணவர் கட்டணம்",
      // Telugu
      "ఇంటర్న్‌షిప్", "ఇంటర్న్", "విద్యార్థులు", "ఇంటర్న్‌షిప్ పేజీ తెరువు",
      // Malayalam
      "ഇന്റേൺഷിപ്പ്", "ഇന്റേൺ", "വിദ്യാർത്ഥികൾ", "ഇന്റേൺഷിപ്പ് പേജ് തുറക്കുക",
      // Kannada
      "ಇಂಟರ್ನ್‌ಶಿಪ್", "ಇಂಟರ್ನ್", "ವಿದ್ಯಾರ್ಥಿಗಳು", "ಇಂಟರ್ನ್‌ಶಿಪ್ ಪುಟ",
      // Hindi
      "इंटर्नशिप", "इंटर्न", "छात्र", "इंटर्नशिप पेज खोलो"
    ],
  },
  {
    route: "/internship/finance",
    nameEnglish: "Internship Finance & Fee Ledger",
    nameTamil: "இன்டர்ன்ஷிப் கட்டண நிலுவை",
    nameTelugu: "ఇంటర్న్‌షిప్ ఫీజు లెడ్జర్",
    nameMalayalam: "ഇന്റേൺഷിപ്പ് ഫീസ് വിവരങ്ങൾ",
    nameKannada: "ಇಂಟರ್ನ್‌ಶಿಪ್ ಶುಲ್ಕ ಲೆಡ್ಜರ್",
    nameHindi: "इंटर्नशिप फीस लेज़र",
    keywords: [
      "fee", "fees", "fee ledger", "balance fee", "student fees", "கட்டணம்", "கட்டண நிலுவை", "நிதி", "இன்டர்ன் கட்டணம்",
      "ఫీజు", "ఫీజు వివరాలు", "ഫീസ്", "ശിൽപം", "ಶುಲ್ಕ", "फीस", "फीस विवरण"
    ],
  },
  {
    route: "/tasks",
    nameEnglish: "Tasks & Projects Sprint",
    nameTamil: "பணிகள் மற்றும் திட்டங்கள்",
    nameTelugu: "టాస్క్‌లు మరియు ప్రాజెక్ట్‌లు",
    nameMalayalam: "ടാസ്കുകൾ",
    nameKannada: "ಕಾರ್ಯಗಳು ಮತ್ತು ಯೋಜನೆಗಳು",
    nameHindi: "कार्य एवं परियोजनाएं",
    keywords: [
      "task", "tasks", "project", "projects", "todo", "sprint", "work board", "open tasks",
      "டாஸ்க்", "பணி", "பணிகள்", "திட்டம்", "ப்ராஜெக்ட்", "டாஸ்க் பக்கம்", "பணிகள் திற",
      "టాస్క్", "ప్రాజెక్ట్", "పనులు", "టాస్క్‌లు తెరువు",
      "ടാസ്ക്", "പ്രോജക്റ്റ്", "ജോലികൾ", "ടാസ്കുകൾ തുറക്കുക",
      "ಕಾರ್ಯ", "ಯೋಜನೆ", "ಕೆಲಸಗಳು", "ಟಾಸ್ಕ್‌ಗಳು",
      "कार्य", "टास्क", "प्रोजेक्ट", "काम", "टास्क खोलो"
    ],
  },
  {
    route: "/settings",
    nameEnglish: "System Settings & Rules",
    nameTamil: "அமைப்புகள் மற்றும் விதிகள்",
    nameTelugu: "సిస్టమ్ సెట్టింగ్‌లు",
    nameMalayalam: "സിസ്റ്റം ക്രമീകരണങ്ങൾ",
    nameKannada: "ವ್ಯವಸ್ಥಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    nameHindi: "सिस्टम सेटिंग्स",
    keywords: [
      "settings", "rules", "config", "configuration", "policy", "setup", "open settings",
      "செட்டிங்ஸ்", "அமைப்புகள்", "விதிகள்", "பாலிசி", "செட்டிங்ஸ் பக்கம்", "செட்டிங்ஸ் திற",
      "సెట్టింగ్‌లు", "నియమాలు", "సెట్టింగ్స్ తెరువు",
      "ക്രമീകരണങ്ങൾ", "നിയമങ്ങൾ", "സെറ്റിംഗ്സ് തുറക്കുക",
      "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "ನಿಯಮಗಳು", "ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯಿರಿ",
      "सेटिंग्स", "नियम", "नीति", "सेटिंग्स खोलो"
    ],
  },
  {
    route: "/settings/permissions",
    nameEnglish: "Role Governance & Clearance",
    nameTamil: "சூப்பர் அட்மின் நிர்வாகம்",
    nameTelugu: "సూపర్ అడ్మిన్ యాక్సెస్",
    nameMalayalam: "സൂപ്പർ അഡ്മിൻ ഗവേണൻസ്",
    nameKannada: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಆಡಳಿತ",
    nameHindi: "सुपर एडमिन गवर्नेंस",
    keywords: [
      "governance", "permission", "permissions", "clearance", "super admin access", "rbac",
      "சூப்பர் அட்மின்", "அனுமதி", "பர்மிஷன்", "கவர்னன்ஸ்", "சூப்பர் அட்மின் கன்சோல்",
      "అనుమతులు", "సూపర్ అడ్మిన్", "పర్మిషన్లు",
      "അനുമതികൾ", "സൂപ്പർ അഡ്മിൻ",
      "ಅನುಮತಿಗಳು", "ಸೂಪರ್ ಅಡ್ಮಿನ್",
      "अनुमतियां", "सुपर एडमिन", "गवर्नेंस"
    ],
  },
  {
    route: "/reports",
    nameEnglish: "Reports & Analytics",
    nameTamil: "அறிக்கைகள்",
    nameTelugu: "నివేదికలు",
    nameMalayalam: "റിപ്പോർട്ടുകൾ",
    nameKannada: "ವರದಿಗಳು",
    nameHindi: "रिपोर्ट और एनालिटिक्स",
    keywords: [
      "report", "reports", "analytics", "audit log", "open reports",
      "அறிக்கை", "அறிக்கைகள்", "ரிப்போர்ட்", "ஆடிட்", "அறிக்கைகள் திற",
      "నివేదికలు", "రిపోర్ట్స్", "റിപ്പോർട്ടുകൾ", "ವರದಿಗಳು", "रिपोर्ट्स", "रिपोर्ट खोलो"
    ],
  },
];

export interface VoiceResolutionResult {
  matched: boolean;
  intent:
    | "NAVIGATION"
    | "ADD_EMPLOYEE"
    | "ADD_INTERN"
    | "ADD_TASK"
    | "RECORD_PAY"
    | "SCHEDULE_CLASS"
    | "APPLY_LEAVE"
    | "PUNCH_IN"
    | "PUNCH_OUT"
    | "LOGOUT"
    | "QUERY"
    | "CHATGPT"
    | "UNKNOWN";
  targetRoute?: string;
  spokenResponse: string;
  language: string;
  dataQuery?: string;
  triggerEvent?: string;
}

export function detectLanguageFromText(text: string, defaultLang: string = "ta-IN"): string {
  const t = text.trim();
  // Tamil unicode range
  if (/[\u0B80-\u0BFF]/.test(t) || /(vaanga|pannu|sollu|open|panna|irukku|eppadi|podu)/i.test(t)) {
    return "ta-IN";
  }
  // Telugu unicode range
  if (/[\u0C00-\u0C7F]/.test(t) || /(chey|teruvu|evaru|undi|cheyyandi)/i.test(t)) {
    return "te-IN";
  }
  // Malayalam unicode range
  if (/[\u0D00-\u0D7F]/.test(t) || /(turakkuka|cheyyuka|evide|undo|aano)/i.test(t)) {
    return "ml-IN";
  }
  // Kannada unicode range
  if (/[\u0C80-\u0CFF]/.test(t) || /(tereyiri|maadi|elli|ideya|hege)/i.test(t)) {
    return "kn-IN";
  }
  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(t) || /(kholo|batao|karo|kaise|chahiye|namaste)/i.test(t)) {
    return "hi-IN";
  }

  return defaultLang.startsWith("AUTO") ? "ta-IN" : defaultLang;
}

/**
 * Universal Multilingual Intent Resolver
 * Accurately maps voice commands across Tamil, Telugu, Malayalam, Kannada, Hindi, and English.
 */
export function resolveVoiceIntent(
  rawTranscript: string,
  preferredLanguage: string = "ta-IN"
): VoiceResolutionResult {
  const text = (rawTranscript || "").toLowerCase().trim();
  const detectedLang = detectLanguageFromText(rawTranscript, preferredLanguage);

  const isTa = detectedLang.startsWith("ta");
  const isTe = detectedLang.startsWith("te");
  const isMl = detectedLang.startsWith("ml");
  const isKn = detectedLang.startsWith("kn");
  const isHi = detectedLang.startsWith("hi");

  // Helper for localized replies
  const getLocalized = (
    ta: string,
    en: string,
    te: string,
    ml: string,
    kn: string,
    hi: string
  ) => {
    if (isTa) return ta;
    if (isTe) return te;
    if (isMl) return ml;
    if (isKn) return kn;
    if (isHi) return hi;
    return en;
  };

  // 1. ACTION: ADD EMPLOYEE (User explicit request: "ஆட் எம்ப்ளாய் அப்படின்னு சொன்னேன்னா அது வந்து செய்யணும்")
  const addEmpPatterns = [
    "add employee", "new employee", "create employee", "onboard employee", "add staff",
    "ஆட் எம்ப்ளாய்", "எம்ப்ளாய் ஆட்", "எம்ப்ளாய் ஆட் பண்ணு", "புதிய பணியாளர்", "பணியாளரை சேர்", "பணியாளர் சேர்", "புது எம்ப்ளாய்",
    "ఉద్యోగిని జోడించండి", "యాడ్ ఎంప్లాయ్", "కొత్త ఉద్యోగి",
    "ജീവനക്കാരനെ ചേർക്കുക", "ആഡ് എംപ്ലോയി", "പുതിയ ജീവനക്കാരൻ",
    "ಉದ್ಯೋಗಿ ಸೇರಿಸಿ", "ಆಡ್ ಎಂಪ್ಲಾಯೀ", "ಹೊಸ ಉದ್ಯೋಗಿ",
    "कर्मचारी जोड़ें", "ऐड एम्प्लॉई", "नया कर्मचारी जोड़ें"
  ];

  if (addEmpPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "ADD_EMPLOYEE",
      targetRoute: "/employees?action=new",
      triggerEvent: "inzovate_open_add_employee",
      spokenResponse: getLocalized(
        "புதிய பணியாளரை சேர்க்கும் படிவம் திறக்கப்படுகிறது. விவரங்களை உள்ளிடவும்.",
        "Opening Add Employee form. Please enter employee details.",
        "కొత్త ఉద్యోగిని చేర్చే ఫారమ్ తెరవబడుతోంది.",
        "പുതിയ ജീവനക്കാരനെ ചേർക്കുന്ന ഫോം തുറക്കുന്നു.",
        "ಹೊಸ ಉದ್ಯೋಗಿ ಸೇರಿಸುವ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "नया कर्मचारी जोड़ने का फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 1B. ACTION: ADD INTERN / ONBOARD STUDENT (User explicit request: "இதை ஆட் பண்ணு, அதை ஆட் பண்ணு, சமிதா ஆட்...")
  const addInternPatterns = [
    "add intern", "new intern", "create intern", "onboard intern", "add student", "enroll intern", "intern add",
    "ஆட் இன்டர்ன்", "இன்டர்ன் ஆட்", "இன்டர்ன் ஆட் பண்ணு", "புதிய இன்டர்ன்", "மாணவர் சேர்", "இன்டர்ன் சேர்", "மாணவரை சேர்", "மாணவர் சேர்க்கை", "புது இன்டர்ன்",
    "சமிதா ஆட்", "சம்திங் ஆட்", "something add",
    "ఇంటర్న్ జోడించండి", "కొత్త ఇంటర్న్",
    "ഇന്റേൺ ചേർക്കുക", "പുതിയ ഇന്റേൺ",
    "ಇಂಟರ್ನ್ ಸೇರಿಸಿ",
    "इंटर्न जोड़ें", "नया इंटर्न"
  ];

  if (addInternPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "ADD_INTERN",
      targetRoute: "/internship?action=onboard",
      triggerEvent: "inzovate_open_add_intern",
      spokenResponse: getLocalized(
        "புதிய இன்டர்ன்ஷிப் சேர்க்கை படிவம் உடனடியாக திறக்கப்படுகிறது. மாணவர் விவரங்களை உள்ளிடலாம்.",
        "Opening Intern Onboarding modal now. You can enter candidate details.",
        "కొత్త ఇంటర్న్ నమోదు ఫారమ్ తెరవబడుతోంది.",
        "ഇന്റേൺഷിപ്പ് രജിസ്ട്രേഷൻ ഫോം തുറക്കുന്നു.",
        "ಹೊಸ ಇಂಟರ್ನ್ ನೋಂದಣಿ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "इंटर्न ऑनबोर्डिंग फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 1C. ACTION: ADD TASK / ASSIGN WORK
  const addTaskPatterns = [
    "add task", "new task", "create task", "assign task", "task add",
    "டாஸ்க் ஆட்", "டாஸ்க் ஆட் பண்ணு", "டாஸ்க் போடு", "புதிய பணி", "பணி ஒதுக்கு", "வேலை கொடு", "புது டாஸ்க்",
    "టాస్క్ జోడించండి", "కొత్త పని",
    "ടാസ്ക് ചേർക്കുക",
    "ಕಾರ್ಯ ಸೇರಿಸಿ",
    "टास्क जोड़ें", "नया कार्य बनाएं"
  ];

  if (addTaskPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "ADD_TASK",
      targetRoute: "/tasks?action=new",
      triggerEvent: "inzovate_open_add_task",
      spokenResponse: getLocalized(
        "புதிய பணி ஒதுக்கீடு படிவம் திறக்கப்படுகிறது.",
        "Opening Create Task modal. Assign your enterprise deliverable.",
        "కొత్త టాస్క్ ఫారమ్ తెరవబడుతోంది.",
        "പുതിയ ടാസ്ക് ഫോം തുറക്കുന്നു.",
        "ಹೊಸ ಕಾರ್ಯ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "नया टास्क फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 1D. ACTION: RECORD FEE PAYMENT
  const recordPayPatterns = [
    "record payment", "record pay", "add payment", "fee payment", "pay fee", "payment add",
    "பேமெண்ட் ஆட்", "பேமெண்ட் ஆட் பண்ணு", "கட்டணம் பதிவு", "ரெக்கார்ட் பே", "பீஸ் கட்டு", "பீஸ் ஆட் பண்ணு", "பீஸ் பதிவு",
    "ఫీజు చెల్లింపు", "రుసుము నమోదు",
    "ഫീസ് അടയ്ക്കുക",
    "ಶುಲ್ಕ ಪಾವತಿ",
    "फीस भुगतान", "पेमेंट रिकॉर्ड करें"
  ];

  if (recordPayPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "RECORD_PAY",
      targetRoute: "/internship?tab=FEES",
      triggerEvent: "inzovate_open_record_pay",
      spokenResponse: getLocalized(
        "மாணவர் கட்டணப் பதிவு அட்டவணை திறக்கப்படுகிறது.",
        "Navigating to Intern Fee Ledger table.",
        "ఫీజు రికార్డుల పట్టిక తెరవబడుతోంది.",
        "ഫീസ് ലെഡ്ജർ തുറക്കുന്നു.",
        "ಶುಲ್ಕ ಲೆಡ್ಜರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "फीस रिकॉर्ड तालिका खोली जा रही है।"
      ),
      language: detectedLang,
    };
  }

  // 1E. ACTION: SCHEDULE CLASS / INTIMATE TIMING
  const scheduleClassPatterns = [
    "schedule class", "add schedule", "add class", "class timing", "class schedule", "intimate timing",
    "கிளாஸ் ஆட்", "கிளாஸ் ஆட் பண்ணு", "கிளாஸ் ஷெட்யூல்", "வகுப்பு நேரம்", "டைமிங் போடு", "கிளாஸ் டைம்", "கிளாஸ் பதிவு",
    "క్లాస్ షెడ్యూల్", "క్లాస్ టైమింగ్",
    "ക്ലാസ്സ് ഷെഡ്യൂൾ",
    "ತರಗತಿ ವೇಳಾಪಟ್ಟಿ",
    "क्लास शेड्यूल", "क्लास टाइमिंग"
  ];

  if (scheduleClassPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "SCHEDULE_CLASS",
      targetRoute: "/internship?action=schedule",
      triggerEvent: "inzovate_open_schedule_class",
      spokenResponse: getLocalized(
        "ட்ரைனர் வகுப்பு நேர அட்டவணை படிவம் திறக்கப்படுகிறது. நேரத்தை குறிப்பிடலாம்.",
        "Opening Trainer Class Scheduling modal. Please allocate session timings.",
        "క్లాస్ షెడ్యూల్ ఫారమ్ తెరవబడుతోంది.",
        "ക്ലാസ്സ് ഷെഡ്യൂൾ ഫോം തുറക്കുന്നു.",
        "ತರಗತಿ ವೇಳಾಪಟ್ಟಿ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "क्लास शेड्यूलिंग फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 1F. GENERIC "ADD" / "ஆட் பண்ணு" (When user simply says "ஆட் பண்ணு", "add pannu", "create", etc.)
  const genericAddPatterns = [
    "ஆட் பண்ணு", "ஆட் பண்ணனும்", "ஆட் செய்", "சேர்", "புதிய பதிவு", "add pannu", "create new"
  ];
  if (genericAddPatterns.some((p) => text === p || text.startsWith(p) || text.endsWith(p))) {
    return {
      matched: true,
      intent: "ADD_INTERN",
      targetRoute: "/internship?action=onboard",
      triggerEvent: "inzovate_open_add_intern",
      spokenResponse: getLocalized(
        "புதிய சேர்க்கைப் படிவம் திறக்கப்படுகிறது. தேவையான விவரங்களை உள்ளிடலாம்.",
        "Opening Onboarding Form. You can now enter the details.",
        "నమోదు ఫారమ్ తెరవబడుతోంది.",
        "രജിസ്ട്രേഷൻ ഫോം തുറക്കുന്നു.",
        "ನೋಂದಣಿ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 2. ACTION: APPLY LEAVE
  const applyLeavePatterns = [
    "apply leave", "new leave", "request leave", "take leave",
    "லீவ் அப்ளை", "லீவ் அப்ளை பண்ணு", "விடுப்பு விண்ணப்பி", "புதிய விடுப்பு", "விடுமுறை விண்ணப்பம்",
    "సెలవు దరఖాస్తు", "అప్లై లీవ్", "సెలవు అభ్యర్థన",
    "അവധിക്ക് അപേക്ഷിക്കുക", "അപ്ലൈ ലീവ്",
    "ರಜೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", "ಅಪ್ಲೈ ಲೀವ್",
    "छुट्टी के लिए आवेदन करें", "अप्लाई लीव"
  ];

  if (applyLeavePatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "APPLY_LEAVE",
      targetRoute: "/leave?action=apply",
      triggerEvent: "inzovate_open_apply_leave",
      spokenResponse: getLocalized(
        "விடுப்பு விண்ணப்பப் படிவம் திறக்கப்படுகிறது.",
        "Opening Leave Application modal. Please specify your leave dates.",
        "సెలవు దరఖాస్తు ఫారమ్ తెరవబడుతోంది.",
        "അവധി അപേക്ഷാ ഫോം തുറക്കുന്നു.",
        "ರಜೆ ಅರ್ಜಿ ನಮೂನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.",
        "अवकाश आवेदन फॉर्म खोला जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 3. ACTION: PUNCH IN
  const punchInPatterns = [
    "punch in", "clock in", "check in", "start shift", "in podu", "punch in pannu", "punchin",
    "பஞ்ச் இன்", "பஞ்ச் இன் பண்ணு", "வருகை போடு", "வருகை பதிவு செய்", "பணி தொடங்கு",
    "పంచ్ ఇన్", "పంచ్ ఇన్ చేయండి",
    "പഞ്ച് ഇൻ", "പഞ്ച് ഇൻ ചെയ്യുക",
    "ಪಂಚ್ ಇನ್", "ಹಾಜರಾತಿ ಹಾಕಿ",
    "पंच इन", "पंच इन करें"
  ];
  if (punchInPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "PUNCH_IN",
      spokenResponse: getLocalized(
        "உங்கள் வருகை பதிவு (Punch In) சரிபார்க்கப்பட்டு பதிவு செய்யப்படுகிறது.",
        "Recording your shift Punch In now.",
        "మీ హాజరు పంచ్ ఇన్ నమోదు చేయబడుతోంది.",
        "നിങ്ങളുടെ പഞ്ച് ഇൻ രേഖപ്പെടുത്തുന്നു.",
        "ನಿಮ್ಮ ಪಂಚ್ ಇನ್ ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ.",
        "आपका पंच इन दर्ज किया जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 4. ACTION: PUNCH OUT
  const punchOutPatterns = [
    "punch out", "clock out", "check out", "end shift", "out podu", "punch out pannu", "punchout",
    "பஞ்ச் அவுட்", "பஞ்ச் அவுட் பண்ணு", "பணி முடிந்தது", "வெளியே போடு",
    "పంచ్ అవుట్", "పంచ్ అవుట్ చేయండి",
    "പഞ്ച് ഔട്ട്", "പഞ്ച് ഔട്ട് ചെയ്യുക",
    "ಪಂಚ್ ಔಟ್",
    "पंच आउट", "पंच आउट करें"
  ];
  if (punchOutPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "PUNCH_OUT",
      spokenResponse: getLocalized(
        "உங்கள் பணி முடிவு (Punch Out) பதிவு செய்யப்படுகிறது.",
        "Recording your shift Punch Out now.",
        "మీ షిఫ్ట్ పంచ్ అవుట్ నమోదు చేయబడుతోంది.",
        "നിങ്ങളുടെ പഞ്ച് ഔട്ട് രേഖപ്പെടുത്തുന്നു.",
        "ನಿಮ್ಮ ಪಂಚ್ ಔಟ್ ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ.",
        "आपका पंच आउट दर्ज किया जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 5. ACTION: LOGOUT
  const logoutPatterns = [
    "log out", "logout", "sign out", "signout", "exit",
    "லாக் அவுட்", "வெளியேறு", "வெளியே போ",
    "లాగ్ అవుట్", "ലോഗ് ഔട്ട്", "ಲಾಗ್ ಔಟ್", "लॉग आउट"
  ];
  if (logoutPatterns.some((p) => text.includes(p))) {
    return {
      matched: true,
      intent: "LOGOUT",
      spokenResponse: getLocalized(
        "இன்சோவேட் தளத்திலிருந்து வெளியேறுகிறது.",
        "Logging out of Inzovate HRMS.",
        "ఇన్జోవేట్ సిస్టమ్ నుండి లాగ్ అవుట్ అవుతోంది.",
        "ഇൻസോവേറ്റിൽ നിന്ന് ലോഗ് ഔട്ട് ചെയ്യുന്നു.",
        "ಇನ್ಜೋವೇಟ್‌ನಿಂದ ಲಾಗ್ ಔಟ್ ಆಗುತ್ತಿದೆ.",
        "सिस्टम से लॉग आउट किया जा रहा है।"
      ),
      language: detectedLang,
    };
  }

  // 6. INTELLIGENT ROUTE NAVIGATION MATCHING
  for (const item of ROUTE_DIRECTORY) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) {
        let localizedName = item.nameEnglish;
        if (isTa) localizedName = item.nameTamil;
        else if (isTe) localizedName = item.nameTelugu;
        else if (isMl) localizedName = item.nameMalayalam;
        else if (isKn) localizedName = item.nameKannada;
        else if (isHi) localizedName = item.nameHindi;

        return {
          matched: true,
          intent: "NAVIGATION",
          targetRoute: item.route,
          spokenResponse: getLocalized(
            `${localizedName} பக்கத்தைத் திறக்கிறது.`,
            `Opening ${localizedName}.`,
            `${localizedName} పేజీ తెరవబడుతోంది.`,
            `${localizedName} പേജ് തുറക്കുന്നു.`,
            `${localizedName} ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ.`,
            `${localizedName} खोला जा रहा है।`
          ),
          language: detectedLang,
        };
      }
    }
  }

  // 7. Leadership & Executive Inquiry (Founder Gokul G & MD Mousik Shankar S)
  if (
    text.includes("founder") ||
    text.includes("managing director") ||
    text.includes("md") ||
    text.includes("boss") ||
    text.includes("தலைவர்") ||
    text.includes("பவுண்டர்") ||
    text.includes("டைரக்டர்") ||
    text.includes("கோகுல்") ||
    text.includes("மௌசிக்") ||
    text.includes("gokul") ||
    text.includes("mousik")
  ) {
    return {
      matched: true,
      intent: "CHATGPT",
      spokenResponse: getLocalized(
        "இன்சோவேட் நிறுவனத்தின் பவுண்டர் திரு. கோகுல் அவர்கள் மற்றும் மேனேஜிங் டைரக்டர் திரு. மௌசிக் சங்கர் அவர்கள் ஆவர். இருவரும் சூப்பர் அட்மின் நிர்வாக அதிகாரிகளைக் கொண்டுள்ளனர்.",
        "Mr. Gokul G is the Founder & Executive Chairman, and Mr. Mousik Shankar S is the Managing Director of INZOVATE TECHNOLOGIES PRIVATE LIMITED. Both hold Super Admin executive governance.",
        "ఇన్జోవేట్ టెక్నాలజీస్ వ్యవస్థాపకుడు శ్రీ గోకుల్ జి మరియు మేనేజింగ్ డైరెక్టర్ శ్రీ మౌసిక్ శంకర్ ఎస్ గారు.",
        "ഇൻസോവേറ്റ് ടെക്നോളജീസിന്റെ സ്ഥാപകൻ ശ്രീ ഗോകുൽ ജിയും മാനേജിംഗ് ഡയറക്ടർ ശ്രീ മൗസിക് ശങ്കർ എസ്സുമാണ്.",
        "ಇನ್ಜೋವೇಟ್ ಸಂಸ್ಥಾಪಕರು ಶ್ರೀ ಗೋಕುಲ್ ಜಿ ಮತ್ತು ವ್ಯವಸ್ಥಾಪಕ ನಿರ್ದೇಶಕರು ಶ್ರೀ ಮೌಸಿಕ್ ಶಂಕರ್ ಎಸ್ ಆಗಿದ್ದಾರೆ.",
        "इनज़ोवेट टेक्नोलॉजीज के संस्थापक श्री गोकुल जी और प्रबंध निदेशक श्री मौसिक शंकर एस हैं।"
      ),
      language: detectedLang,
    };
  }

  // 8. Shift Timing & Rules
  if (
    text.includes("shift") ||
    text.includes("time") ||
    text.includes("cutoff") ||
    text.includes("timing") ||
    text.includes("பணி நேரம்") ||
    text.includes("டைமிங்") ||
    text.includes("நேரம்")
  ) {
    return {
      matched: true,
      intent: "CHATGPT",
      spokenResponse: getLocalized(
        "அலுவலக பணி நேரம் காலை 9:30 முதல் மாலை 5:00 மணி வரை. 9:45 AM வரை மட்டுமே வருகை பதிவு செய்ய அனுமதிக்கப்படும். அதற்குப் பின் தானாகவே எச்ஆருக்கு மின்னஞ்சல் செல்லும்.",
        "Office shift runs from 9:30 AM to 5:00 PM. Punch in is allowed between 9:30 AM and 9:45 AM grace cutoff. Punching late automatically notifies HR at hr@inzovate-technologies.com.",
        "ఆఫీస్ పని వేళలు ఉదయం 9:30 నుండి సాయంత్రం 5:00 వరకు. 9:45 లోపు పంచ్ చేయాలి.",
        "ഓഫീസ് സമയം രാവിലെ 9:30 മുതൽ വൈകുന്നേരം 5:00 വരെയാണ്. 9:45 നകം പഞ്ച് ചെയ്യണം.",
        "ಕಚೇರಿ ಕೆಲಸದ ಸಮಯ ಬೆಳಿಗ್ಗೆ 9:30 ರಿಂದ ಸಂಜೆ 5:00 ರವರೆಗೆ. 9:45 ರೊಳಗೆ ಪಂಚ್ ಮಾಡಬೇಕು.",
        "कार्यालय का समय सुबह 9:30 से शाम 5:00 बजे तक है। 9:45 तक पंच इन कटऑफ है।"
      ),
      language: detectedLang,
    };
  }

  // 9. Conversational Fallback
  return {
    matched: false,
    intent: "UNKNOWN",
    spokenResponse: getLocalized(
      "உங்கள் குரல் பதிவு செய்யப்பட்டது. 'டேஷ்போர்டு ஓபன் பண்ணு', 'எம்ப்ளாய் பேஜ்', 'ஆட் எம்ப்ளாய்', 'அட்டெண்டன்ஸ்', 'பஞ்ச் இன்', 'லீவ் பேஜ்' என்று நீங்கள் கூறலாம்.",
      "I heard your request. You can say 'Open Dashboard', 'Open Employees', 'Add Employee', 'Open Attendance', 'Punch In', or 'Open Leave'.",
      "మీ ఆదేశం వినబడింది. 'డాష్‌బోర్డ్', 'ఉద్యోగులు', 'యాడ్ ఎంప్లాయ్', 'హాజరు', 'సెలవు' అని చెప్పవచ్చు.",
      "നിങ്ങളുടെ നിർദ്ദേശം കേട്ടു. 'ഡാഷ്‌ബോർഡ്', 'ജീവനക്കാർ', 'ആഡ് എംപ്ലോയി', 'ഹാജർ', 'ലീവ്' എന്ന് പറയാവുന്നതാണ്.",
      "ನಿಮ್ಮ ಧ್ವನಿ ಗ್ರಹಿಸಲಾಗಿದೆ. 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ನೌಕರರು', 'ಆಡ್ ಎಂಪ್ಲಾಯೀ', 'ಹಾಜರಾತಿ', 'ರಜೆ' ಎಂದು ಹೇಳಬಹುದು.",
      "आप 'डैशबोर्ड खोलो', 'कर्मचारी', 'ऐड एम्प्लॉई', 'उपस्थिति', 'छुट्टी' कह सकते हैं।"
    ),
    language: detectedLang,
  };
}
