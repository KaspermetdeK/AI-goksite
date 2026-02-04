**Design Doc**

**Project**
Nexed Arcade — web‑based mini‑game hub met virtuele coins, shop en inventory.

**Tech Stack**
- HTML5 + CSS3 (custom styling, responsive layout)
- Vanilla JavaScript (game logic, UI state, localStorage)
- Canvas 2D API (Drive Rush 2D, Mini Dash, Plinko)
- Google Fonts (Chakra Petch, Space Grotesk)

**Globale Architectuur**
- Single‑page interface: `index.html` met game panels en sidebar.
- UI state in `app.js`: actieve game, coins, inventory, shop.
- Local persistence via `localStorage` voor coins, inventory, thema’s, VIP.
- Canvas‑games render loop per game (requestAnimationFrame).
- Shop en inventory driven by data attributes + JS handlers.

**Belangrijke Keuzes**
- Geen backend: snelle iteratie en eenvoudig te hosten als static site.
- Virtual coins only: geen echte betalingen of uitbetalingen.
- Unieke items in inventory: voorkomt duplicates en vereenvoudigt UX.
- Thema’s via body‑class: lichtgewicht en snel te togglen.

**Bekende Risico’s**
- Geen server‑side validatie: data kan worden aangepast via devtools.
- Performance op oudere devices bij meerdere canvas‑loops.
- Geen account/login: voortgang is apparaat‑gebonden (localStorage).
- Kansspellen kunnen als gambling‑achtig worden ervaren; duidelijke disclaimers nodig.
