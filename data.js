const WORLD_CUP_DATA = {
  countries: [
    { code: "US", name: "United States", flag: "🇺🇸", region: "North America" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "Europe" },
    { code: "CA", name: "Canada", flag: "🇨🇦", region: "North America" },
    { code: "MX", name: "Mexico", flag: "🇲🇽", region: "North America" },
    { code: "AU", name: "Australia", flag: "🇦🇺", region: "Oceania" },
    { code: "IE", name: "Ireland", flag: "🇮🇪", region: "Europe" },
    { code: "ES", name: "Spain", flag: "🇪🇸", region: "Europe" },
    { code: "DE", name: "Germany", flag: "🇩🇪", region: "Europe" },
    { code: "FR", name: "France", flag: "🇫🇷", region: "Europe" },
    { code: "IT", name: "Italy", flag: "🇮🇹", region: "Europe" },
    { code: "BR", name: "Brazil", flag: "🇧🇷", region: "South America" },
    { code: "AR", name: "Argentina", flag: "🇦🇷", region: "South America" },
    { code: "IN", name: "India", flag: "🇮🇳", region: "Asia" },
    { code: "JP", name: "Japan", flag: "🇯🇵", region: "Asia" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "Africa" },
    { code: "QA", name: "MENA Region", flag: "🌍", region: "Middle East" }
  ],
  broadcasters: [
    {
      id: "fox",
      name: "FOX Sports",
      countries: ["US"],
      type: "paid", // Cable/OTA
      price: "Paid (Cable/Sling/Fubo)",
      medium: ["TV", "Web", "App"],
      link: "https://www.foxsports.com",
      languages: ["English"],
      coverage: "Broadcasts 38 matches live including the Final.",
      logoColor: "#003366"
    },
    {
      id: "fs1",
      name: "FS1",
      countries: ["US"],
      type: "paid",
      price: "Paid (Cable/Sling/Fubo)",
      medium: ["TV", "Web", "App"],
      link: "https://www.foxsports.com",
      languages: ["English"],
      coverage: "Broadcasts 66 matches live.",
      logoColor: "#0055bb"
    },
    {
      id: "telemundo",
      name: "Telemundo",
      countries: ["US"],
      type: "free", // Over-the-air free television
      price: "Free-to-Air (Antenna)",
      medium: ["TV"],
      link: "https://www.telemundo.com",
      languages: ["Spanish"],
      coverage: "Spanish-language broadcast of all matches.",
      logoColor: "#d4af37"
    },
    {
      id: "peacock",
      name: "Peacock",
      countries: ["US"],
      type: "paid",
      price: "Paid Subscription",
      medium: ["Web", "App"],
      link: "https://www.peacocktv.com",
      languages: ["Spanish"],
      coverage: "Live Spanish streaming of all matches.",
      logoColor: "#000000"
    },
    {
      id: "tubi",
      name: "Tubi",
      countries: ["US"],
      type: "free",
      price: "Free (Ad-supported)",
      medium: ["Web", "App"],
      link: "https://tubitv.com",
      languages: ["English"],
      coverage: "Free on-demand match replays and highlights.",
      logoColor: "#ff4500"
    },
    {
      id: "fubo",
      name: "Fubo TV",
      countries: ["US", "CA"],
      type: "paid",
      price: "Paid Live TV Streaming",
      medium: ["Web", "App"],
      link: "https://www.fubo.tv",
      languages: ["English", "Spanish", "French"],
      coverage: "Live carriage of Fox, FS1, Telemundo, and TSN.",
      logoColor: "#ff6600"
    },
    {
      id: "bbc",
      name: "BBC One / iPlayer",
      countries: ["GB"],
      type: "free",
      price: "Free-to-Air (TV Licence)",
      medium: ["TV", "Web", "App"],
      link: "https://www.bbc.co.uk/iplayer",
      languages: ["English"],
      coverage: "52 live matches (shared with ITV), including Final.",
      logoColor: "#000000"
    },
    {
      id: "itv",
      name: "ITV1 / ITVX",
      countries: ["GB"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.itv.com",
      languages: ["English"],
      coverage: "52 live matches (shared with BBC), including Final.",
      logoColor: "#1e0a3d"
    },
    {
      id: "rte",
      name: "RTÉ2 / RTÉ Player",
      countries: ["IE"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.rte.ie/player",
      languages: ["English"],
      coverage: "Live coverage of key matches, highlights, and finals.",
      logoColor: "#0099ff"
    },
    {
      id: "virgin",
      name: "Virgin Media Player",
      countries: ["IE"],
      type: "free",
      price: "Free Streaming",
      medium: ["Web", "App"],
      link: "https://www.virginmediatelevision.ie/player",
      languages: ["English"],
      coverage: "Select matches live and highlights.",
      logoColor: "#ff0000"
    },
    {
      id: "rtve",
      name: "RTVE La 1 / RTVE Play",
      countries: ["ES"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.rtve.es/play",
      languages: ["Spanish"],
      coverage: "All Spain national team matches, opening match, and finals free.",
      logoColor: "#e05a00"
    },
    {
      id: "ctv",
      name: "CTV",
      countries: ["CA"],
      type: "free",
      price: "Free-to-Air (Antenna)",
      medium: ["TV"],
      link: "https://www.ctv.ca",
      languages: ["English"],
      coverage: "Select matches broadcast live free-to-air.",
      logoColor: "#cc0000"
    },
    {
      id: "tsn",
      name: "TSN / TSN+",
      countries: ["CA"],
      type: "paid",
      price: "Paid Cable / Subscription",
      medium: ["TV", "Web", "App"],
      link: "https://www.tsn.ca",
      languages: ["English"],
      coverage: "Complete live coverage of all 104 matches.",
      logoColor: "#d32f2f"
    },
    {
      id: "sbs",
      name: "SBS / SBS On Demand",
      countries: ["AU"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.sbs.com.au/ondemand",
      languages: ["English"],
      coverage: "Complete live coverage of all 104 matches. 100% Free.",
      logoColor: "#0a56a3"
    },
    {
      id: "ard",
      name: "ARD (Das Erste)",
      countries: ["DE"],
      type: "free",
      price: "Free-to-Air (Public License)",
      medium: ["TV", "Web", "App"],
      link: "https://www.ardmediathek.de",
      languages: ["German"],
      coverage: "Selected live games, including Germany team matches.",
      logoColor: "#001b44"
    },
    {
      id: "zdf",
      name: "ZDF",
      countries: ["DE"],
      type: "free",
      price: "Free-to-Air (Public License)",
      medium: ["TV", "Web", "App"],
      link: "https://www.zdf.de",
      languages: ["German"],
      coverage: "Shared public broadcast of tournament matches.",
      logoColor: "#ff6600"
    },
    {
      id: "magentatv",
      name: "Magenta TV",
      countries: ["DE"],
      type: "paid",
      price: "Paid Subscription",
      medium: ["TV", "Web", "App"],
      link: "https://www.telekom.de/magenta-tv",
      languages: ["German"],
      coverage: "All 104 matches live (some exclusive).",
      logoColor: "#e20074"
    },
    {
      id: "tf1",
      name: "TF1",
      countries: ["FR"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.tf1.fr",
      languages: ["French"],
      coverage: "28 main matches including France team, semi-finals and final.",
      logoColor: "#0f172a"
    },
    {
      id: "beinsports_fr",
      name: "beIN Sports France",
      countries: ["FR"],
      type: "paid",
      price: "Paid Subscription",
      medium: ["TV", "Web", "App"],
      link: "https://www.beinsports.com/france",
      languages: ["French"],
      coverage: "All 104 matches live.",
      logoColor: "#5c2d91"
    },
    {
      id: "rai",
      name: "RAI (Rai 1 / RaiPlay)",
      countries: ["IT"],
      type: "free",
      price: "Free-to-Air / Free Streaming",
      medium: ["TV", "Web", "App"],
      link: "https://www.raiplay.it",
      languages: ["Italian"],
      coverage: "Selected high-profile matches live for free.",
      logoColor: "#002a6c"
    },
    {
      id: "globo",
      name: "TV Globo",
      countries: ["BR"],
      type: "free",
      price: "Free-to-Air",
      medium: ["TV"],
      link: "https://redeglobo.globo.com",
      languages: ["Portuguese"],
      coverage: "Matches of the Brazilian national team and key matches free-to-air.",
      logoColor: "#ff0000"
    },
    {
      id: "cazetv",
      name: "CazéTV (YouTube / Twitch)",
      countries: ["BR"],
      type: "free",
      price: "Free Streaming",
      medium: ["Web", "App"],
      link: "https://www.youtube.com/@CazeTV",
      languages: ["Portuguese"],
      coverage: "Selected live games broadcast free on digital platforms.",
      logoColor: "#fcd34d"
    },
    {
      id: "sportv",
      name: "SporTV",
      countries: ["BR"],
      type: "paid",
      price: "Paid Pay-TV / Globoplay",
      medium: ["TV", "Web", "App"],
      link: "https://globoplay.globo.com",
      languages: ["Portuguese"],
      coverage: "Full coverage of matches on Pay-TV.",
      logoColor: "#1d4ed8"
    },
    {
      id: "telefe",
      name: "Telefe",
      countries: ["AR"],
      type: "free",
      price: "Free-to-Air",
      medium: ["TV"],
      link: "https://telefe.com",
      languages: ["Spanish"],
      coverage: "Matches of Argentina national team free-to-air.",
      logoColor: "#00aae4"
    },
    {
      id: "tvpublica",
      name: "TV Pública",
      countries: ["AR"],
      type: "free",
      price: "Free-to-Air (Public Broadcast)",
      medium: ["TV"],
      link: "https://www.tvpublica.com.ar",
      languages: ["Spanish"],
      coverage: "Selection of matches live free.",
      logoColor: "#a3e635"
    },
    {
      id: "tycsports",
      name: "TyC Sports",
      countries: ["AR"],
      type: "paid",
      price: "Paid Pay-TV / Subscription",
      medium: ["TV", "Web", "App"],
      link: "https://www.tycsports.com",
      languages: ["Spanish"],
      coverage: "Extensive live coverage of the tournament.",
      logoColor: "#ef4444"
    },
    {
      id: "jiocinema",
      name: "JioCinema",
      countries: ["IN"],
      type: "free",
      price: "Free Streaming (Ad-supported)",
      medium: ["Web", "App"],
      link: "https://www.jiocinema.com",
      languages: ["English", "Hindi", "Bengali", "Malayalam", "Tamil"],
      coverage: "Full 104 matches live streaming for free in India.",
      logoColor: "#d946ef"
    },
    {
      id: "sports18",
      name: "Sports18",
      countries: ["IN"],
      type: "paid",
      price: "Paid Pay-TV (Low Cost)",
      medium: ["TV"],
      link: "https://www.sports18.com",
      languages: ["English", "Hindi"],
      coverage: "Television broadcasts of all matches live.",
      logoColor: "#1e3a8a"
    },
    {
      id: "abema",
      name: "Abema TV",
      countries: ["JP"],
      type: "free",
      price: "Free Streaming / Paid Options",
      medium: ["Web", "App"],
      link: "https://abema.tv",
      languages: ["Japanese"],
      coverage: "Live streaming of tournament matches.",
      logoColor: "#059669"
    },
    {
      id: "nhk",
      name: "NHK",
      countries: ["JP"],
      type: "free",
      price: "Free-to-Air (Public Broadcast)",
      medium: ["TV"],
      link: "https://www.nhk.or.jp",
      languages: ["Japanese"],
      coverage: "Key matches and Japan team matches broadcast live.",
      logoColor: "#475569"
    },
    {
      id: "supersport",
      name: "SuperSport",
      countries: ["ZA"],
      type: "paid",
      price: "Paid DStv Subscription",
      medium: ["TV", "Web", "App"],
      link: "https://supersport.com",
      languages: ["English", "Zulu", "Xhosa"],
      coverage: "All 104 matches live across Sub-Saharan Africa.",
      logoColor: "#0284c7"
    },
    {
      id: "sabc",
      name: "SABC Sports",
      countries: ["ZA"],
      type: "free",
      price: "Free-to-Air / Public Broadcaster",
      medium: ["TV"],
      link: "https://www.sabc.co.za",
      languages: ["English", "Local Languages"],
      coverage: "Selected live games free-to-air.",
      logoColor: "#22c55e"
    },
    {
      id: "bein_mena",
      name: "beIN Sports MENA",
      countries: ["QA"],
      type: "paid",
      price: "Paid Subscription (TOD)",
      medium: ["TV", "Web", "App"],
      link: "https://www.beinsports.com",
      languages: ["Arabic", "English", "French"],
      coverage: "Exclusive full broadcasting rights for Middle East and North Africa.",
      logoColor: "#4c1d95"
    },
    {
      id: "vix",
      name: "ViX / Televisa",
      countries: ["MX"],
      type: "free", // Has free and paid options
      price: "Free & Paid Options",
      medium: ["Web", "App", "TV"],
      link: "https://vix.com",
      languages: ["Spanish"],
      coverage: "Televisa broadcast matches live streaming (some free, some premium).",
      logoColor: "#ea580c"
    },
    {
      id: "tvazteca",
      name: "Azteca 7 / TV Azteca",
      countries: ["MX"],
      type: "free",
      price: "Free-to-Air",
      medium: ["TV"],
      link: "https://www.tvazteca.com",
      languages: ["Spanish"],
      coverage: "Mexico team matches and selected key fixtures live free.",
      logoColor: "#f59e0b"
    }
  ],
  matches: [
    {
      id: 1,
      teams: { home: "Mexico", away: "Saudi Arabia" },
      stage: "Group Stage",
      group: "Group A",
      stadium: "Estadio Azteca",
      city: "Mexico City",
      datetime: "2026-06-11T17:00:00Z" // Opening Match
    },
    {
      id: 2,
      teams: { home: "United States", away: "Bolivia" },
      stage: "Group Stage",
      group: "Group D",
      stadium: "SoFi Stadium",
      city: "Los Angeles",
      datetime: "2026-06-12T20:00:00Z"
    },
    {
      id: 3,
      teams: { home: "Canada", away: "Togo" },
      stage: "Group Stage",
      group: "Group B",
      stadium: "BC Place",
      city: "Vancouver",
      datetime: "2026-06-12T23:00:00Z"
    },
    {
      id: 4,
      teams: { home: "Germany", away: "Curacao" },
      stage: "Group Stage",
      group: "Group C",
      stadium: "NRG Stadium",
      city: "Houston",
      datetime: "2026-06-14T17:00:00Z" // Real kickoff: 12:00 PM CDT / 10:30 PM IST
    },
    {
      id: 5,
      teams: { home: "Netherlands", away: "Japan" },
      stage: "Group Stage",
      group: "Group H",
      stadium: "AT&T Stadium",
      city: "Dallas",
      datetime: "2026-06-14T20:00:00Z" // Current Day Match 2 (3:00 PM CDT)
    },
    {
      id: 6,
      teams: { home: "Côte d'Ivoire", away: "Ecuador" },
      stage: "Group Stage",
      group: "Group I",
      stadium: "Lincoln Financial Field",
      city: "Philadelphia",
      datetime: "2026-06-14T23:00:00Z" // Current Day Match 3 (7:00 PM ET)
    },
    {
      id: 7,
      teams: { home: "Sweden", away: "Tunisia" },
      stage: "Group Stage",
      group: "Group F",
      stadium: "Estadio BBVA",
      city: "Monterrey",
      datetime: "2026-06-15T02:00:00Z" // Current Day Match 4 (8:00 PM CST June 14)
    },
    {
      id: 8,
      teams: { home: "England", away: "New Zealand" },
      stage: "Group Stage",
      group: "Group E",
      stadium: "Gillette Stadium",
      city: "Boston",
      datetime: "2026-06-15T15:00:00Z"
    },
    {
      id: 9,
      teams: { home: "Argentina", away: "Slovakia" },
      stage: "Group Stage",
      group: "Group G",
      stadium: "MetLife Stadium",
      city: "East Rutherford",
      datetime: "2026-06-16T18:00:00Z"
    },
    {
      id: 10,
      teams: { home: "Brazil", away: "Norway" },
      stage: "Group Stage",
      group: "Group J",
      stadium: "Hard Rock Stadium",
      city: "Miami",
      datetime: "2026-06-16T21:00:00Z"
    },
    {
      id: 11,
      teams: { home: "Spain", away: "Angola" },
      stage: "Group Stage",
      group: "Group K",
      stadium: "Arrowhead Stadium",
      city: "Kansas City",
      datetime: "2026-06-17T17:00:00Z"
    },
    {
      id: 12,
      teams: { home: "Italy", away: "Honduras" },
      stage: "Group Stage",
      group: "Group L",
      stadium: "Levi's Stadium",
      city: "Santa Clara",
      datetime: "2026-06-17T20:00:00Z"
    }
  ]
};

// Expose on window object for browser access
if (typeof window !== 'undefined') {
  window.WORLD_CUP_DATA = WORLD_CUP_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WORLD_CUP_DATA;
}
