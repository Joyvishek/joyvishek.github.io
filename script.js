// script.js - FIFA World Cup 2026 Broadcaster Portal Logic
// Now powered by worldcup26.ir live API

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let selectedCountry = "IN";
  let activeTab = "schedule";
  let timezoneDisplayMode = "local"; // 'local' or 'stadium'
  let favorites = JSON.parse(localStorage.getItem("wc2026_favorites")) || [];
  let apiDataLoaded = false;
  let currentDetailsMatchId = null;
  
  // Resolved API data (team ID → team object, stadium ID → stadium object)
  let teamsMap = {};
  let stadiumsMap = {};

  // Hardcoded stadium timezone mappings for realistic offset calculations
  const STADIUM_TIMEZONES = {
    "Houston": { offset: -5, label: "CDT" },
    "Dallas": { offset: -5, label: "CDT" },
    "Arlington, Texas": { offset: -5, label: "CDT" },
    "Philadelphia": { offset: -4, label: "EDT" },
    "Monterrey": { offset: -6, label: "CST" },
    "Guadalupe": { offset: -6, label: "CST" },
    "Mexico City": { offset: -6, label: "CST" },
    "Zapopan": { offset: -6, label: "CST" },
    "Los Angeles": { offset: -7, label: "PDT" },
    "Inglewood": { offset: -7, label: "PDT" },
    "Vancouver": { offset: -7, label: "PDT" },
    "Boston": { offset: -4, label: "EDT" },
    "Foxborough": { offset: -4, label: "EDT" },
    "East Rutherford": { offset: -4, label: "EDT" },
    "New York/New Jersey": { offset: -4, label: "EDT" },
    "New York": { offset: -4, label: "EDT" },
    "Miami": { offset: -4, label: "EDT" },
    "Kansas City": { offset: -5, label: "CDT" },
    "Santa Clara": { offset: -7, label: "PDT" },
    "San Francisco Bay Area": { offset: -7, label: "PDT" },
    "Atlanta": { offset: -4, label: "EDT" },
    "Seattle": { offset: -7, label: "PDT" },
    "Toronto": { offset: -4, label: "EDT" },
    "Guadalajara": { offset: -6, label: "CST" }
  };

  // --- DOM Elements ---
  const userCountrySelect = document.getElementById("user-country-select");
  const themeToggle = document.getElementById("theme-toggle");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const appViews = document.querySelectorAll(".app-view");
  
  // Banners
  const featuredMatchesScroll = document.getElementById("featured-matches-scroll");

  // Match Details Modal
  const matchDetailsModal = document.getElementById("match-details-modal");
  const detailsCloseBtn = document.getElementById("details-close-btn");
  const detailsHomeFlag = document.getElementById("details-home-flag");
  const detailsHomeName = document.getElementById("details-home-name");
  const detailsScoreHome = document.getElementById("details-score-home");
  const detailsScoreAway = document.getElementById("details-score-away");
  const detailsAwayName = document.getElementById("details-away-name");
  const detailsAwayFlag = document.getElementById("details-away-flag");
  const detailsMatchStatus = document.getElementById("details-match-status");
  const detailsTimelineFeed = document.getElementById("details-timeline-feed");
  const detailsBroadcastersList = document.getElementById("details-broadcasters-list");
  const detailsInfoStage = document.getElementById("details-info-stage");
  const detailsInfoStadium = document.getElementById("details-info-stadium");
  const detailsInfoCity = document.getElementById("details-info-city");
  const detailsInfoTime = document.getElementById("details-info-time");

  // Schedule filters
  const scheduleSearch = document.getElementById("schedule-search");
  const scheduleStage = document.getElementById("schedule-stage");
  const scheduleDateSelect = document.getElementById("schedule-date");
  const scheduleFavoritesFilter = document.getElementById("schedule-favorites-filter");
  const timeBtnLocal = document.getElementById("time-btn-local");
  const timeBtnStadium = document.getElementById("time-btn-stadium");
  const matchCardsGrid = document.getElementById("match-cards-grid");

  // Broadcaster filters
  const broadcasterSearch = document.getElementById("broadcaster-search");
  const broadcasterAccess = document.getElementById("broadcaster-access");
  const broadcasterMedium = document.getElementById("broadcaster-medium");
  const broadcasterCardsGrid = document.getElementById("broadcaster-cards-grid");

  // Region explorer
  const regionsListPanel = document.getElementById("regions-list-panel");
  const regionDetailsPanel = document.getElementById("region-details-panel");

  // Comparison Table
  const comparisonTableBody = document.getElementById("comparison-table-body");

  // Share Modal
  const shareModalOverlay = document.getElementById("share-modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const shareModalMatchTitle = document.getElementById("share-modal-match-title");
  const shareModalMatchDetails = document.getElementById("share-modal-match-details");
  const btnCopyClipboard = document.getElementById("btn-copy-clipboard");
  const btnCopyLink = document.getElementById("btn-copy-link");
  const toastNotify = document.getElementById("toast-notify");
  
  let currentShareMatch = null;

  // --- Initialize Application ---
  async function init() {
    setupTheme();
    initializeCountryPreference();
    populateCountrySelector();
    setupEventListeners();
    renderBroadcasters();
    renderRegions();
    renderComparisonTable();
    
    // Show loading state while API fetches
    matchCardsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <div class="api-loading-spinner"></div>
        <p style="margin-top: 1rem;">Loading live match data from worldcup26.ir...</p>
      </div>
    `;
    if (featuredMatchesScroll) {
      featuredMatchesScroll.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem; text-align: center; width: 100%;">
          Loading live matches...
        </div>
      `;
    }
    
    // Fetch live data from API
    await fetchAllAPIData();
    
    // Now render with real data
    populateDateSelector();
    renderFeaturedMatches();
    renderSchedule();
    checkQueryParameters();
    
    // Refresh live data every 60 seconds
    setInterval(refreshLiveData, 60000);
  }

  function getSupportedCountry(code) {
    return WORLD_CUP_DATA.countries.find(c => c.code === code);
  }

  function setSelectedCountry(code, options = {}) {
    if (!getSupportedCountry(code)) return false;

    selectedCountry = code;
    if (userCountrySelect) {
      userCountrySelect.value = code;
    }
    if (options.persist) {
      localStorage.setItem("wc2026_selected_country", code);
    }
    return true;
  }

  function renderCountryScopedViews() {
    renderFeaturedMatches();
    renderSchedule();
    renderBroadcasters();
    renderRegions();
  }

  function getCountryParam() {
    const params = new URLSearchParams(window.location.search);
    const countryParam = params.get("country");
    return countryParam ? countryParam.toUpperCase() : "";
  }

  function initializeCountryPreference() {
    const countryParam = getCountryParam();
    if (setSelectedCountry(countryParam)) return;

    const savedCountry = localStorage.getItem("wc2026_selected_country");
    if (setSelectedCountry(savedCountry)) {
      return;
    }
  }

  // --- API Data Fetching ---
  async function fetchAllAPIData() {
    try {
      const [gamesRes, teamsRes, stadiumsRes] = await Promise.all([
        fetch(WORLD_CUP_DATA.api.games),
        fetch(WORLD_CUP_DATA.api.teams),
        fetch(WORLD_CUP_DATA.api.stadiums)
      ]);

      if (!gamesRes.ok || !teamsRes.ok || !stadiumsRes.ok) {
        throw new Error("One or more API requests failed");
      }

      const gamesData = await gamesRes.json();
      const teamsData = await teamsRes.json();
      const stadiumsData = await stadiumsRes.json();

      // Build lookup maps
      (teamsData.teams || []).forEach(t => {
        teamsMap[t.id] = t;
      });
      (stadiumsData.stadiums || []).forEach(s => {
        stadiumsMap[s.id] = s;
      });

      // Transform API games into our internal format
      WORLD_CUP_DATA.matches = (gamesData.games || []).map(game => {
        const homeTeam = teamsMap[game.home_team_id];
        const awayTeam = teamsMap[game.away_team_id];
        const stadium = stadiumsMap[game.stadium_id];
        const city = stadium ? stadium.city_en.split("(")[0].trim() : "TBD";

        // Parse local_date (format: "MM/DD/YYYY HH:MM") as stadium local time
        let datetime = null;
        if (game.local_date) {
          datetime = parseAPIDate(game.local_date, city);
        }

        // Determine stage from group field
        const stageMap = {
          "A": "Group Stage", "B": "Group Stage", "C": "Group Stage", "D": "Group Stage",
          "E": "Group Stage", "F": "Group Stage", "G": "Group Stage", "H": "Group Stage",
          "I": "Group Stage", "J": "Group Stage", "K": "Group Stage", "L": "Group Stage",
          "R16": "Round of 16", "QF": "Quarter-Final", "SF": "Semi-Final",
          "3RD": "3rd Place", "FINAL": "Final"
        };

        return {
          id: parseInt(game.id),
          teams: {
            home: homeTeam ? homeTeam.name_en : (game.home_team_label || "TBD"),
            away: awayTeam ? awayTeam.name_en : (game.away_team_label || "TBD"),
            homeFlag: homeTeam ? homeTeam.flag : null,
            awayFlag: awayTeam ? awayTeam.flag : null,
            homeCode: homeTeam ? homeTeam.fifa_code : "",
            awayCode: awayTeam ? awayTeam.fifa_code : ""
          },
          stage: stageMap[game.group] || game.type || "Group Stage",
          group: ["R16", "QF", "SF", "3RD", "FINAL"].includes(game.group) ? "" : `Group ${game.group}`,
          stadium: stadium ? stadium.name_en : "TBD",
          city: city,
          cityFull: stadium ? stadium.city_en : "TBD",
          datetime: datetime ? datetime.toISOString() : null,
          // Live data from API
          homeScore: parseInt(game.home_score) || 0,
          awayScore: parseInt(game.away_score) || 0,
          homeScorers: game.home_scorers !== "null" ? game.home_scorers : null,
          awayScorers: game.away_scorers !== "null" ? game.away_scorers : null,
          finished: game.finished === "TRUE",
          timeElapsed: game.time_elapsed || "notstarted",
          matchday: parseInt(game.matchday) || 0
        };
      });

      // Sort matches by datetime
      WORLD_CUP_DATA.matches.sort((a, b) => {
        if (!a.datetime) return 1;
        if (!b.datetime) return 1;
        return new Date(a.datetime) - new Date(b.datetime);
      });

      apiDataLoaded = true;
      console.log(`✅ Loaded ${WORLD_CUP_DATA.matches.length} matches, ${Object.keys(teamsMap).length} teams, ${Object.keys(stadiumsMap).length} stadiums from worldcup26.ir`);

    } catch (err) {
      console.error("❌ API fetch failed:", err);
      apiDataLoaded = false;
      matchCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p style="color: #ef4444; font-weight: 600;">⚠️ Could not load live data</p>
          <p style="margin-top: 0.5rem;">Failed to connect to worldcup26.ir API. Please check your internet connection and refresh.</p>
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--accent-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
        </div>
      `;
    }
  }

  // Parse API date string "MM/DD/YYYY HH:MM" → Date object using correct stadium local offset
  function parseAPIDate(dateStr, city) {
    try {
      // Format: "06/14/2026 12:00"
      const [datePart, timePart] = dateStr.split(" ");
      const [month, day, year] = datePart.split("/");
      const [hours, minutes] = timePart.split(":");
      
      // Look up offset for this city in STADIUM_TIMEZONES
      let offsetNum = -4; // Default to EDT (UTC-4)
      if (city) {
        for (const [key, val] of Object.entries(STADIUM_TIMEZONES)) {
          if (city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())) {
            offsetNum = val.offset;
            break;
          }
        }
      }
      
      // Format offset number to timezone offset string (e.g. -5 -> "-05:00", -4.5 -> "-04:30")
      const absOffset = Math.abs(offsetNum);
      const offsetSign = offsetNum >= 0 ? "+" : "-";
      const offsetHours = String(Math.floor(absOffset)).padStart(2, '0');
      const offsetMins = String((absOffset % 1) * 60).padStart(2, '0');
      const offsetStr = `${offsetSign}${offsetHours}:${offsetMins}`;
      
      const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00${offsetStr}`;
      return new Date(isoStr);
    } catch (e) {
      console.warn("Could not parse date:", dateStr);
      return null;
    }
  }

  function getTimeElapsedValue(match) {
    return String(match.timeElapsed || "").trim().toLowerCase();
  }

  function isMatchLive(match) {
    const elapsed = getTimeElapsedValue(match);
    return Boolean(elapsed && elapsed !== "notstarted" && elapsed !== "finished" && !match.finished);
  }

  function getLiveMinute(match) {
    const elapsed = getTimeElapsedValue(match);
    const explicitMinute = elapsed.match(/\d+/);
    if (explicitMinute) {
      return parseInt(explicitMinute[0], 10);
    }

    return null;
  }

  function formatLiveMinute(match) {
    const elapsed = String(match.timeElapsed || "").trim();
    if (/\d/.test(elapsed)) {
      return elapsed.includes("'") ? elapsed : `${elapsed}'`;
    }

    const minute = getLiveMinute(match);
    if (minute === null) {
      return "NOW";
    }
    if (minute > 90) {
      return `90+${minute - 90}'`;
    }
    return `${minute}'`;
  }

  function formatLiveStatus(match) {
    const liveMinute = formatLiveMinute(match);
    return liveMinute === "NOW" ? "LIVE NOW" : `LIVE - ${liveMinute}`;
  }

  // Refresh only game data (scores, status) periodically
  async function refreshLiveData() {
    try {
      const res = await fetch(WORLD_CUP_DATA.api.games);
      if (!res.ok) return;
      const data = await res.json();
      
      const gamesById = {};
      (data.games || []).forEach(g => { gamesById[g.id] = g; });

      // Update existing match objects with fresh scores/status
      WORLD_CUP_DATA.matches.forEach(match => {
        const fresh = gamesById[String(match.id)];
        if (fresh) {
          match.homeScore = parseInt(fresh.home_score) || 0;
          match.awayScore = parseInt(fresh.away_score) || 0;
          match.homeScorers = fresh.home_scorers !== "null" ? fresh.home_scorers : null;
          match.awayScorers = fresh.away_scorers !== "null" ? fresh.away_scorers : null;
          match.finished = fresh.finished === "TRUE";
          match.timeElapsed = fresh.time_elapsed || "notstarted";
        }
      });

      // Re-render live elements
      renderFeaturedMatches();
      renderSchedule();
      if (matchDetailsModal.classList.contains("active") && currentDetailsMatchId !== null) {
        const activeMatch = WORLD_CUP_DATA.matches.find(m => m.id === currentDetailsMatchId);
        if (activeMatch) {
          updateMatchDetailsContent(activeMatch);
          generateMatchTimeline(activeMatch);
        }
      }
      console.log("🔄 Live data refreshed at", new Date().toLocaleTimeString());
    } catch (e) {
      console.warn("Live refresh failed:", e);
    }
  }

  // --- Theme Setup ---
  function setupTheme() {
    const savedTheme = localStorage.getItem("wc2026_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.querySelector(".toggle-icon").textContent = savedTheme === "dark" ? "🌙" : "☀️";
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("wc2026_theme", newTheme);
    themeToggle.querySelector(".toggle-icon").textContent = newTheme === "dark" ? "🌙" : "☀️";
  });

  // --- Populate Dropdowns ---
  function populateCountrySelector() {
    userCountrySelect.innerHTML = "";
    WORLD_CUP_DATA.countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = `${country.flag} ${country.name}`;
      if (country.code === selectedCountry) {
        option.selected = true;
      }
      userCountrySelect.appendChild(option);
    });
  }

  function populateDateSelector() {
    if (!apiDataLoaded || !scheduleDateSelect) return;
    
    const currentVal = scheduleDateSelect.value || "all";
    scheduleDateSelect.innerHTML = '<option value="all">All Dates</option>';
    
    const uniqueDatesMap = {};
    
    WORLD_CUP_DATA.matches.forEach(m => {
      if (!m.datetime) return;
      const d = new Date(m.datetime);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      uniqueDatesMap[dateStr] = startOfDay;
    });
    
    const sortedDates = Object.keys(uniqueDatesMap).sort((a, b) => uniqueDatesMap[a] - uniqueDatesMap[b]);
    
    sortedDates.forEach(dateStr => {
      const option = document.createElement("option");
      option.value = dateStr;
      option.textContent = dateStr;
      if (dateStr === currentVal) {
        option.selected = true;
      }
      scheduleDateSelect.appendChild(option);
    });
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Country Selector Change
    userCountrySelect.addEventListener("change", (e) => {
      setSelectedCountry(e.target.value, { persist: true });
      renderCountryScopedViews();
      showToast(`Switched view to ${WORLD_CUP_DATA.countries.find(c => c.code === selectedCountry).name}`);
    });

    // Tab buttons
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        appViews.forEach(v => v.classList.remove("active"));
        
        btn.classList.add("active");
        const targetView = document.getElementById(`tab-view-${btn.dataset.tab}`);
        if (targetView) {
          targetView.classList.add("active");
        }
        activeTab = btn.dataset.tab;
      });
    });

    // Timezone toggles
    timeBtnLocal.addEventListener("click", () => {
      timezoneDisplayMode = "local";
      timeBtnLocal.classList.add("active");
      timeBtnStadium.classList.remove("active");
      renderSchedule();
    });

    timeBtnStadium.addEventListener("click", () => {
      timezoneDisplayMode = "stadium";
      timeBtnStadium.classList.add("active");
      timeBtnLocal.classList.remove("active");
      renderSchedule();
    });

    // Filter changes (instant typing / selection)
    scheduleSearch.addEventListener("input", renderSchedule);
    scheduleStage.addEventListener("change", renderSchedule);
    scheduleDateSelect.addEventListener("change", renderSchedule);
    scheduleFavoritesFilter.addEventListener("change", renderSchedule);

    broadcasterSearch.addEventListener("input", renderBroadcasters);
    broadcasterAccess.addEventListener("change", renderBroadcasters);
    broadcasterMedium.addEventListener("change", renderBroadcasters);

    // Modal Close
    modalCloseBtn.addEventListener("click", hideShareModal);
    shareModalOverlay.addEventListener("click", (e) => {
      if (e.target === shareModalOverlay) hideShareModal();
    });

    // Details Modal Close
    detailsCloseBtn.addEventListener("click", hideMatchDetailsModal);
    matchDetailsModal.addEventListener("click", (e) => {
      if (e.target === matchDetailsModal) hideMatchDetailsModal();
    });

    // Details Modal Tab Switching
    const modalTabButtons = document.querySelectorAll(".modal-tab-btn");
    modalTabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        modalTabButtons.forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".modal-tab-view").forEach(v => v.classList.remove("active"));
        
        btn.classList.add("active");
        const targetView = document.getElementById(`modal-tab-view-${btn.dataset.modalTab}`);
        if (targetView) {
          targetView.classList.add("active");
        }
      });
    });

    // Copy actions
    btnCopyClipboard.addEventListener("click", copyBroadcastCardToClipboard);
    btnCopyLink.addEventListener("click", copyShareLinkToClipboard);
  }

  // --- Featured Matches (Today & Tomorrow) at the top ---
  function renderFeaturedMatches() {
    if (!apiDataLoaded || !featuredMatchesScroll) return;
    
    featuredMatchesScroll.innerHTML = "";
    
    // Filter matches for Today (June 14, 2026) and Tomorrow (June 15, 2026)
    const now = new Date();
    const baseDate = (now.getFullYear() === 2026 && now.getMonth() === 5) ? now : new Date("2026-06-14T12:00:00-04:00");
    
    const todayStr = baseDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }); // "06/14/2026"
    
    const tomorrowDate = new Date(baseDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }); // "06/15/2026"
    
    const todayFormatted = todayStr.split("/")[0] + "/" + todayStr.split("/")[1]; // "06/14"
    const tomorrowFormatted = tomorrowStr.split("/")[0] + "/" + tomorrowStr.split("/")[1]; // "06/15"

    const featuredMatches = WORLD_CUP_DATA.matches.filter(m => {
      if (isMatchLive(m)) return true;
      if (!m.datetime) return false;
      const matchDateStr = new Date(m.datetime).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }); // e.g. "06/14"
      return matchDateStr === todayFormatted || matchDateStr === tomorrowFormatted;
    });

    // Sort featured matches: Live (ongoing) first, then Upcoming, then Finished (at the end)
    featuredMatches.sort((a, b) => {
      const getPriority = (match) => {
        const isLive = isMatchLive(match);
        const isFinished = match.finished;
        if (isLive) return 1;
        if (!isFinished) return 2; // Upcoming
        return 3; // Finished
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort chronologically by datetime
      if (!a.datetime) return 1;
      if (!b.datetime) return -1;
      return new Date(a.datetime) - new Date(b.datetime);
    });

    if (featuredMatches.length === 0) {
      featuredMatchesScroll.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem; text-align: center; width: 100%;">
          No matches scheduled for today or tomorrow.
        </div>
      `;
      return;
    }

    featuredMatches.forEach(match => {
      const card = document.createElement("div");
      card.className = "featured-match-card";
      card.setAttribute("onclick", `window.openMatchDetails(${match.id})`);
      
      const isLive = isMatchLive(match);
      const isFinished = match.finished;
      const hasStarted = isLive || isFinished;
      
      let badgeText = "UPCOMING";
      let badgeClass = "upcoming";
      
      if (isLive) {
        badgeText = formatLiveStatus(match);
        badgeClass = "live";
      } else if (isFinished) {
        badgeText = "FINISHED";
        badgeClass = "finished";
      } else {
        if (match.datetime) {
          const start = new Date(match.datetime);
          const diffMs = start - now;
          if (diffMs > 0 && diffMs < 24 * 3600000) {
            const hours = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            if (hours > 0) {
              badgeText = `${hours}h ${mins}m`;
            } else {
              badgeText = `${mins}m`;
            }
          }
        }
      }

      const matchTimeStr = match.datetime ? formatMatchTime(match.datetime, match.city) : "TBD";
      
      // Team flags - prefer API flag images, fallback to emoji
      const homeFlag = match.teams.homeFlag 
        ? `<img src="${match.teams.homeFlag}" alt="${match.teams.home}" class="featured-team-flag-img" onerror="this.style.display='none'">` 
        : `<span class="featured-team-flag">${getTeamFlagEmoji(match.teams.home)}</span>`;
      const awayFlag = match.teams.awayFlag 
        ? `<img src="${match.teams.awayFlag}" alt="${match.teams.away}" class="featured-team-flag-img" onerror="this.style.display='none'">` 
        : `<span class="featured-team-flag">${getTeamFlagEmoji(match.teams.away)}</span>`;

      const homeScoreDisplay = hasStarted ? match.homeScore : "-";
      const awayScoreDisplay = hasStarted ? match.awayScore : "-";

      card.innerHTML = `
        <div class="featured-match-header">
          <span class="featured-match-stage">${match.stage}</span>
          <span class="featured-match-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="featured-teams-row">
          <div class="featured-team">
            <div class="featured-team-info">
              ${homeFlag}
              <span class="featured-team-name">${match.teams.home}</span>
            </div>
            <span class="featured-team-score">${homeScoreDisplay}</span>
          </div>
          <div class="featured-team">
            <div class="featured-team-info">
              ${awayFlag}
              <span class="featured-team-name">${match.teams.away}</span>
            </div>
            <span class="featured-team-score">${awayScoreDisplay}</span>
          </div>
        </div>
        <div class="featured-match-footer">
          <span>🕒 ${matchTimeStr.split(" (")[0]}</span>
          <span>📍 ${match.city}</span>
        </div>
      `;
      
      featuredMatchesScroll.appendChild(card);
    });
  }

  // --- Match Details Modal Open & timeline builders ---
  window.openMatchDetails = function(matchId) {
    const match = WORLD_CUP_DATA.matches.find(m => m.id === matchId);
    if (!match) return;

    currentDetailsMatchId = matchId;
    updateMatchDetailsContent(match);

    // Timeline Builder
    generateMatchTimeline(match);

    const tabs = document.querySelectorAll(".modal-tab-btn");
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector('[data-modal-tab="timeline"]').classList.add("active");
    
    document.querySelectorAll(".modal-tab-view").forEach(v => v.classList.remove("active"));
    document.getElementById("modal-tab-view-timeline").classList.add("active");

    matchDetailsModal.classList.add("active");
  };

  function updateMatchDetailsContent(match) {
    detailsHomeName.textContent = match.teams.home;
    detailsAwayName.textContent = match.teams.away;
    
    const homeFlag = match.teams.homeFlag 
      ? `<img src="${match.teams.homeFlag}" alt="${match.teams.home}" class="details-flag-img">`
      : `<span class="details-flag">${getTeamFlagEmoji(match.teams.home)}</span>`;
    const awayFlag = match.teams.awayFlag 
      ? `<img src="${match.teams.awayFlag}" alt="${match.teams.away}" class="details-flag-img">`
      : `<span class="details-flag">${getTeamFlagEmoji(match.teams.away)}</span>`;
      
    detailsHomeFlag.innerHTML = homeFlag;
    detailsAwayFlag.innerHTML = awayFlag;

    const isLive = isMatchLive(match);
    const hasStarted = isLive || match.finished;
    
    detailsScoreHome.textContent = hasStarted ? match.homeScore : "-";
    detailsScoreAway.textContent = hasStarted ? match.awayScore : "-";

    let statusText = "Upcoming";
    if (isLive) {
      statusText = `🔴 ${formatLiveStatus(match)}`;
    } else if (match.finished) {
      statusText = "Full Time";
    }
    detailsMatchStatus.textContent = statusText;
    
    detailsInfoStage.textContent = `${match.stage}${match.group ? ' • ' + match.group : ''}`;
    detailsInfoStadium.textContent = match.stadium;
    detailsInfoCity.textContent = match.city;
    detailsInfoTime.textContent = match.datetime ? formatMatchTime(match.datetime, match.city) : "TBD";

    // Set broadcasters tab
    const broadcasters = getBroadcastersForCountry(selectedCountry);
    detailsBroadcastersList.innerHTML = "";
    if (broadcasters.length > 0) {
      broadcasters.forEach(b => {
        const item = document.createElement("a");
        item.href = b.link;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
        item.className = "broadcaster-tag";
        if (b.type === "free") {
          item.classList.add("free-option");
        }
        item.innerHTML = `
          <span>${b.type === 'free' ? '🆓' : '💳'}</span> 
          <strong>${b.name}</strong> - ${b.price} (${b.languages.join(", ")})
        `;
        detailsBroadcastersList.appendChild(item);
      });
    } else {
      detailsBroadcastersList.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">No broadcasters logged for this region. Check the Regional Explorer tab for details.</p>`;
    }
  }

  function hideMatchDetailsModal() {
    matchDetailsModal.classList.remove("active");
    currentDetailsMatchId = null;
  }

  function generateMatchTimeline(match) {
    detailsTimelineFeed.innerHTML = "";
    
    const events = [];
    const isLive = isMatchLive(match);
    const isFinished = match.finished;
    const hasStarted = isLive || isFinished;

    if (!hasStarted) {
      detailsTimelineFeed.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">
          <p>🏁 Match has not started yet.</p>
          <p style="margin-top: 0.5rem; font-size: 0.8rem;">Official lineups, match feed, and real-time events will be updated once the game kicks off.</p>
        </div>
      `;
      return;
    }

    events.push({
      minute: 0,
      title: "Match Kickoff",
      desc: `The match between ${match.teams.home} and ${match.teams.away} starts at ${match.stadium}.`,
      marker: "🏁"
    });

    if (match.homeScorers) {
      const homeList = formatScorers(match.homeScorers).split(", ");
      homeList.forEach(s => {
        const minMatch = s.match(/(\d+)/);
        const minute = minMatch ? parseInt(minMatch[0]) : 15;
        events.push({
          minute: minute,
          minuteLabel: "GOAL",
          title: `GOAL! ${match.teams.home} ⚽`,
          desc: `${s} scores for the hosts!`,
          marker: "⚽"
        });
      });
    }

    if (match.awayScorers) {
      const awayList = formatScorers(match.awayScorers).split(", ");
      awayList.forEach(s => {
        const minMatch = s.match(/(\d+)/);
        const minute = minMatch ? parseInt(minMatch[0]) : 25;
        events.push({
          minute: minute,
          minuteLabel: "GOAL",
          title: `GOAL! ${match.teams.away} ⚽`,
          desc: `${s} scores for the visitors!`,
          marker: "⚽"
        });
      });
    }

    if (isFinished) {
      events.push({
        minute: 90,
        title: "Full Time whistle ⏹️",
        desc: `The referee blows the final whistle! Final score: ${match.teams.home} ${match.homeScore} - ${match.awayScore} ${match.teams.away}`,
        marker: "⏹️"
      });
    }

    events.sort((a, b) => a.minute - b.minute);

    if (isLive) {
      const currentMin = getLiveMinute(match);
      
      const liveEvents = currentMin === null
        ? events.filter(e => e.minute === 0 || e.title.includes("GOAL!"))
        : events.filter(e => e.minute <= currentMin);
      
      const liveStatusEvent = {
        minute: currentMin || "",
        minuteLabel: currentMin === null ? "LIVE" : null,
        title: currentMin === null ? "Match Live" : "Ongoing Live Action ⚡",
        desc: currentMin === null
          ? "The API marks this match as live, but it has not published the current clock minute. Goal events above are official API updates."
          : `Currently in the ${formatLiveMinute(match)} minute. Follow live streams for full coverage.`,
        marker: "⏱️"
      };

      if (currentMin === null) {
        liveEvents.unshift(liveStatusEvent);
      } else {
        liveEvents.push(liveStatusEvent);
      }
      
      renderTimelineList(liveEvents);
    } else {
      renderTimelineList(events);
    }
  }

  function renderTimelineList(eventList) {
    eventList.forEach(e => {
      const div = document.createElement("div");
      div.className = "timeline-event";
      
      div.innerHTML = `
        <div class="timeline-event-marker">${e.minuteLabel || `${e.minute}'`}</div>
        <div class="timeline-event-content">
          <div class="timeline-event-title">${e.marker} ${e.title}</div>
          <div class="timeline-event-desc">${e.desc}</div>
        </div>
      `;
      detailsTimelineFeed.appendChild(div);
    });
  }

  // --- Helper: Get broadcasters covering a specific country ---
  function getBroadcastersForCountry(countryCode) {
    return WORLD_CUP_DATA.broadcasters.filter(b => b.countries.includes(countryCode));
  }

  // --- Helper: Format scorer list from raw PostgreSQL brace-enclosed format ---
  function formatScorers(scorersStr) {
    if (!scorersStr || scorersStr === "null" || scorersStr.trim() === "") return "";
    
    let str = scorersStr.trim();
    
    // Normalize curly quotes to standard straight quotes
    str = str.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    
    if (str.startsWith("{") && str.endsWith("}")) {
      // Try parsing as a JSON array by replacing curly braces with brackets
      try {
        const jsonStr = '[' + str.substring(1, str.length - 1) + ']';
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).join(", ");
        }
      } catch (e) {
        // Fallback if JSON parsing fails
        str = str.substring(1, str.length - 1);
      }
      
      // Fallback: extract matches enclosed in double or single quotes
      const matches = [...str.matchAll(/"([^"]+)"|'([^']+)'/g)];
      if (matches.length > 0) {
        return matches.map(m => m[1] || m[2]).join(", ");
      }
      
      // Secondary fallback: split by comma, trim quotes
      return str.split(",")
                .map(item => item.trim().replace(/^["']|["']$/g, "").trim())
                .filter(Boolean)
                .join(", ");
    }
    return str;
  }

  // --- Helper: Time Formatting ---
  function formatMatchTime(datetimeStr, city) {
    const dt = new Date(datetimeStr);
    
    if (timezoneDisplayMode === "local") {
      // User's Local Time (Browser representation)
      return dt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }) + " (Your Time)";
    } else {
      // Stadium Local Time
      // Try to find timezone by matching city name partially
      let stadiumData = null;
      for (const [key, val] of Object.entries(STADIUM_TIMEZONES)) {
        if (city && city.toLowerCase().includes(key.toLowerCase())) {
          stadiumData = val;
          break;
        }
      }
      if (!stadiumData) {
        // Try matching from the full city string
        for (const [key, val] of Object.entries(STADIUM_TIMEZONES)) {
          if (city && key.toLowerCase().includes(city.toLowerCase())) {
            stadiumData = val;
            break;
          }
        }
      }
      if (stadiumData) {
        // Convert GMT to stadium local offset
        const utc = dt.getTime() + (dt.getTimezoneOffset() * 60000);
        const stadiumTime = new Date(utc + (3600000 * stadiumData.offset));
        return stadiumTime.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }) + ` (${stadiumData.label})`;
      }
      return dt.toUTCString();
    }
  }

  // --- Render Match Schedule ---
  function renderSchedule() {
    if (!apiDataLoaded) return;

    matchCardsGrid.innerHTML = "";
    const query = scheduleSearch.value.toLowerCase();
    const stage = scheduleStage.value;
    const dateFilter = scheduleDateSelect.value;
    const favOnly = scheduleFavoritesFilter.value === "favorites";

    const filteredMatches = WORLD_CUP_DATA.matches.filter(m => {
      const matchText = `${m.teams.home} vs ${m.teams.away} ${m.city} ${m.stadium} ${m.teams.homeCode} ${m.teams.awayCode}`.toLowerCase();
      const matchesQuery = matchText.includes(query);
      const matchesStage = stage === "all" || m.stage === stage;
      const matchesFav = !favOnly || favorites.includes(m.id);
      
      let matchesDate = true;
      if (m.datetime) {
        const matchLocalDate = new Date(m.datetime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
        matchesDate = dateFilter === "all" || matchLocalDate === dateFilter;
      } else {
        matchesDate = dateFilter === "all";
      }
      
      return matchesQuery && matchesStage && matchesFav && matchesDate;
    });

    // Sort schedule matches: Live first, then Upcoming, then Finished. Within each, sort chronologically.
    filteredMatches.sort((a, b) => {
      const getPriority = (match) => {
        const isLive = isMatchLive(match);
        const isFinished = match.finished;
        if (isLive) return 1;
        if (!isFinished) return 2; // Upcoming
        return 3; // Finished
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      if (!a.datetime) return 1;
      if (!b.datetime) return -1;
      return new Date(a.datetime) - new Date(b.datetime);
    });

    if (filteredMatches.length === 0) {
      matchCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No matches found matching your filters.</p>
        </div>
      `;
      return;
    }

    filteredMatches.forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";
      card.setAttribute("id", `match-card-${match.id}`);
      card.style.cursor = "pointer";
      card.setAttribute("onclick", `window.openMatchDetails(${match.id})`);
      
      const isFav = favorites.includes(match.id);
      const matchTimeStr = match.datetime ? formatMatchTime(match.datetime, match.city) : "TBD";
      const broadcasters = getBroadcastersForCountry(selectedCountry);

      // Team flags - prefer API flag images, fallback to emoji
      const homeFlag = match.teams.homeFlag 
        ? `<img src="${match.teams.homeFlag}" alt="${match.teams.home}" class="team-flag-img" onerror="this.style.display='none'">` 
        : `<span class="team-flag">${getTeamFlagEmoji(match.teams.home)}</span>`;
      const awayFlag = match.teams.awayFlag 
        ? `<img src="${match.teams.awayFlag}" alt="${match.teams.away}" class="team-flag-img" onerror="this.style.display='none'">` 
        : `<span class="team-flag">${getTeamFlagEmoji(match.teams.away)}</span>`;

      let broadcasterHTML = "";
      if (broadcasters.length > 0) {
        broadcasters.forEach(b => {
          const isFree = b.type === "free";
          broadcasterHTML += `
            <a href="${b.link}" target="_blank" rel="noopener noreferrer" 
               class="broadcaster-tag ${isFree ? 'free-option' : ''}" 
               title="${b.name} (${b.price})"
               onclick="event.stopPropagation();">
              <span>${isFree ? '🆓' : '💳'}</span> ${b.name}
            </a>
          `;
        });
      } else {
        broadcasterHTML = `<span style="font-size:0.75rem;color:var(--text-muted);">Check Regional Explorer for other countries</span>`;
      }

      // Determine match status display
      let statusHTML = "";
      const isLive = isMatchLive(match);
      const isFinished = match.finished;
      const hasStarted = isLive || isFinished;

      if (isLive) {
        statusHTML = `<span class="match-status-badge live">🔴 ${formatLiveStatus(match)}</span>`;
      } else if (isFinished) {
        statusHTML = `<span class="match-status-badge finished">Full Time</span>`;
      }

      // Show score if match has started or finished
      const homeScoreDisplay = hasStarted ? match.homeScore : "-";
      const awayScoreDisplay = hasStarted ? match.awayScore : "-";

      // Scorers display
      let scorersHTML = "";
      if (hasStarted) {
        const scorerItems = [];
        const homeScorersFormatted = formatScorers(match.homeScorers);
        const awayScorersFormatted = formatScorers(match.awayScorers);
        
        if (homeScorersFormatted) {
          scorerItems.push(`⚽ ${homeScorersFormatted}`);
        }
        if (awayScorersFormatted) {
          scorerItems.push(`⚽ ${awayScorersFormatted}`);
        }
        if (scorerItems.length > 0) {
          scorersHTML = `<div class="match-scorers">${scorerItems.map(s => `<div class="scorer-item">${s}</div>`).join("")}</div>`;
        }
      }

      card.innerHTML = `
        <div class="match-header">
          <span class="match-stage">${match.stage}${match.group ? ' • ' + match.group : ''}</span>
          <div class="match-actions">
            ${statusHTML}
            <button class="action-icon-btn ${isFav ? 'favorite-active' : ''}" 
                    onclick="window.toggleFavorite(${match.id}); event.stopPropagation();" 
                    title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ★
            </button>
            <button class="action-icon-btn" 
                    onclick="window.openShareModal(${match.id}); event.stopPropagation();" 
                    title="Share broadcast details">
              🔗
            </button>
          </div>
        </div>
        
        <div class="match-teams-display">
          <div class="team-row">
            <div class="team-info">
              ${homeFlag}
              <span class="team-name">${match.teams.home}</span>
            </div>
            <span class="team-score ${isLive ? 'score-live' : ''}" id="score-home-${match.id}">${homeScoreDisplay}</span>
          </div>
          <div class="team-row">
            <div class="team-info">
              ${awayFlag}
              <span class="team-name">${match.teams.away}</span>
            </div>
            <span class="team-score ${isLive ? 'score-live' : ''}" id="score-away-${match.id}">${awayScoreDisplay}</span>
          </div>
        </div>

        ${scorersHTML}

        <div class="match-meta">
          <div class="match-time-row">
            <span class="match-time-value">${matchTimeStr}</span>
          </div>
          <div class="match-location">
            <span>📍</span> ${match.stadium}, ${match.city}
          </div>
          
          <div class="match-broadcasters-section">
            <div class="broadcasters-title">Legal Viewing Options (${selectedCountry}):</div>
            <div class="broadcaster-link-list">
              ${broadcasterHTML}
            </div>
          </div>
        </div>
      `;
      
      matchCardsGrid.appendChild(card);
    });
  }

  // --- Helper: Team Flags Emoji Fallback ---
  function getTeamFlagEmoji(teamName) {
    const flags = {
      "Mexico": "🇲🇽", "Saudi Arabia": "🇸🇦", "United States": "🇺🇸", "Bolivia": "🇧🇴",
      "Canada": "🇨🇦", "Togo": "🇹🇬", "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Curacao": "🇨🇼",
      "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Côte d'Ivoire": "🇨🇮", "Ecuador": "🇪🇨",
      "Sweden": "🇸🇪", "Tunisia": "🇹🇳", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "New Zealand": "🇳🇿",
      "Argentina": "🇦🇷", "Slovakia": "🇸🇰", "Brazil": "🇧🇷", "Norway": "🇳🇴",
      "Spain": "🇪🇸", "Angola": "🇦🇴", "Italy": "🇮🇹", "Honduras": "🇭🇳",
      "France": "🇫🇷", "Portugal": "🇵🇹", "Belgium": "🇧🇪", "Croatia": "🇭🇷",
      "Morocco": "🇲🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭", "Australia": "🇦🇺",
      "Iran": "🇮🇷", "South Korea": "🇰🇷", "Paraguay": "🇵🇾", "Haiti": "🇭🇹",
      "Algeria": "🇩🇿", "Jordan": "🇯🇴", "Senegal": "🇸🇳", "Uruguay": "🇺🇾",
      "Colombia": "🇨🇴", "Panama": "🇵🇦", "Serbia": "🇷🇸", "Cameroon": "🇨🇲",
      "Bosnia and Herzegovina": "🇧🇦", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
      "Costa Rica": "🇨🇷", "Peru": "🇵🇪", "Chile": "🇨🇱", "Jamaica": "🇯🇲",
      "TBD": "🏳️"
    };
    return flags[teamName] || "🏳️";
  }

  // --- Render Broadcasters ---
  function renderBroadcasters() {
    broadcasterCardsGrid.innerHTML = "";
    const query = broadcasterSearch.value.toLowerCase();
    const access = broadcasterAccess.value;
    const medium = broadcasterMedium.value;

    const filteredBroadcasters = WORLD_CUP_DATA.broadcasters.filter(b => {
      const matchQuery = b.name.toLowerCase().includes(query) || b.coverage.toLowerCase().includes(query);
      const matchAccess = access === "all" || b.type === access;
      const matchMedium = medium === "all" || b.medium.includes(medium);
      const matchCountry = b.countries.includes(selectedCountry);
      
      return matchQuery && matchAccess && matchMedium && matchCountry;
    });

    if (filteredBroadcasters.length === 0) {
      broadcasterCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No broadcasters match your filters in the selected region (${selectedCountry}). Switch region above to find others.</p>
        </div>
      `;
      return;
    }

    filteredBroadcasters.forEach(b => {
      const card = document.createElement("div");
      card.className = "broadcaster-card";
      
      const badgeClass = b.type === "free" ? "badge-free" : "badge-paid";
      const badgeText = b.type === "free" ? "Free / FTA" : "Paid/Sub";

      card.innerHTML = `
        <div>
          <div class="broadcaster-card-header">
            <div class="broadcaster-logo-wrap" style="background-color: ${b.logoColor || '#3b82f6'};">
              ${b.name.substring(0, 3)}
            </div>
            <div class="broadcaster-badges">
              <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
          </div>
          
          <div class="broadcaster-info">
            <h3>${b.name}</h3>
            <p class="broadcaster-desc">${b.coverage}</p>
          </div>
        </div>

        <div>
          <div class="broadcaster-detail-list">
            <div class="broadcaster-detail-item">
              <span class="broadcaster-detail-label">Cost Tier:</span>
              <span class="broadcaster-detail-val">${b.price}</span>
            </div>
            <div class="broadcaster-detail-item">
              <span class="broadcaster-detail-label">Platforms:</span>
              <span class="broadcaster-detail-val">${b.medium.join(", ")}</span>
            </div>
            <div class="broadcaster-detail-item">
              <span class="broadcaster-detail-label">Languages:</span>
              <span class="broadcaster-detail-val">${b.languages.join(", ")}</span>
            </div>
          </div>
          <a href="${b.link}" target="_blank" rel="noopener noreferrer" class="broadcaster-card-action">
            Visit Official Site
          </a>
        </div>
      `;
      
      broadcasterCardsGrid.appendChild(card);
    });
  }

  // --- Render Regional Explorer ---
  let activeRegion = "North America";

  function renderRegions() {
    regionsListPanel.innerHTML = "";
    
    // Group countries by region
    const regions = {};
    WORLD_CUP_DATA.countries.forEach(c => {
      if (!regions[c.region]) {
        regions[c.region] = [];
      }
      regions[c.region].push(c);
    });

    // Render left panel navigation buttons
    Object.keys(regions).forEach(reg => {
      const btn = document.createElement("button");
      btn.className = `region-btn ${reg === activeRegion ? 'active' : ''}`;
      
      // Calculate how many free options are in this region
      let freeCount = 0;
      let totalCount = 0;
      regions[reg].forEach(country => {
        const broadcasters = getBroadcastersForCountry(country.code);
        totalCount += broadcasters.length;
        freeCount += broadcasters.filter(b => b.type === "free").length;
      });

      btn.innerHTML = `
        <h4>${reg}</h4>
        <p>${regions[reg].length} Countries • ${freeCount}/${totalCount} Free Channels</p>
      `;

      btn.addEventListener("click", () => {
        activeRegion = reg;
        renderRegions();
      });

      regionsListPanel.appendChild(btn);
    });

    // Render right details panel
    regionDetailsPanel.innerHTML = `
      <div class="region-details-header">
        <h3>Broadcasters in ${activeRegion}</h3>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Select countries to view full schedules</span>
      </div>
      <div class="region-details-grid">
        <!-- Render countries in active region -->
      </div>
    `;

    const detailsGrid = regionDetailsPanel.querySelector(".region-details-grid");
    const activeCountries = regions[activeRegion] || [];

    activeCountries.forEach(country => {
      const box = document.createElement("div");
      box.className = "country-card";
      
      const broadcasters = getBroadcastersForCountry(country.code);
      let listHTML = "";

      if (broadcasters.length > 0) {
        broadcasters.forEach(b => {
          const isFree = b.type === "free";
          listHTML += `
            <div class="country-card-broadcaster">
              <span>${b.name}</span>
              <span class="country-card-tag ${isFree ? 'badge-free' : 'badge-paid'}">
                ${isFree ? 'Free' : 'Paid'}
              </span>
            </div>
          `;
        });
      } else {
        listHTML = `<span style="font-size:0.8rem;color:var(--text-muted);">No official broadcaster listings logged.</span>`;
      }

      box.innerHTML = `
        <div class="country-card-header">
          <span>${country.flag}</span>
          <span>${country.name}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.35rem; margin-top:0.5rem;">
          ${listHTML}
        </div>
      `;

      // Make clickable to switch main app country focus
      box.style.cursor = "pointer";
      box.addEventListener("click", () => {
        setSelectedCountry(country.code, { persist: true });
        renderFeaturedMatches();
        renderSchedule();
        renderBroadcasters();
        showToast(`Focus switched to ${country.name}`);
      });

      detailsGrid.appendChild(box);
    });
  }

  // --- Render Comparison Table ---
  function renderComparisonTable() {
    comparisonTableBody.innerHTML = "";
    
    // Sort broadcasters so Free ones appear first
    const list = [...WORLD_CUP_DATA.broadcasters].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "free" ? -1 : 1;
    });

    list.forEach(b => {
      const row = document.createElement("tr");
      
      const countryNames = b.countries.map(code => {
        const match = WORLD_CUP_DATA.countries.find(c => c.code === code);
        return match ? `${match.flag} ${match.name}` : code;
      }).join(", ");

      const tierBadge = b.type === "free" 
        ? `<span class="badge badge-free">Free</span>` 
        : `<span class="badge badge-paid">Paid</span>`;

      row.innerHTML = `
        <td><strong>${b.name}</strong></td>
        <td>${countryNames}</td>
        <td>${tierBadge}</td>
        <td>${b.price}</td>
        <td>${b.medium.join(", ")}</td>
        <td>${b.languages.join(", ")}</td>
        <td><a href="${b.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-secondary);text-decoration:none;font-weight:600;">Visit Portal ↗</a></td>
      `;
      
      comparisonTableBody.appendChild(row);
    });
  }

  // --- Toggle Favorites Global Action ---
  window.toggleFavorite = function(matchId) {
    const idx = favorites.indexOf(matchId);
    if (idx > -1) {
      favorites.splice(idx, 1);
      showToast("Removed from My Schedule");
    } else {
      favorites.push(matchId);
      showToast("⭐ Added to My Schedule!");
    }
    localStorage.setItem("wc2026_favorites", JSON.stringify(favorites));
    renderSchedule();
  };

  // --- Share Modal Opening & Actions ---
  window.openShareModal = function(matchId) {
    const match = WORLD_CUP_DATA.matches.find(m => m.id === matchId);
    if (!match) return;

    currentShareMatch = match;
    shareModalMatchTitle.textContent = `${match.teams.home} vs ${match.teams.away}`;

    const broadcasters = getBroadcastersForCountry(selectedCountry);
    const matchTimeStr = match.datetime ? formatMatchTime(match.datetime, match.city) : "TBD";
    const channelNames = broadcasters.map(b => `${b.name} (${b.type === 'free' ? 'Free' : 'Paid'})`).join(", ") || "No local broadcasters registered";

    shareModalMatchDetails.innerHTML = `
      <strong>🏆 Stage:</strong> ${match.stage}${match.group ? ' (' + match.group + ')' : ''}<br>
      <strong>📅 Date/Time:</strong> ${matchTimeStr}<br>
      <strong>📍 Stadium:</strong> ${match.stadium}, ${match.city}<br>
      <strong>📺 Channels (${selectedCountry}):</strong> ${channelNames}
    `;

    shareModalOverlay.classList.add("active");
  };

  function hideShareModal() {
    shareModalOverlay.classList.remove("active");
    currentShareMatch = null;
  }

  function copyBroadcastCardToClipboard() {
    if (!currentShareMatch) return;
    
    const m = currentShareMatch;
    const broadcasters = getBroadcastersForCountry(selectedCountry);
    const matchTimeStr = m.datetime ? formatMatchTime(m.datetime, m.city) : "TBD";
    const channels = broadcasters.map(b => `${b.name} (${b.type === 'free' ? 'Free' : 'Paid'})`).join(", ") || "Official Streams";

    const text = `⚽ World Cup 2026 Match Card ⚽\n━━━━━━━━━━━━━━━━━━━━\n🔥 ${m.teams.home} vs ${m.teams.away}\n📅 Kickoff: ${matchTimeStr}\n📍 Arena: ${m.stadium}, ${m.city}\n📺 Broadcasters: ${channels}\n\n👉 Find official streams legal guide at: ${window.location.origin}${window.location.pathname}?match=${m.id}`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("Broadcast details copied to clipboard!");
      hideShareModal();
    }).catch(err => {
      console.error("Could not copy text: ", err);
    });
  }

  function copyShareLinkToClipboard() {
    if (!currentShareMatch) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?match=${currentShareMatch.id}&country=${selectedCountry}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Link copied to clipboard!");
      hideShareModal();
    }).catch(err => {
      console.error("Could not copy link: ", err);
    });
  }

  // --- Show Notification Toast ---
  function showToast(msg) {
    toastNotify.textContent = msg;
    toastNotify.classList.add("active");
    setTimeout(() => {
      toastNotify.classList.remove("active");
    }, 3000);
  }

  // --- URL Query Parameter Actions ---
  function checkQueryParameters() {
    const params = new URLSearchParams(window.location.search);
    
    // Country parameter
    const countryParam = params.get("country") ? params.get("country").toUpperCase() : "";
    if (setSelectedCountry(countryParam)) {
      renderCountryScopedViews();
    }

    // Match parameter
    const matchParam = params.get("match");
    if (matchParam) {
      const matchId = parseInt(matchParam);
      const match = WORLD_CUP_DATA.matches.find(m => m.id === matchId);
      if (match) {
        // Switch tab to schedule
        const scheduleTabBtn = document.querySelector('[data-tab="schedule"]');
        if (scheduleTabBtn) {
          scheduleTabBtn.click();
        }
        
        // Highlight specific match card
        setTimeout(() => {
          const card = document.getElementById(`match-card-${matchId}`);
          if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.style.borderColor = "var(--accent-gold)";
            card.style.boxShadow = "0 0 20px rgba(245, 158, 11, 0.4)";
            
            // Revert glow after a few seconds
            setTimeout(() => {
              card.style.borderColor = "";
              card.style.boxShadow = "";
            }, 4000);
          }
        }, 500);
      }
    }
  }

  // Run initial setup
  init();
});
