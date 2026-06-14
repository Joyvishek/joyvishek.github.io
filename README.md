# Kickoff 26 - FIFA World Cup 2026 Viewing Portal

A production-ready, highly polished, zero-cost static website to help users discover legal broadcasters, free-to-air (FTA) channels, free official streaming platforms, and subscription services for the FIFA World Cup 2026 worldwide.

This portal is designed to run completely on **GitHub Pages** with no backend, database, or API keys required.

## Features

- **Hero & Live Alert Banner:** Real-time updates showing live or upcoming matches (relative to simulated date June 14, 2026) with direct access buttons to official channels based on the user's country.
- **Match Schedule Dashboard:** Interactive calendar featuring filters for tournament stages, teams, cities, and a timezone switcher (My Local Time vs. Local Stadium Time).
- **Favorites & Bookmarks:** Users can favorite matches (saved automatically inside `localStorage`) and toggle a view to see only their personalized match calendar.
- **Dynamic Broadcaster Guide:** Clean listing of official channels for the selected country, showing pricing details (Free, Free-to-Air, Paid/Subscription), languages, and device medium support.
- **Interactive Regional Explorer:** Continental directory listing 16 countries and 30+ official networks with stats. Switch country focal point by clicking any card.
- **Service Comparison Table:** Overview of all broadcasters categorized by access tier, cost, language, and URL links.
- **Match-Sharing System:** Share match info card or exact site URLs (with parameters like `?match=4&country=US`) with friends. Highlighting logic triggers automatically if visiting from shared link.
- **Dark/Light Mode:** Toggleable color themes.

## File Structure

```
d:/Projects/fifa-world-cup-2026-portal/
├── index.html     # Semantic markup structure, SVG assets, and modals
├── style.css      # Custom styling tokens, light/dark modes, glassmorphism
├── data.js        # Global dataset containing matches, teams, and broadcasters
├── script.js      # App state handlers, local storage, timezone utilities
└── README.md      # Deployment guide & documentation
```

## How to Extend the Broadcaster Data

To add new countries or broadcasters, simply update the array objects in `data.js`:

### Adding a Country
Add to the `countries` list:
```javascript
{ code: "CA", name: "Canada", flag: "🇨🇦", region: "North America" }
```

### Adding a Broadcaster
Add to the `broadcasters` list:
```javascript
{
  id: "tsn",
  name: "TSN",
  countries: ["CA"],
  type: "paid",
  price: "Paid Cable / Subscription",
  medium: ["TV", "Web", "App"],
  link: "https://www.tsn.ca",
  languages: ["English"],
  coverage: "Complete live coverage of all 104 matches.",
  logoColor: "#d32f2f"
}
```

---

## Deployment to GitHub Pages

Since this application is 100% client-side HTML/CSS/JS, you can host it for free on GitHub Pages.

### Step 1: Create a GitHub Repository
1. Log in to your GitHub account.
2. Create a new repository named `fifa-world-cup-2026-portal` (or any name you prefer).
3. Set the repository visibility to **Public**.

### Step 2: Push the Files
Initialize git and push the files to your repository:
```bash
git init
git add .
git commit -m "Initial commit of World Cup 2026 viewing portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fifa-world-cup-2026-portal.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository page on GitHub.
2. Click on **Settings** in the top navigation bar.
3. In the left-hand menu, under the **Code and automation** section, click on **Pages**.
4. Under **Build and deployment**, set the source to **Deploy from a branch**.
5. Choose **main** (or your primary branch) and select `/root` as the folder.
6. Click **Save**.

Within a couple of minutes, your site will be live at:
`https://YOUR_USERNAME.github.io/fifa-world-cup-2026-portal/`
