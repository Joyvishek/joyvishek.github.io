// script.js - FIFA World Cup 2026 Broadcaster Portal Logic

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let selectedCountry = "US";
  let activeTab = "schedule";
  let timezoneDisplayMode = "local"; // 'local' or 'stadium'
  let favorites = JSON.parse(localStorage.getItem("wc2026_favorites")) || [];
  
  // Use real system time for all live detection
  let simulatedTime = new Date();
  
  // Hardcoded stadium timezone mappings for realistic offset calculations
  const STADIUM_TIMEZONES = {
    "Houston": { offset: -5, label: "CDT" },
    "Dallas": { offset: -5, label: "CDT" },
    "Philadelphia": { offset: -4, label: "EDT" },
    "Monterrey": { offset: -6, label: "CST" },
    "Mexico City": { offset: -6, label: "CST" },
    "Los Angeles": { offset: -7, label: "PDT" },
    "Vancouver": { offset: -7, label: "PDT" },
    "Boston": { offset: -4, label: "EDT" },
    "East Rutherford": { offset: -4, label: "EDT" },
    "Miami": { offset: -4, label: "EDT" },
    "Kansas City": { offset: -5, label: "CDT" },
    "Santa Clara": { offset: -7, label: "PDT" }
  };

  // --- DOM Elements ---
  const userCountrySelect = document.getElementById("user-country-select");
  const themeToggle = document.getElementById("theme-toggle");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const appViews = document.querySelectorAll(".app-view");
  
  // Banners
  const bannerMatchTeams = document.getElementById("banner-match-teams");
  const bannerMatchStadium = document.getElementById("banner-match-stadium");
  const bannerMatchActions = document.getElementById("banner-match-actions");

  // Schedule filters
  const scheduleSearch = document.getElementById("schedule-search");
  const scheduleStage = document.getElementById("schedule-stage");
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
  function init() {
    setupTheme();
    populateCountrySelector();
    setupEventListeners();
    updateLiveMatchBanner();
    renderSchedule();
    renderBroadcasters();
    renderRegions();
    renderComparisonTable();
    checkQueryParameters();
    
    // Update live status every 30 seconds using real system time
    setInterval(tickSimulation, 30000);
    tickSimulation(); // Initial run
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

  // --- Event Listeners ---
  function setupEventListeners() {
    // Country Selector Change
    userCountrySelect.addEventListener("change", (e) => {
      selectedCountry = e.target.value;
      updateLiveMatchBanner();
      renderSchedule();
      renderBroadcasters();
      renderRegions();
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
    scheduleFavoritesFilter.addEventListener("change", renderSchedule);

    broadcasterSearch.addEventListener("input", renderBroadcasters);
    broadcasterAccess.addEventListener("change", renderBroadcasters);
    broadcasterMedium.addEventListener("change", renderBroadcasters);

    // Modal Close
    modalCloseBtn.addEventListener("click", hideShareModal);
    shareModalOverlay.addEventListener("click", (e) => {
      if (e.target === shareModalOverlay) hideShareModal();
    });

    // Copy actions
    btnCopyClipboard.addEventListener("click", copyBroadcastCardToClipboard);
    btnCopyLink.addEventListener("click", copyShareLinkToClipboard);
  }

  // --- Live Match Banner Handler ---
  function updateLiveMatchBanner() {
    const matches = WORLD_CUP_DATA.matches;
    
    // 1. Check if there is an ongoing live match
    let bannerMatch = matches.find(m => {
      const start = new Date(m.datetime);
      const end = new Date(start.getTime() + 105 * 60000); // 105 mins duration
      return simulatedTime >= start && simulatedTime <= end;
    });

    let isLive = !!bannerMatch;
    
    // 2. If no ongoing match, find the next upcoming match
    if (!bannerMatch) {
      bannerMatch = matches.find(m => new Date(m.datetime) > simulatedTime);
    }
    
    // 3. Fallback to the last match if all are in past
    if (!bannerMatch) {
      bannerMatch = matches[matches.length - 1];
    }

    if (bannerMatch) {
      const start = new Date(bannerMatch.datetime);
      const diffMins = Math.floor((simulatedTime - start) / 60000);
      
      let badgeText = "UPCOMING NEXT";
      if (isLive) {
        if (diffMins <= 45) {
          badgeText = `LIVE - ${diffMins}'`;
        } else if (diffMins > 45 && diffMins <= 60) {
          badgeText = "LIVE - HT";
        } else {
          badgeText = `LIVE - ${diffMins - 15}'`;
        }
      } else if (simulatedTime > new Date(start.getTime() + 105 * 60000)) {
        badgeText = "FINISHED";
      }

      const bannerBadge = document.querySelector(".live-badge");
      if (bannerBadge) {
        bannerBadge.textContent = badgeText;
        bannerBadge.style.backgroundColor = isLive ? "#ef4444" : (badgeText === "FINISHED" ? "var(--text-muted)" : "var(--accent-secondary)");
      }
      
      // If live or finished, show score in banner
      if (isLive || badgeText === "FINISHED") {
        let homeScore = 0;
        let awayScore = 0;
        
        // If it's our simulated match 4
        if (bannerMatch.id === 4) {
          const gameMin = diffMins <= 45 ? diffMins : (diffMins > 60 ? diffMins - 15 : 45);
          if (diffMins > 105) {
            homeScore = 2;
            awayScore = 1;
          } else {
            if (gameMin >= 12) homeScore = 1;
            if (gameMin >= 52) homeScore = 2;
            if (gameMin >= 75) awayScore = 1;
          }
        }
        bannerMatchTeams.textContent = `${bannerMatch.teams.home} ${homeScore} - ${awayScore} ${bannerMatch.teams.away}`;
      } else {
        bannerMatchTeams.textContent = `${bannerMatch.teams.home} vs ${bannerMatch.teams.away}`;
      }
      
      const matchTime = formatMatchTime(bannerMatch.datetime, bannerMatch.city);
      bannerMatchStadium.innerHTML = `📍 ${bannerMatch.stadium}, ${bannerMatch.city} | Kickoff: <strong>${matchTime}</strong>`;

      // Get official broadcaster tags for user selected country
      const channels = getBroadcastersForCountry(selectedCountry);
      bannerMatchActions.innerHTML = "";
      
      if (channels.length > 0) {
        channels.forEach(ch => {
          const link = document.createElement("a");
          link.href = ch.link;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "banner-broadcaster-btn";
          if (ch.type === "free") {
            link.style.backgroundColor = "var(--accent-color)";
          } else {
            link.style.backgroundColor = "var(--accent-secondary)";
            link.style.color = "white";
          }
          link.textContent = `Watch on ${ch.name}`;
          bannerMatchActions.appendChild(link);
        });
      } else {
        bannerMatchActions.innerHTML = `<span style="font-size:0.85rem;color:var(--text-muted)">No registered channels for this region</span>`;
      }
    }
  }

  // --- Helper: Get broadcasters covering a specific country ---
  function getBroadcastersForCountry(countryCode) {
    return WORLD_CUP_DATA.broadcasters.filter(b => b.countries.includes(countryCode));
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
      const stadiumData = STADIUM_TIMEZONES[city];
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
    matchCardsGrid.innerHTML = "";
    const query = scheduleSearch.value.toLowerCase();
    const stage = scheduleStage.value;
    const favOnly = scheduleFavoritesFilter.value === "favorites";

    const filteredMatches = WORLD_CUP_DATA.matches.filter(m => {
      const matchText = `${m.teams.home} vs ${m.teams.away} ${m.city} ${m.stadium}`.toLowerCase();
      const matchesQuery = matchText.includes(query);
      const matchesStage = stage === "all" || m.stage === stage;
      const matchesFav = !favOnly || favorites.includes(m.id);
      
      return matchesQuery && matchesStage && matchesFav;
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
      
      const isFav = favorites.includes(match.id);
      const matchTimeStr = formatMatchTime(match.datetime, match.city);
      const broadcasters = getBroadcastersForCountry(selectedCountry);

      // Generate country flags (lookup or fallback)
      const homeFlag = getTeamFlag(match.teams.home);
      const awayFlag = getTeamFlag(match.teams.away);

      let broadcasterHTML = "";
      if (broadcasters.length > 0) {
        broadcasters.forEach(b => {
          const isFree = b.type === "free";
          broadcasterHTML += `
            <a href="${b.link}" target="_blank" rel="noopener noreferrer" 
               class="broadcaster-tag ${isFree ? 'free-option' : ''}" 
               title="${b.name} (${b.price})">
              <span>${isFree ? '🆓' : '💳'}</span> ${b.name}
            </a>
          `;
        });
      } else {
        broadcasterHTML = `<span style="font-size:0.75rem;color:var(--text-muted);">Check Regional Explorer for other countries</span>`;
      }

      card.innerHTML = `
        <div class="match-header">
          <span class="match-stage">${match.stage} • ${match.group || ''}</span>
          <div class="match-actions">
            <button class="action-icon-btn ${isFav ? 'favorite-active' : ''}" 
                    onclick="window.toggleFavorite(${match.id})" 
                    title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ★
            </button>
            <button class="action-icon-btn" 
                    onclick="window.openShareModal(${match.id})" 
                    title="Share broadcast details">
              🔗
            </button>
          </div>
        </div>
        
        <div class="match-teams-display">
          <div class="team-row">
            <div class="team-info">
              <span class="team-flag">${homeFlag}</span>
              <span class="team-name">${match.teams.home}</span>
            </div>
            <span class="team-score" id="score-home-${match.id}">-</span>
          </div>
          <div class="team-row">
            <div class="team-info">
              <span class="team-flag">${awayFlag}</span>
              <span class="team-name">${match.teams.away}</span>
            </div>
            <span class="team-score" id="score-away-${match.id}">-</span>
          </div>
        </div>

        <div class="match-live-telemetry" id="live-telemetry-${match.id}" style="display: none;">
          <!-- Populated live by tickSimulation -->
        </div>

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

  // --- Helper: Team Flags Lookup ---
  function getTeamFlag(teamName) {
    const flags = {
      "Mexico": "🇲🇽", "Saudi Arabia": "🇸🇦", "United States": "🇺🇸", "Bolivia": "🇧🇴",
      "Canada": "🇨🇦", "Togo": "🇹🇬", "Germany": "🇩🇪", "Curacao": "🇨🇼",
      "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Côte d'Ivoire": "🇨🇮", "Ecuador": "🇪🇨",
      "Sweden": "🇸🇪", "Tunisia": "🇹🇳", "England": "🇬🇧", "New Zealand": "🇳🇿",
      "Argentina": "🇦🇷", "Slovakia": "🇸🇰", "Brazil": "🇧🇷", "Norway": "🇳🇴",
      "Spain": "🇪🇸", "Angola": "🇦🇴", "Italy": "🇮🇹", "Honduras": "🇭🇳"
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
        selectedCountry = country.code;
        userCountrySelect.value = country.code;
        updateLiveMatchBanner();
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
    const matchTimeStr = formatMatchTime(match.datetime, match.city);
    const channelNames = broadcasters.map(b => `${b.name} (${b.type === 'free' ? 'Free' : 'Paid'})`).join(", ") || "No local broadcasters registered";

    shareModalMatchDetails.innerHTML = `
      <strong>🏆 Stage:</strong> ${match.stage} (${match.group || 'Playoff'})<br>
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
    const matchTimeStr = formatMatchTime(m.datetime, m.city);
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
    const countryParam = params.get("country");
    if (countryParam && WORLD_CUP_DATA.countries.some(c => c.code === countryParam)) {
      selectedCountry = countryParam;
      userCountrySelect.value = countryParam;
      updateLiveMatchBanner();
      renderSchedule();
      renderBroadcasters();
      renderRegions();
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

  // --- Dynamic Live Match Simulation ---
  function tickSimulation() {
    // Use real system time
    simulatedTime = new Date();
    
    // Germany vs Curacao (Match ID: 4) starts at 17:00:00 UTC = 10:30 PM IST
    const matchStart = new Date("2026-06-14T17:00:00Z");
    const diffMs = simulatedTime - matchStart;
    const diffMins = Math.floor(diffMs / 60000);
    
    let isLive = false;
    let matchMinuteStr = "";
    let score = { home: 0, away: 0 };
    let events = [];

    if (diffMins >= 0 && diffMins <= 105) {
      isLive = true;
      if (diffMins <= 45) {
        matchMinuteStr = `${diffMins}'`;
      } else if (diffMins > 45 && diffMins <= 60) {
        matchMinuteStr = "HT";
      } else {
        const gameMin = diffMins - 15;
        matchMinuteStr = gameMin <= 90 ? `${gameMin}'` : "90+'";
      }

      const gameMin = diffMins <= 45 ? diffMins : (diffMins > 60 ? diffMins - 15 : 45);
      if (gameMin >= 12) {
        score.home = 1;
        events.push("⚽ 12' GOAL! T. Müller (GER)");
      }
      if (gameMin >= 28) {
        events.push("🟨 28' Yellow Card: J. Bacuna (CUW)");
      }
      if (gameMin >= 52) {
        score.home = 2;
        events.push("⚽ 52' GOAL! J. Musiala (GER)");
      }
      if (gameMin >= 75) {
        score.away = 1;
        events.push("⚽ 75' GOAL! J. Janga (CUW)");
      }
      if (gameMin >= 88) {
        events.push("🟨 88' Yellow Card: A. Rüdiger (GER)");
      }
    } else if (diffMins > 105) {
      score.home = 2;
      score.away = 1;
      matchMinuteStr = "FT";
      events = [
        "⚽ 12' GOAL! T. Müller (GER)",
        "🟨 28' Yellow Card: J. Bacuna (CUW)",
        "⚽ 52' GOAL! J. Musiala (GER)",
        "⚽ 75' GOAL! J. Janga (CUW)",
        "🟨 88' Yellow Card: A. Rüdiger (GER)"
      ];
    }

    // Call banner update so the top section keeps in sync
    updateLiveMatchBanner();

    // Update Match Card values (Match 4)
    const scoreHomeEl = document.getElementById("score-home-4");
    const scoreAwayEl = document.getElementById("score-away-4");
    const telemetryEl = document.getElementById("live-telemetry-4");

    if (scoreHomeEl && scoreAwayEl) {
      if (isLive || diffMins > 105) {
        scoreHomeEl.textContent = score.home;
        scoreAwayEl.textContent = score.away;
      } else {
        scoreHomeEl.textContent = "-";
        scoreAwayEl.textContent = "-";
      }
    }

    if (telemetryEl) {
      if (isLive || diffMins > 105) {
        telemetryEl.style.display = "flex";
        let eventsHTML = `
          <div class="live-minute-badge-card">
            <span>🔴</span> ${isLive ? 'Live ' + matchMinuteStr : 'Full Time (FT)'}
          </div>
        `;
        if (events.length > 0) {
          const displayEvents = [...events].reverse().slice(0, 3);
          displayEvents.forEach(evt => {
            eventsHTML += `<div class="live-event-item">${evt}</div>`;
          });
        } else {
          eventsHTML += `<div class="live-event-item" style="font-style:italic;color:var(--text-muted)">Game underway. Waiting for events...</div>`;
        }
        telemetryEl.innerHTML = eventsHTML;
      } else {
        telemetryEl.style.display = "none";
      }
    }
  }

  // Run initial setup
  init();
});
