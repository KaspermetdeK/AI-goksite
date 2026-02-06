const balanceEl = document.getElementById("coinBalance");
const dailyBonusBtn = document.getElementById("dailyBonus");

const games = {
  slot: {
    title: "Slot Machine",
    subtitle: "Draai de reels en pak de jackpot.",
    tag: "Casino"
  },
  driving: {
    title: "Drive Rush 2D",
    subtitle: "Terraria-stijl side scroller met obstakels.",
    tag: "Arcade"
  },
  memory: {
    title: "Memory",
    subtitle: "Match alle paren met zo min mogelijk misses.",
    tag: "Puzzle"
  },
  dash: {
    title: "Mini Dash",
    subtitle: "Spring over spikes en haal je afstand goals.",
    tag: "Runner"
  },
  plinko: {
    title: "Plinko",
    subtitle: "Laat de bal vallen en pak multipliers.",
    tag: "Chance"
  },
  grid: {
    title: "Treasure Grid",
    subtitle: "9x9 grid met 1 bom en 1 grote schat.",
    tag: "Strategy"
  },
  crash: {
    title: "Crash Gamble",
    subtitle: "Cash out voor de crash om winst te pakken.",
    tag: "Casino"
  },
  dice: {
    title: "Dice Duel",
    subtitle: "Voorspel hoog of laag.",
    tag: "Casino"
  },
  roulette: {
    title: "Roulette Glow",
    subtitle: "Kies een kleur en spin de wheel.",
    tag: "Casino"
  },
  coinflip: {
    title: "Coin Flip",
    subtitle: "50/50? Test je geluk.",
    tag: "Chance"
  }
};

const panels = document.querySelectorAll("[data-panel]");
const gameButtons = document.querySelectorAll(".game-btn");
const gameTitle = document.getElementById("gameTitle");
const gameSubtitle = document.getElementById("gameSubtitle");
const gameTag = document.getElementById("gameTag");
const gameStatus = document.getElementById("gameStatus");

const leaderList = document.getElementById("leaderList");
const leaderboardData = [
  { name: "NovaFlux", score: 12400 },
  { name: "ByteRider", score: 9800 },
  { name: "EchoPulse", score: 7600 },
  { name: "Skyline", score: 5400 }
];

const balanceKey = "nexed_arcade_balance";
const bonusKey = "nexed_arcade_bonus";
const vipKey = "nexed_arcade_vip";
let balance = Number(localStorage.getItem(balanceKey) || 150);
const inventoryKey = "nexed_arcade_inventory";
const themeKey = "nexed_arcade_theme";
let inventory = JSON.parse(localStorage.getItem(inventoryKey) || "[]");
let vipActive = localStorage.getItem(vipKey) === "true";

const shopItemsKey = "nexed_arcade_shop";
let shopItems = JSON.parse(localStorage.getItem(shopItemsKey) || JSON.stringify([
  { id: "dashShield", name: "Dash Shield", type: "powerup", cost: 120, emoji: "âš¡" },
  { id: "driveMagnet", name: "Drive Magnet", type: "powerup", cost: 150, emoji: "ðŸ§²" },
  { id: "plinkoLuck", name: "Plinko Luck", type: "powerup", cost: 200, emoji: "ðŸŽ¯" },
  { id: "extraLife", name: "Extra Life", type: "boost", cost: 180, emoji: "â¤ï¸" },
  { id: "slowMo", name: "Slow-Mo Token", type: "boost", cost: 160, emoji: "ðŸ•’" },
  { id: "winBoost", name: "Win Boost", type: "boost", cost: 220, emoji: "ðŸš€" },
  { id: "theme-neon", name: "Neon City", type: "theme", cost: 300, emoji: "ðŸŒŒ" },
  { id: "theme-forest", name: "Pixel Forest", type: "theme", cost: 300, emoji: "ðŸŒ²" },
  { id: "theme-sunset", name: "Sunset Grid", type: "theme", cost: 300, emoji: "ðŸŒ…" },
  { id: "avatar-arcade", name: "Arcade Avatar", type: "cosmetic", cost: 120, emoji: "ðŸ•¹ï¸" },
  { id: "badge-legend", name: "Legend Badge", type: "cosmetic", cost: 140, emoji: "ðŸ…" },
  { id: "trail-neon", name: "Neon Trail", type: "cosmetic", cost: 160, emoji: "âœ¨" },
  { id: "frame-gold", name: "Gold Frame", type: "frame", cost: 200, emoji: "ðŸ–¼ï¸" },
  { id: "frame-aurora", name: "Aurora Frame", type: "frame", cost: 220, emoji: "ðŸŒˆ" },
  { id: "sound-arcade", name: "Arcade Clicks", type: "sound", cost: 130, emoji: "ðŸŽ›ï¸" },
  { id: "sound-synth", name: "Synth Pack", type: "sound", cost: 150, emoji: "ðŸŽ¹" },
  { id: "skin-cyber", name: "Cyber Runner", type: "skin", cost: 260, emoji: "ðŸ§¬" },
  { id: "skin-crimson", name: "Crimson Bolt", type: "skin", cost: 260, emoji: "ðŸ”¥" },
  { id: "vip-pass", name: "VIP Pass", type: "vip", cost: 500, emoji: "ðŸ‘‘" },
  { id: "loot-basic", name: "Basic Loot Box", type: "loot", cost: 180, emoji: "ðŸ“¦" },
  { id: "loot-epic", name: "Epic Loot Box", type: "loot", cost: 320, emoji: "ðŸ’Ž" }
]));

const rarityClass = (rarity) => {
  const key = (rarity || "common").toLowerCase();
  return `rarity rarity-${key}`;
};

const saveInventory = () => {
  localStorage.setItem(inventoryKey, JSON.stringify(inventory));
  renderInventory();
};

const saveShopItems = () => {
  localStorage.setItem(shopItemsKey, JSON.stringify(shopItems));
  renderShop();
  renderAdminList();
};

const normalizeInventory = () => {
  if (!Array.isArray(inventory)) {
    inventory = [];
    return;
  }
  if (inventory.length && typeof inventory[0] === "string") {
    inventory = inventory.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      type: "legacy",
      rarity: "common",
      emoji: "ðŸ“¦"
    }));
    saveInventory();
  }
};

const addUniqueItem = (item) => {
  const exists = inventory.some(existing => existing.id === item.id);
  if (exists) {
    gameStatus.textContent = "Item al in inventory.";
    return false;
  }
  inventory.push(item);
  saveInventory();
  return true;
};

const updateBalance = (amount = 0, reason = "") => {
  balance = Math.max(0, balance + amount);
  localStorage.setItem(balanceKey, balance);
  balanceEl.textContent = balance.toString();
  if (reason) {
    gameStatus.textContent = reason;
  }
};

const canAfford = (cost) => {
  if (balance < cost) {
    gameStatus.textContent = "Niet genoeg coins.";
    return false;
  }
  updateBalance(-cost, `-${cost} coins ingezet`);
  return true;
};

const renderLeaderboard = () => {
  leaderList.innerHTML = "";
  leaderboardData.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "leader-item";
    row.innerHTML = `<span>#${index + 1} ${item.name}</span><strong>${item.score}</strong>`;
    leaderList.appendChild(row);
  });
};

const inventoryCosmetics = document.getElementById("inventoryCosmetics");
const inventoryOther = document.getElementById("inventoryOther");
const legacyInventoryList = document.getElementById("inventoryList");
const renderInventory = () => {
  const cosmetics = inventory.filter(item =>
    ["cosmetic", "theme", "skin", "frame"].includes(item.type)
  );
  const other = inventory.filter(item =>
    !["cosmetic", "theme", "skin", "frame"].includes(item.type)
  );

  if (inventoryCosmetics && inventoryOther) {
    inventoryCosmetics.innerHTML = cosmetics.length
      ? cosmetics.map(item => `
        <div class="inventory-item">
          <span>${item.emoji} ${item.name}</span>
          <em class="${rarityClass(item.rarity)}">${item.rarity}</em>
        </div>
      `).join("")
      : "Nog geen items.";
    inventoryOther.innerHTML = other.length
      ? other.map(item => `
        <div class="inventory-item">
          <span>${item.emoji} ${item.name}</span>
          <em class="${rarityClass(item.rarity)}">${item.rarity}</em>
        </div>
      `).join("")
      : "Nog geen items.";
    return;
  }

  if (legacyInventoryList) {
    const combined = [...cosmetics, ...other];
    legacyInventoryList.innerHTML = combined.length
      ? combined.map(item => `
        <div class="inventory-item">
          <span>${item.emoji} ${item.name}</span>
          <em class="${rarityClass(item.rarity)}">${item.rarity}</em>
        </div>
      `).join("")
      : "Nog geen items.";
  }
};

const extractItemName = (text) => (
  text.replace(/\s+[-]\s+.*$/, "").trim()
);

const applyTheme = (themeId) => {
  document.body.classList.remove("theme-neon", "theme-forest", "theme-sunset");
  if (themeId) {
    document.body.classList.add(themeId);
    localStorage.setItem(themeKey, themeId);
  }
};

const showGame = (key) => {
  panels.forEach(panel => panel.classList.add("hidden"));
  document.getElementById(key).classList.remove("hidden");
  gameButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.game === key));
  gameTitle.textContent = games[key].title;
  gameSubtitle.textContent = games[key].subtitle;
  gameTag.textContent = games[key].tag;
  gameStatus.textContent = "Klaar om te spelen";
};

gameButtons.forEach(btn => {
  btn.addEventListener("click", () => showGame(btn.dataset.game));
});

const today = new Date().toDateString();
if (localStorage.getItem(bonusKey) === today) {
  dailyBonusBtn.disabled = true;
  dailyBonusBtn.textContent = "Bonus gepakt";
}

dailyBonusBtn.addEventListener("click", () => {
  const bonus = vipActive ? 80 : 50;
  updateBalance(bonus, `+${bonus} daily bonus`);
  localStorage.setItem(bonusKey, today);
  dailyBonusBtn.disabled = true;
  dailyBonusBtn.textContent = "Bonus gepakt";
});

updateBalance();
renderLeaderboard();
normalizeInventory();
renderInventory();
applyTheme(localStorage.getItem(themeKey));

// Prevent page scroll on space during games
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    const activePanel = document.querySelector(".game-panel:not(.hidden)");
    if (activePanel && (activePanel.id === "dash" || activePanel.id === "driving")) {
      event.preventDefault();
    }
  }
}, { passive: false });

// Shop handlers
document.querySelectorAll(".shop-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.buy;
    if (type === "pack") {
      const amount = Number(btn.dataset.amount || 0);
      const price = btn.dataset.price || "";
      updateBalance(amount, `Pack gekocht +${amount} coins`);
      gameStatus.textContent = `Simulatie: â‚¬${price} pack toegevoegd.`;
      return;
    }

    const cost = Number(btn.dataset.cost || 0);
    const id = btn.dataset.id;
    const itemName = extractItemName(btn.textContent);
    const alreadyOwned = inventory.some(item => item.id === id);
    if (type !== "loot" && type !== "pack" && alreadyOwned) {
      gameStatus.textContent = "Item al in inventory.";
      return;
    }
    if (type !== "loot" && type !== "pack" && !canAfford(cost)) return;

    if (type === "powerup") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "rare", emoji: "âš¡" });
      if (added) gameStatus.textContent = "Power-up toegevoegd.";
      return;
    }

    if (type === "theme") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "epic", emoji: "ðŸŒŒ" });
      if (added) {
        applyTheme(id);
        gameStatus.textContent = "Theme geactiveerd.";
      }
      return;
    }

    if (type === "boost") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "rare", emoji: "ðŸš€" });
      if (added) gameStatus.textContent = "Boost toegevoegd.";
      return;
    }

    if (type === "cosmetic") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "common", emoji: "âœ¨" });
      if (added) gameStatus.textContent = "Cosmetic toegevoegd.";
      return;
    }

    if (type === "frame") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "rare", emoji: "ðŸ–¼ï¸" });
      if (added) gameStatus.textContent = "Frame toegevoegd.";
      return;
    }

    if (type === "sound") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "common", emoji: "ðŸŽ›ï¸" });
      if (added) gameStatus.textContent = "Sound pack toegevoegd.";
      return;
    }

    if (type === "skin") {
      const added = addUniqueItem({ id, name: itemName, type, rarity: "epic", emoji: "ðŸ§¬" });
      if (added) gameStatus.textContent = "Skin toegevoegd.";
      return;
    }

    if (type === "vip") {
      if (addUniqueItem({ id, name: "VIP Pass", type, rarity: "legendary", emoji: "ðŸ‘‘" })) {
        vipActive = true;
        localStorage.setItem(vipKey, "true");
        gameStatus.textContent = "VIP actief. Daily bonus verhoogd.";
      }
      return;
    }

    if (type === "loot") {
      const lootPool = [
        { id: "dashShield", name: "Dash Shield", type: "powerup", rarity: "rare", emoji: "âš¡" },
        { id: "driveMagnet", name: "Drive Magnet", type: "powerup", rarity: "rare", emoji: "ðŸ§²" },
        { id: "extraLife", name: "Extra Life", type: "boost", rarity: "rare", emoji: "â¤ï¸" },
        { id: "slowMo", name: "Slow-Mo Token", type: "boost", rarity: "rare", emoji: "ðŸ•’" },
        { id: "theme-neon", name: "Neon City", type: "theme", rarity: "epic", emoji: "ðŸŒŒ" },
        { id: "theme-forest", name: "Pixel Forest", type: "theme", rarity: "epic", emoji: "ðŸŒ²" },
        { id: "skin-cyber", name: "Cyber Runner", type: "skin", rarity: "epic", emoji: "ðŸ§¬" },
        { id: "frame-gold", name: "Gold Frame", type: "frame", rarity: "legendary", emoji: "ðŸ–¼ï¸" },
        { id: "avatar-arcade", name: "Arcade Avatar", type: "cosmetic", rarity: "common", emoji: "ðŸ•¹ï¸" },
        { id: "badge-legend", name: "Legend Badge", type: "cosmetic", rarity: "rare", emoji: "ðŸ…" },
        { id: "trail-neon", name: "Neon Trail", type: "cosmetic", rarity: "epic", emoji: "âœ¨" }
      ];
      const available = lootPool.filter(item => !inventory.some(existing => existing.id === item.id));
      if (!available.length) {
        gameStatus.textContent = "Alle loot items al in inventory.";
        return;
      }
      if (!canAfford(cost)) return;
      const reward = available[Math.floor(Math.random() * available.length)];
      if (addUniqueItem(reward)) {
        if (reward.type === "theme") applyTheme(reward.id);
        gameStatus.textContent = `Loot box: ${reward.emoji} ${reward.name} (${reward.rarity})`;
      }
      return;
    }
  });
});

// Slot Machine
const reels = [document.getElementById("reel1"), document.getElementById("reel2"), document.getElementById("reel3")];
const spinBtn = document.getElementById("spinSlot");

spinBtn.addEventListener("click", () => {
  if (!canAfford(5)) return;
  const values = reels.map(reel => {
    const val = Math.floor(Math.random() * 9) + 1;
    reel.textContent = val;
    return val;
  });
  const win = values.every(v => v === values[0]);
  if (win) {
    updateBalance(50, "Jackpot! +50 coins");
  } else if (values[0] === values[1] || values[1] === values[2]) {
    updateBalance(10, "Kleine winst +10 coins");
  } else {
    gameStatus.textContent = "Geen match. Probeer opnieuw.";
  }
});

// Memory
const memoryGrid = document.getElementById("memoryGrid");
let memoryValues = [];
let memoryFlipped = [];
let memoryMatched = 0;

const resetMemory = () => {
  const symbols = ["<ï¿½", "<ï¿½", "<ï¿½", ">A", "<ï¿½", "<ï¿½"];
  memoryValues = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  memoryGrid.innerHTML = "";
  memoryFlipped = [];
  memoryMatched = 0;

  memoryValues.forEach((symbol, index) => {
    const btn = document.createElement("button");
    btn.className = "memory-card";
    btn.dataset.symbol = symbol;
    btn.dataset.index = index;
    btn.textContent = "?";
    btn.addEventListener("click", () => flipCard(btn));
    memoryGrid.appendChild(btn);
  });
};

const flipCard = (card) => {
  if (card.classList.contains("matched") || memoryFlipped.includes(card)) return;
  if (memoryFlipped.length >= 2) return;
  card.textContent = card.dataset.symbol;
  memoryFlipped.push(card);
  if (memoryFlipped.length === 2) {
    const [a, b] = memoryFlipped;
    if (a.dataset.symbol === b.dataset.symbol) {
      a.classList.add("matched");
      b.classList.add("matched");
      memoryMatched += 1;
      memoryFlipped = [];
      if (memoryMatched === 6) {
        updateBalance(80, "Memory completed! +80 coins");
      }
    } else {
      setTimeout(() => {
        a.textContent = "?";
        b.textContent = "?";
        memoryFlipped = [];
      }, 600);
    }
  }
};

resetMemory();

document.getElementById("resetMemory").addEventListener("click", resetMemory);

// Drive Rush 2D (side scroller)
const driveCanvas = document.getElementById("driveCanvas");
const driveCtx = driveCanvas.getContext("2d");
let driving = false;
let runnerX = 80;
let runnerY = 0;
let runnerV = 0;
let driveScore = 0;
let driveObstacles = [];

const resetDriving = () => {
  runnerY = 0;
  runnerV = 0;
  driveScore = 0;
  driveObstacles = [];
};

const spawnDriveObstacle = () => {
  driveObstacles.push({ x: driveCanvas.width + 20, width: 24 + Math.random() * 20, height: 30 + Math.random() * 30 });
};

const drawDriving = () => {
  driveCtx.clearRect(0, 0, driveCanvas.width, driveCanvas.height);
  driveCtx.fillStyle = "#0b1220";
  driveCtx.fillRect(0, 0, driveCanvas.width, driveCanvas.height);

  driveCtx.fillStyle = "#1e293b";
  driveCtx.fillRect(0, driveCanvas.height - 50, driveCanvas.width, 50);

  driveCtx.fillStyle = "#22d3ee";
  driveCtx.fillRect(runnerX, driveCanvas.height - 50 - 40 - runnerY, 32, 40);

  driveCtx.fillStyle = "#f97316";
  driveObstacles.forEach(obs => {
    driveCtx.fillRect(obs.x, driveCanvas.height - 50 - obs.height, obs.width, obs.height);
  });

  driveCtx.fillStyle = "#e5edff";
  driveCtx.fillText(`Score: ${driveScore}`, 16, 24);
};

const updateDriving = () => {
  if (!driving) return;
  driveScore += 1;
  if (Math.random() < 0.04) spawnDriveObstacle();
  driveObstacles.forEach(obs => { obs.x -= 6; });
  driveObstacles = driveObstacles.filter(obs => obs.x > -60);

  runnerV -= 0.6;
  runnerY = Math.max(0, runnerY + runnerV);
  if (runnerY === 0) runnerV = 0;

  const hit = driveObstacles.some(obs => {
    const playerBottom = driveCanvas.height - 50 - runnerY;
    const playerTop = playerBottom - 40;
    const playerLeft = runnerX;
    const playerRight = runnerX + 32;
    const obsBottom = driveCanvas.height - 50;
    const obsTop = obsBottom - obs.height;
    return playerRight > obs.x && playerLeft < obs.x + obs.width && playerBottom > obsTop && playerTop < obsBottom;
  });

  if (hit) {
    driving = false;
    updateBalance(Math.floor(driveScore / 4), `Crash! +${Math.floor(driveScore / 4)} coins`);
    gameStatus.textContent = "Drive ended";
    return;
  }

  drawDriving();
  requestAnimationFrame(updateDriving);
};

const jumpDrive = () => {
  if (!driving) return;
  if (runnerY === 0) runnerV = 11;
};

window.addEventListener("keydown", (event) => {
  if (!driving) return;
  if (event.code === "Space") {
    jumpDrive();
  }
});

document.getElementById("startDrive").addEventListener("click", () => {
  resetDriving();
  driving = true;
  updateDriving();
});

// Mini Dash
const dashCanvas = document.getElementById("dashCanvas");
const dashCtx = dashCanvas.getContext("2d");
let dashing = false;
let dashY = 0;
let dashV = 0;
let dashScore = 0;
let spikes = [];

const resetDash = () => {
  dashY = 0;
  dashV = 0;
  dashScore = 0;
  spikes = [];
};

const spawnSpike = () => {
  spikes.push({ x: dashCanvas.width + 20 });
};

const drawDash = () => {
  dashCtx.clearRect(0, 0, dashCanvas.width, dashCanvas.height);
  dashCtx.fillStyle = "#0b1220";
  dashCtx.fillRect(0, 0, dashCanvas.width, dashCanvas.height);

  dashCtx.fillStyle = "#1e293b";
  dashCtx.fillRect(0, dashCanvas.height - 40, dashCanvas.width, 40);

  dashCtx.fillStyle = "#a3e635";
  dashCtx.fillRect(60, dashCanvas.height - 40 - 40 - dashY, 30, 40);

  dashCtx.fillStyle = "#f43f5e";
  spikes.forEach(spike => {
    dashCtx.beginPath();
    dashCtx.moveTo(spike.x, dashCanvas.height - 40);
    dashCtx.lineTo(spike.x + 16, dashCanvas.height - 80);
    dashCtx.lineTo(spike.x + 32, dashCanvas.height - 40);
    dashCtx.closePath();
    dashCtx.fill();
  });

  dashCtx.fillStyle = "#e5edff";
  dashCtx.fillText(`${dashScore}m`, 16, 24);
};

const updateDash = () => {
  if (!dashing) return;
  dashScore += 1;
  if (Math.random() < 0.04) spawnSpike();
  spikes.forEach(spike => { spike.x -= 6; });
  spikes = spikes.filter(spike => spike.x > -40);

  dashV -= 0.6;
  dashY = Math.max(0, dashY + dashV);
  if (dashY === 0) dashV = 0;

  const hit = spikes.some(spike => spike.x < 90 && spike.x > 40 && dashY < 20);
  if (hit) {
    dashing = false;
    const reward = Math.floor(dashScore / 8);
    updateBalance(reward, `Run ended +${reward} coins`);
    return;
  }

  drawDash();
  requestAnimationFrame(updateDash);
};

window.addEventListener("keydown", (event) => {
  if (!dashing) return;
  if (event.code === "Space" && dashY === 0) {
    dashV = 10;
  }
});

document.getElementById("startDash").addEventListener("click", () => {
  resetDash();
  dashing = true;
  updateDash();
});

// Plinko
const plinkoCanvas = document.getElementById("plinkoCanvas");
const plinkoCtx = plinkoCanvas.getContext("2d");
let plinkoBall = null;
const pegs = [];
const multipliers = [0, 1, 2, 5, 2, 1, 0];

for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    pegs.push({
      x: 80 + col * 90 + (row % 2) * 45,
      y: 80 + row * 50
    });
  }
}

const drawPlinko = () => {
  plinkoCtx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
  plinkoCtx.fillStyle = "#0a1020";
  plinkoCtx.fillRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);

  plinkoCtx.fillStyle = "#22d3ee";
  pegs.forEach(peg => {
    plinkoCtx.beginPath();
    plinkoCtx.arc(peg.x, peg.y, 6, 0, Math.PI * 2);
    plinkoCtx.fill();
  });

  multipliers.forEach((m, i) => {
    plinkoCtx.fillStyle = m >= 2 ? "#f97316" : "#1f2937";
    plinkoCtx.fillRect(40 + i * 90, plinkoCanvas.height - 40, 70, 30);
    plinkoCtx.fillStyle = "#e5edff";
    plinkoCtx.fillText(`${m}x`, 60 + i * 90, plinkoCanvas.height - 20);
  });

  if (plinkoBall) {
    plinkoCtx.fillStyle = "#a3e635";
    plinkoCtx.beginPath();
    plinkoCtx.arc(plinkoBall.x, plinkoBall.y, 10, 0, Math.PI * 2);
    plinkoCtx.fill();
  }
};

const updatePlinko = () => {
  if (!plinkoBall) return;
  plinkoBall.vy += 0.2;
  plinkoBall.x += plinkoBall.vx;
  plinkoBall.y += plinkoBall.vy;

  pegs.forEach(peg => {
    const dx = plinkoBall.x - peg.x;
    const dy = plinkoBall.y - peg.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 14) {
      plinkoBall.vx += dx * 0.05;
      plinkoBall.vy *= -0.5;
    }
  });

  if (plinkoBall.y > plinkoCanvas.height - 50) {
    const slot = Math.min(multipliers.length - 1, Math.max(0, Math.floor((plinkoBall.x - 40) / 90)));
    const reward = multipliers[slot] * 10;
    updateBalance(reward, `Plinko payout +${reward}`);
    plinkoBall = null;
  }

  drawPlinko();
  requestAnimationFrame(updatePlinko);
};

document.getElementById("dropPlinko").addEventListener("click", () => {
  if (!canAfford(5) || plinkoBall) return;
  plinkoBall = { x: plinkoCanvas.width / 2, y: 20, vx: (Math.random() - 0.5) * 2, vy: 1 };
  updatePlinko();
});

drawPlinko();

// Treasure Grid
const treasureGrid = document.getElementById("treasureGrid");
const gridEarningsEl = document.getElementById("gridEarnings");
const gridBetInput = document.getElementById("gridBet");
const startGridBtn = document.getElementById("startGrid");
const cashoutGridBtn = document.getElementById("cashoutGrid");
const resetGridBtn = document.getElementById("resetGrid");

const gridSize = 6;
let gridData = [];
let gridBombIndex = 0;
let gridBigIndex = 0;
let gridEarnings = 0;
let gridActive = false;
let currentGridBet = 10;

const updateGridEarnings = (amount = 0) => {
  gridEarnings = Math.max(0, gridEarnings + amount);
  gridEarningsEl.textContent = gridEarnings.toString();
};

const resetGrid = () => {
  gridData = Array.from({ length: gridSize * gridSize }, () => ({ revealed: false, type: "empty" }));
  gridBombIndex = Math.floor(Math.random() * gridData.length);
  do {
    gridBigIndex = Math.floor(Math.random() * gridData.length);
  } while (gridBigIndex === gridBombIndex);

  gridData[gridBombIndex].type = "bomb";
  gridData[gridBigIndex].type = "big";

  treasureGrid.innerHTML = "";
  gridData.forEach((cell, index) => {
    const btn = document.createElement("button");
    btn.className = "grid-tile";
    btn.dataset.index = index;
    btn.textContent = "?";
    btn.addEventListener("click", () => revealTile(index, btn));
    treasureGrid.appendChild(btn);
  });
};

const endGridRound = (message) => {
  gridActive = false;
  cashoutGridBtn.disabled = true;
  gameStatus.textContent = message;
};

const startGridRound = () => {
  const bet = Math.max(1, Number(gridBetInput.value || 1));
  if (!canAfford(bet)) return;
  currentGridBet = bet;
  updateGridEarnings(-gridEarnings);
  gridActive = true;
  cashoutGridBtn.disabled = false;
  resetGrid();
  gameStatus.textContent = `Ronde gestart (bet ${bet})`;
};

const cashoutGrid = () => {
  if (!gridActive) return;
  updateBalance(gridEarnings, `Cash out +${gridEarnings} coins`);
  updateGridEarnings(-gridEarnings);
  endGridRound("Cashed out");
};

const revealTile = (index, btn) => {
  if (!gridActive) {
    gameStatus.textContent = "Start eerst een ronde.";
    return;
  }
  const cell = gridData[index];
  if (cell.revealed) return;
  cell.revealed = true;
  btn.classList.add("revealed");

  if (cell.type === "bomb") {
    btn.classList.add("bomb");
    btn.textContent = "ðŸ’£";
    updateGridEarnings(-gridEarnings);
    endGridRound("Boom! Ronde verloren.");
  } else if (cell.type === "big") {
    btn.classList.add("big");
    btn.textContent = "ðŸ’°";
    updateGridEarnings(200 * (currentGridBet / 10));
  } else {
    btn.classList.add("good");
    btn.textContent = "+";
    updateGridEarnings(5 * (currentGridBet / 10));
  }
};

resetGrid();

startGridBtn.addEventListener("click", startGridRound);
cashoutGridBtn.addEventListener("click", cashoutGrid);
resetGridBtn.addEventListener("click", resetGrid);

// Crash Gamble
const crashMultiplierEl = document.getElementById("crashMultiplier");
const crashBetInput = document.getElementById("crashBet");
const startCrashBtn = document.getElementById("startCrash");
const cashOutBtn = document.getElementById("cashOut");
const crashLog = document.getElementById("crashLog");

let crashRunning = false;
let crashMultiplier = 1;
let crashInterval = null;
let crashPoint = 0;
let crashBet = 0;

const startCrash = () => {
  if (crashRunning) return;
  crashBet = Math.max(1, Number(crashBetInput.value || 1));
  if (!canAfford(crashBet)) return;

  crashRunning = true;
  crashMultiplier = 1;
  crashPoint = 1.2 + Math.random() * 3.5;
  crashLog.textContent = "Running... Cash out voordat de crash komt.";
  cashOutBtn.disabled = false;

  crashInterval = setInterval(() => {
    crashMultiplier += 0.02 + crashMultiplier * 0.01;
    crashMultiplierEl.textContent = `${crashMultiplier.toFixed(2)}x`;
    if (crashMultiplier >= crashPoint) {
      clearInterval(crashInterval);
      crashRunning = false;
      cashOutBtn.disabled = true;
      crashLog.textContent = `Crashed op ${crashPoint.toFixed(2)}x. Geen winst.`;
    }
  }, 60);
};

const cashOut = () => {
  if (!crashRunning) return;
  clearInterval(crashInterval);
  crashRunning = false;
  cashOutBtn.disabled = true;
  const payout = Math.floor(crashBet * crashMultiplier);
  updateBalance(payout, `Cash out +${payout} coins`);
  crashLog.textContent = `Uitbetaald op ${crashMultiplier.toFixed(2)}x.`;
};

startCrashBtn.addEventListener("click", startCrash);
cashOutBtn.addEventListener("click", cashOut);

// Dice
const diceValue = document.getElementById("diceValue");
let diceGuess = null;

document.querySelectorAll("#dice .btn-outline").forEach(btn => {
  btn.addEventListener("click", () => {
    diceGuess = btn.dataset.guess;
    gameStatus.textContent = `Gekozen: ${diceGuess}`;
  });
});

document.getElementById("rollDice").addEventListener("click", () => {
  if (!diceGuess) {
    gameStatus.textContent = "Kies eerst hoog of laag";
    return;
  }
  if (!canAfford(3)) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  diceValue.textContent = roll;
  const win = (diceGuess === "low" && roll <= 3) || (diceGuess === "high" && roll >= 4);
  if (win) updateBalance(8, "Dice win +8 coins");
  else gameStatus.textContent = "Geen winst";
});

// Roulette
const rouletteWheel = document.getElementById("rouletteWheel");
let roulettePick = null;

const rouletteColors = ["red", "black", "gold", "red", "black", "red", "black", "red", "black", "gold"];

document.querySelectorAll("#roulette .btn-outline").forEach(btn => {
  btn.addEventListener("click", () => {
    roulettePick = btn.dataset.color;
    gameStatus.textContent = `Gekozen: ${roulettePick}`;
  });
});

document.getElementById("spinRoulette").addEventListener("click", () => {
  if (!roulettePick) {
    gameStatus.textContent = "Kies een kleur";
    return;
  }
  if (!canAfford(4)) return;
  const result = rouletteColors[Math.floor(Math.random() * rouletteColors.length)];
  rouletteWheel.textContent = result.toUpperCase();
  if (result === roulettePick) {
    const reward = result === "gold" ? 20 : 12;
    updateBalance(reward, `Roulette win +${reward}`);
  } else {
    gameStatus.textContent = "Geen winst";
  }
});

// Coin Flip
const coinFace = document.getElementById("coinFace");
let coinPick = null;

document.querySelectorAll("#coinflip .btn-outline").forEach(btn => {
  btn.addEventListener("click", () => {
    coinPick = btn.dataset.face;
    gameStatus.textContent = `Gekozen: ${coinPick}`;
  });
});

document.getElementById("flipCoin").addEventListener("click", () => {
  if (!coinPick) {
    gameStatus.textContent = "Kies N of X";
    return;
  }
  if (!canAfford(2)) return;
  const result = Math.random() > 0.5 ? "N" : "X";
  coinFace.textContent = result;
  if (result === coinPick) updateBalance(5, "Coin flip win +5 coins");
  else gameStatus.textContent = "Geen winst";
});

showGame("slot");


const renderShop = () => {  const shopContainer = document.querySelector('.shop');  if (!shopContainer) return;  const sections = {    powerup: { title: 'Power-ups', items: [] },    boost: { title: 'Boosts', items: [] },    theme: { title: 'Achtergronden', items: [] },    cosmetic: { title: 'Cosmetics', items: [] },    frame: { title: 'Profile frames', items: [] },    sound: { title: 'Sound packs', items: [] },    skin: { title: 'Limited skins', items: [] },    vip: { title: 'VIP', items: [] },    loot: { title: 'Loot boxes', items: [] }  };  shopItems.forEach(item => {    if (sections[item.type]) {      sections[item.type].items.push(item);    }  });  let sectionHTML = '';  Object.keys(sections).forEach(type => {    const section = sections[type];    if (section.items.length) {      sectionHTML += <div class=" shop-section\><h4></h4>; section.items.forEach(item => { sectionHTML += <button class=\shop-item\ data-buy=\\ data-id=\\ data-cost=\\> coins</button>; }); sectionHTML += '</div>'; } }); const coinPacks = <div class=\shop-section\> <h4>Coin packs</h4> <button class=\shop-item\ data-buy=\pack\ data-amount=\250\ data-price=\3,99\> 250 Nexie Coins €3,99 </button> <button class=\shop-item\ data-buy=\pack\ data-amount=\500\ data-price=\6,99\> 500 Nexie Coins €6,99 </button> <button class=\shop-item\ data-buy=\pack\ data-amount=\1000\ data-price=\11,99\> 1000 Nexie Coins €11,99 </button> <button class=\shop-item\ data-buy=\pack\ data-amount=\2500\ data-price=\24,99\> 2500 Nexie Coins €24,99 </button> <button class=\shop-item\ data-buy=\pack\ data-amount=\6000\ data-price=\49,99\> 6000 Nexie Coins €49,99 </button> <button class=\shop-item\ data-buy=\pack\ data-amount=\10000\ data-price=\79,99\> 10.000 Nexie Coins €79,99 </button> <small class=\shop-note\>Simulatie: deze knoppen verhogen altijd je virtuele coins.</small> </div> ; shopContainer.innerHTML = sectionHTML + coinPacks;};const renderAdminList = () => { const adminList = document.getElementById('adminItemList'); if (!adminList) return; adminList.innerHTML = shopItems.map((item, index) => <div class=\admin-item\> <span> ()</span> <input type=\number\ value=\\ min=\1\ data-index=\\ class=\admin-cost\> <button class=\btn btn-outline\ data-delete=\\>Delete</button> </div> ).join('');};document.getElementById(\addAdminItem\).addEventListener(\click\, () => { const name = document.getElementById(\adminItemName\).value.trim(); const type = document.getElementById(\adminItemType\).value; const cost = Number(document.getElementById(\adminItemCost\).value); const emoji = document.getElementById(\adminItemEmoji\).value.trim(); if (!name || !cost || !emoji) { gameStatus.textContent = \Vul alle velden in.\; return; } const id = name.toLowerCase().replace(/[^a-z0-9]+/g, \-\); const newItem = { id, name, type, cost, emoji }; shopItems.push(newItem); saveShopItems(); gameStatus.textContent = \Item toegevoegd.\; document.getElementById(\adminItemName\).value = \\; document.getElementById(\adminItemCost\).value = \\; document.getElementById(\adminItemEmoji\).value = \\;});document.addEventListener(\change\, (event) => { if (event.target.classList.contains(\admin-cost\)) { const index = Number(event.target.dataset.index); const newCost = Number(event.target.value); if (newCost >= 1) { shopItems[index].cost = newCost; saveShopItems(); gameStatus.textContent = \Prijs bijgewerkt.\; } }});document.addEventListener(\click\, (event) => { if (event.target.dataset.delete !== undefined) { const index = Number(event.target.dataset.delete); shopItems.splice(index, 1); saveShopItems(); gameStatus.textContent = \Item verwijderd.\; }});renderShop();renderAdminList();
