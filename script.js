// At top of file (change const to let)
let COLORS = [
    '#FF9AA2', // Soft Red
    '#FFB7B2', // Salmon
    '#FFDAC1', // Peach
    '#E2F0CB', // Lime
    '#B5EAD7', // Mint
    '#C7CEEA'  // Periwinkle
];

// ... (in levelComplete)
// Logic was moved to original function, removing this duplicate block.


// Configuration
const MAX_LEVEL = 100;
const LEVELS_PER_CHAPTER = 20;
const TOTAL_CHAPTERS = 5;

// Star Requirements per Chapter
const CHAPTER_REQUIREMENTS = {
    1: 0,
    2: 30,
    3: 70,
    4: 120,
    5: 180
};

// Checkpoints (Level: Required Total Stars)
const CHECKPOINT_REQUIREMENTS = {
    6: 10,
    11: 22,
    16: 34,
    26: 45,
    31: 60,
    36: 75,
};

function getCheckpointReq(level) {
    if (CHECKPOINT_REQUIREMENTS[level]) return CHECKPOINT_REQUIREMENTS[level];
    return 0;
}

// State
// Economy & Shop
let coins = 0;
let inventory = {
    extraMoves: 0
};
let unlockedThemes = ['pastel'];
let currentTheme = 'pastel';

const THEMES = {
    'pastel': {
        name: 'Pastel (Orijinal)',
        price: 0,
        colors: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'],
        bg: '#f7f8fa'
    },
    'neon': {
        name: 'Neon Gece',
        price: 150,
        colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF3300', '#33FF00', '#CC00FF'],
        bg: '#1a1a2e'
    },
    'ocean': {
        name: 'Derin Okyanus',
        price: 100,
        colors: ['#006994', '#009DC4', '#005C7A', '#4DB5D1', '#89CFF0', '#003366'],
        bg: '#eefcfc'
    },
    'forest': {
        name: 'Gizli Orman',
        price: 100,
        colors: ['#2E8B57', '#3CB371', '#8FBC8F', '#98FB98', '#006400', '#556B2F'],
        bg: '#f0fff0'
    },
    'dark': {
        name: 'Karanlık Mod',
        price: 200,
        colors: ['#E94560', '#0F3460', '#533483', '#16213E', '#950740', '#6F2232'],
        bg: '#16213E'
    }
};

let currentLevel = 1;
let highestLevel = 1;
let levelStars = {};

let currentChapterPage = 1;
let grid = [];
let moves = 0;
let maxMoves = 25;
let gridSize = 14;
let isGameOver = false;

// DOM Elements
const menuView = document.getElementById('menu-view');
const levelsView = document.getElementById('levels-view');
const gameView = document.getElementById('game-view');
const shopView = document.getElementById('shop-view');

const playBtn = document.getElementById('play-btn');
const shopBtn = document.getElementById('shop-btn');
const shopBackBtn = document.getElementById('shop-back-btn');
const menuCoinCount = document.getElementById('menu-coin-count');
const shopCoinCount = document.getElementById('shop-coin-count');
const shopContainer = document.querySelector('.shop-container');

const levelsGrid = document.getElementById('levels-grid');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');
const chapterTitle = document.getElementById('chapter-title');
const chapterSubtitle = document.getElementById('chapter-subtitle');

const gridContainer = document.getElementById('grid-container');
const moveCountEl = document.getElementById('move-count');
const maxMovesEl = document.getElementById('max-moves');
const levelIndicatorEl = document.getElementById('level-indicator');
const colorControls = document.getElementById('color-controls');
const restartBtn = document.getElementById('restart-btn');
const backToLevelsBtn = document.getElementById('back-to-levels-btn');
const powerupBtn = document.getElementById('powerup-btn');
const powerupCountEl = document.getElementById('powerup-count');

const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const starDisplay = document.getElementById('star-display');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const modalMenuBtn = document.getElementById('modal-menu-btn');

const tutorialModal = document.getElementById('tutorial-modal');
const startTutorialBtn = document.getElementById('start-tutorial-btn');


// --- Persistence ---

function loadProgress() {
    const savedData = localStorage.getItem('colorFlood_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            highestLevel = data.highestLevel || 1;
            levelStars = data.stars || {};
            // New Economy Data
            coins = data.coins || 0;
            inventory = data.inventory || { extraMoves: 0 };
            unlockedThemes = data.unlockedThemes || ['pastel'];
            currentTheme = data.currentTheme || 'pastel';
        } catch (e) {
            console.error("Save data corrupted", e);
            highestLevel = 1;
            levelStars = {};
            // defaults
            coins = 0;
            inventory = { extraMoves: 0 };
            unlockedThemes = ['pastel'];
            currentTheme = 'pastel';
        }
    } else {
        const oldLevel = localStorage.getItem('colorFlood_level');
        if (oldLevel) highestLevel = parseInt(oldLevel);
    }

    // Apply theme on load
    applyTheme(currentTheme);

    // DEBUG: Add 1000 coins logic removed for release
    // coins += 1000; 
    saveProgress(); // Ensure valid structure on first load

    updateCoinDisplays();
}

function saveProgress() {
    const data = {
        highestLevel: highestLevel,
        stars: levelStars,
        coins: coins,
        inventory: inventory,
        unlockedThemes: unlockedThemes,
        currentTheme: currentTheme
    };
    localStorage.setItem('colorFlood_data', JSON.stringify(data));
    updateCoinDisplays();
}

function updateCoinDisplays() {
    menuCoinCount.textContent = coins;
    shopCoinCount.textContent = coins;
    if (powerupCountEl) powerupCountEl.textContent = inventory.extraMoves;

    // Disable powerup btn if 0? No, let user click to see message
}

// --- Theme Logic ---
function applyTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    const theme = THEMES[themeKey];
    const root = document.documentElement;

    // COLORS array is global, we need to update usage of it or better: update CSS variables
    // But our game logic uses the global `COLORS` array directly in `initGame`.
    // We must update the global `COLORS` array content.

    // Update JS Array
    // We can't reassign const, but we can modify contents or change how we use it.
    // Actually `const COLORS` is defined at top. Let's make it let or just modify elements.
    for (let i = 0; i < 6; i++) {
        COLORS[i] = theme.colors[i];
        root.style.setProperty(`--color-${i + 1}`, theme.colors[i]);
    }

    root.style.setProperty('--bg-color', theme.bg);
    // If bg is dark, text should be light?
    if (themeKey === 'neon' || themeKey === 'dark') {
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--surface-color', '#2d3436');
    } else {
        root.style.setProperty('--text-color', '#2d3436');
        root.style.setProperty('--surface-color', '#ffffff');
    }

    currentTheme = themeKey;
}

// --- Shop Logic ---
function renderShop() {
    const powerupGrid = document.getElementById('powerup-grid');
    const themeGrid = document.getElementById('theme-grid');

    // Powerups
    powerupGrid.innerHTML = `
        <div class="shop-item">
            <div class="item-preview" style="background: #fdcb6e; color: #d35400;">⚡</div>
            <div class="item-name">+3 Hamle</div>
            <div style="font-size:0.8rem; color:#888; margin-bottom:8px">Zor anlar için</div>
            <button class="buy-btn" onclick="buyItem('extraMoves', 50)">50 🪙</button>
        </div>
    `;

    // Themes
    themeGrid.innerHTML = '';
    Object.keys(THEMES).forEach(key => {
        const theme = THEMES[key];
        const isUnlocked = unlockedThemes.includes(key);
        const isActive = currentTheme === key;

        const item = document.createElement('div');
        item.classList.add('shop-item');

        let initial = theme.name.substring(0, 2).toUpperCase();
        let bg = `linear-gradient(45deg, ${theme.colors[0]}, ${theme.colors[5]})`;

        let btnHtml = '';
        if (isActive) {
            btnHtml = `<button class="buy-btn active" disabled>Kullanılıyor</button>`;
        } else if (isUnlocked) {
            btnHtml = `<button class="buy-btn" style="background:#00b894" onclick="useTheme('${key}')">Kullan</button>`;
        } else {
            btnHtml = `<button class="buy-btn" onclick="buyTheme('${key}', ${theme.price})">${theme.price} 🪙</button>`;
        }

        item.innerHTML = `
            <div class="item-preview" style="background: ${bg}; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${initial}</div>
            <div class="item-name">${theme.name}</div>
            ${btnHtml}
        `;
        themeGrid.appendChild(item);
    });
}

function buyItem(type, price) {
    if (coins >= price) {
        coins -= price;
        if (type === 'extraMoves') {
            inventory.extraMoves = (inventory.extraMoves || 0) + 1;
            showModal('Satın Alındı! ✅', `+3 Hamle hakkı envanterine eklendi.`, false);
        }
        saveProgress();
        renderShop();
    } else {
        showModal('Yetersiz Bakiye ❌', `Bunu almak için ${price - coins} altına daha ihtiyacın var.`, false);
    }
}

function buyTheme(key, price) {
    if (coins >= price) {
        coins -= price;
        unlockedThemes.push(key);
        useTheme(key); // Auto equip
        showModal('Yeni Tema! 🎨', `${THEMES[key].name} teması açıldı ve uygulandı.`, false);
        saveProgress(); // inside useTheme -> saveProgress called? No.
        // updateShop handles visuals, saveProgress handles data
    } else {
        showModal('Yetersiz Bakiye ❌', `Bu temayı almak için ${price - coins} altına daha ihtiyacın var.`, false);
    }
}

function useTheme(key) {
    applyTheme(key);
    saveProgress();
    renderShop();
}

// --- View Management ---

function switchView(viewId) {
    [menuView, levelsView, gameView, shopView].forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');

    if (viewId === 'levels-view') {
        const targetLevel = currentLevel > 1 ? currentLevel : highestLevel;
        currentChapterPage = Math.ceil(targetLevel / LEVELS_PER_CHAPTER);
        renderLevelsGrid(currentChapterPage);
    }
    if (viewId === 'shop-view') {
        renderShop();
    }
}

// --- Logic ---

function getLevelConfig(level) {
    let size, movesAllowed;
    if (level <= 20) {
        size = 4; movesAllowed = 8;
    } else if (level <= 40) {
        size = 5; movesAllowed = 12;
    } else if (level <= 60) {
        size = 6; movesAllowed = 15;
    } else if (level <= 80) {
        size = 8; movesAllowed = 18;
    } else {
        size = 10; movesAllowed = 22;
        if (level > 95) {
            size = 12; movesAllowed = 24;
        }
    }
    return { size, movesAllowed };
}

function calculateStars(movesUsed, movesAllowed) {
    const ratio = movesUsed / movesAllowed;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.85) return 2;
    return 1;
}

function renderLevelsGrid(chapter) {
    levelsGrid.innerHTML = '';

    const startLvl = (chapter - 1) * LEVELS_PER_CHAPTER + 1;
    const endLvl = Math.min(chapter * LEVELS_PER_CHAPTER, MAX_LEVEL);

    let chapterStars = 0;
    let maxChapterStars = (endLvl - startLvl + 1) * 3;
    let totalStars = 0;

    for (let l = 1; l <= MAX_LEVEL; l++) {
        totalStars += (levelStars[l] || 0);
    }

    // Check Requirement
    const requiredStars = CHAPTER_REQUIREMENTS[chapter] || 0;
    const isLocked = totalStars < requiredStars;

    // Update Nav
    chapterTitle.textContent = `Chapter ${chapter}`;

    if (isLocked) {
        chapterSubtitle.textContent = `LOCKED • Needs ${requiredStars} Stars`;
    } else {
        let localStars = 0;
        for (let l = startLvl; l <= endLvl; l++) {
            localStars += (levelStars[l] || 0);
        }
        chapterSubtitle.textContent = `Levels ${startLvl}-${endLvl} • ★ ${localStars}/${maxChapterStars}`;
    }

    prevChapterBtn.disabled = (chapter === 1);
    nextChapterBtn.disabled = (chapter === TOTAL_CHAPTERS);

    if (isLocked) {
        const diff = requiredStars - totalStars;
        levelsGrid.innerHTML = `
            <div class="chapter-locked">
                <div class="lock-icon">🔒</div>
                <div class="lock-title">Chapter ${chapter} Kilitli</div>
                <div class="lock-message">
                    Bu bölümü açmak için daha fazla yıldıza ihtiyacın var.<br>
                    Diğer bölümlerden <strong>${diff}</strong> yıldız daha topla!
                </div>
                <div class="lock-stats">
                    <div class="lock-stat">
                        <span class="val">${totalStars}</span>
                        <span class="lbl">Sende Var</span>
                    </div>
                    <div class="lock-stat">
                        <span class="val">${requiredStars}</span>
                        <span class="lbl">Gereken</span>
                    </div>
                </div>
            </div>
        `;
        levelsGrid.style.display = 'flex';
        levelsGrid.style.justifyContent = 'center';
        return;
    }

    levelsGrid.style.display = 'grid';

    for (let i = startLvl; i <= endLvl; i++) {
        const btn = document.createElement('button');
        btn.classList.add('level-btn');

        const isProgressionUnlocked = i <= highestLevel;
        const checkpointReq = getCheckpointReq(i);
        const isCheckpointUnlocked = totalStars >= checkpointReq;

        if (!isProgressionUnlocked) {
            btn.classList.add('locked');
            btn.onclick = () => { };
        } else if (!isCheckpointUnlocked) {
            btn.classList.add('locked');
            btn.classList.add('checkpoint-locked');

            const lockIcon = document.createElement('div');
            lockIcon.textContent = '🔒';
            lockIcon.style.fontSize = '1rem';
            btn.appendChild(lockIcon);

            const reqText = document.createElement('div');
            reqText.textContent = `${checkpointReq}⭐`;
            reqText.style.fontSize = '0.8rem';
            reqText.style.color = '#666';
            btn.appendChild(reqText);

            btn.onclick = () => {
                showModal('Checkpoint Kilitli 🛑', `Bu seviyeyi açmak için toplam **${checkpointReq}** yıldıza ulaşmalısın.\nŞu anki yıldızın: ${totalStars}`);
            };
        } else {
            const span = document.createElement('span');
            span.textContent = i;
            btn.appendChild(span);

            const stars = levelStars[i] || 0;

            const starsDiv = document.createElement('div');
            starsDiv.classList.add('level-stars');

            for (let s = 0; s < 3; s++) {
                const starSpan = document.createElement('span');
                starSpan.classList.add('star');
                if (s < stars) starSpan.classList.add('active');
                starSpan.textContent = '★';
                starsDiv.appendChild(starSpan);
            }
            btn.appendChild(starsDiv);

            const starCount = document.createElement('div');
            starCount.classList.add('star-count');
            starCount.textContent = `${stars}/3`;
            btn.appendChild(starCount);

            btn.onclick = () => startLevel(i);
        }
        levelsGrid.appendChild(btn);
    }
}

function showModal(title, msg, isGameEnd = false) {
    modalTitle.textContent = title;
    modalMessage.innerHTML = msg;
    starDisplay.style.display = 'none';

    if (isGameEnd) {
        // ...
    } else {
        modalRestartBtn.textContent = "Tamam";
        modalRestartBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }
    modal.classList.remove('hidden');
}

function startLevel(level) {
    currentLevel = level;
    const config = getLevelConfig(level);
    gridSize = config.size;
    maxMoves = config.movesAllowed;

    switchView('game-view');
    initGame();
}

function initGame() {
    grid = [];
    moves = 0;
    isGameOver = false;

    moveCountEl.textContent = moves;
    maxMovesEl.textContent = maxMoves;
    levelIndicatorEl.textContent = currentLevel;

    modal.classList.add('hidden');

    // Tutorial already shown on load

    createGrid();
    renderGrid();
    createControls();
}

function createGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.innerHTML = '';

    for (let r = 0; r < gridSize; r++) {
        let row = [];
        for (let c = 0; c < gridSize; c++) {
            const colorIndex = Math.floor(Math.random() * COLORS.length);
            row.push(colorIndex);
        }
        grid.push(row);
    }
}

function renderGrid() {
    gridContainer.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.backgroundColor = COLORS[grid[r][c]];

            if (r === 0 && c === 0) {
                cell.classList.add('start-cell');
            }

            gridContainer.appendChild(cell);
        }
    }
}

function updateGridVisuals() {
    const cells = gridContainer.children;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const index = r * gridSize + c;
            cells[index].style.backgroundColor = COLORS[grid[r][c]];
        }
    }
}

function createControls() {
    colorControls.innerHTML = '';
    COLORS.forEach((color, index) => {
        const btn = document.createElement('button');
        btn.classList.add('color-btn');
        btn.style.backgroundColor = color;
        btn.onclick = () => handleColorClick(index);
        colorControls.appendChild(btn);
    });
}

function handleColorClick(colorIndex) {
    if (isGameOver) return;

    const startColor = grid[0][0];
    if (colorIndex === startColor) return;

    moves++;
    moveCountEl.textContent = moves;

    floodFill(0, 0, startColor, colorIndex);
    updateGridVisuals();

    checkWinCondition();
}

function floodFill(r, c, targetColor, replacementColor) {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
    if (grid[r][c] !== targetColor) return;

    grid[r][c] = replacementColor;

    floodFill(r + 1, c, targetColor, replacementColor);
    floodFill(r - 1, c, targetColor, replacementColor);
    floodFill(r, c + 1, targetColor, replacementColor);
    floodFill(r, c - 1, targetColor, replacementColor);
}

function checkWinCondition() {
    const firstColor = grid[0][0];
    const allSame = grid.every(row => row.every(cell => cell === firstColor));

    if (allSame) {
        levelComplete();
    } else if (moves >= maxMoves) {
        gameOver();
    }
}

function levelComplete() {
    isGameOver = true;

    const stars = calculateStars(moves, maxMoves);
    let earnedCoins = 0;

    // Reward Logic: 10 coins per NEW star
    const oldStars = levelStars[currentLevel] || 0;
    if (stars > oldStars) {
        const newStars = stars - oldStars;
        earnedCoins = newStars * 10;
        coins += earnedCoins;
    } else {
        // Minimum reward for replay
        coins += 1;
        earnedCoins = 1;
    }

    if (!levelStars[currentLevel] || stars > levelStars[currentLevel]) {
        levelStars[currentLevel] = stars;
    }

    if (currentLevel === highestLevel && currentLevel < MAX_LEVEL) {
        highestLevel++;
    }

    saveProgress();

    modalTitle.textContent = "Bölüm Geçildi! 🎉";
    let msg = `${currentLevel}. seviyeyi tamamladın.<br>`;
    if (earnedCoins > 0) {
        msg += `<span style="color:#d68910; font-weight:bold;">+${earnedCoins} Altın Kazandın! 🪙</span>`;
    }
    modalMessage.innerHTML = msg;

    let starStr = '';
    for (let i = 0; i < 3; i++) {
        starStr += (i < stars) ? '★' : '☆';
    }
    starDisplay.textContent = starStr;
    starDisplay.style.display = 'block';

    modalRestartBtn.textContent = "Sonraki Level ➡️";
    modalRestartBtn.onclick = () => {
        if (currentLevel < MAX_LEVEL) {
            startLevel(currentLevel + 1);
        } else {
            switchView('levels-view');
            modal.classList.add('hidden');
        }
    };

    modal.classList.remove('hidden');
}

function gameOver() {
    isGameOver = true;
    modalTitle.textContent = "Kaybettin 😔";
    modalMessage.textContent = "Hamlelerin tükendi.";
    starDisplay.style.display = 'none';

    modalRestartBtn.textContent = "Tekrar Dene 🔄";
    modalRestartBtn.onclick = () => {
        initGame();
    };

    modal.classList.remove('hidden');
}

// Event Listeners

playBtn.addEventListener('click', () => {
    switchView('levels-view');
});

backToMenuBtn.addEventListener('click', () => {
    switchView('menu-view');
});

backToLevelsBtn.addEventListener('click', () => {
    switchView('levels-view');
});

prevChapterBtn.addEventListener('click', () => {
    if (currentChapterPage > 1) {
        currentChapterPage--;
        renderLevelsGrid(currentChapterPage);
    }
});

nextChapterBtn.addEventListener('click', () => {
    if (currentChapterPage < TOTAL_CHAPTERS) {
        currentChapterPage++;
        renderLevelsGrid(currentChapterPage);
    }
});

restartBtn.addEventListener('click', initGame);

modalMenuBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    switchView('levels-view');
});

// Shop & Powerup Listeners
shopBtn.addEventListener('click', () => {
    switchView('shop-view');
});

shopBackBtn.addEventListener('click', () => {
    switchView('menu-view');
});

if (powerupBtn) {
    powerupBtn.addEventListener('click', () => {
        if (isGameOver) return;

        if (inventory.extraMoves > 0) {
            inventory.extraMoves--;
            maxMoves += 3;
            maxMovesEl.textContent = maxMoves;

            // Visual feedback
            const float = document.createElement('div');
            float.textContent = "+3";
            float.style.position = 'absolute';
            float.style.left = '50%';
            float.style.top = '50%';
            float.style.fontSize = '3rem';
            float.style.color = '#fff';
            float.style.fontWeight = 'bold';
            float.style.textShadow = '0 0 10px gold';
            float.style.zIndex = '1000';
            float.style.animation = 'floatUp 1s ease-out forwards';
            document.body.appendChild(float);
            setTimeout(() => float.remove(), 1000);

            saveProgress();
            if (powerupCountEl) powerupCountEl.textContent = inventory.extraMoves;
        } else {
            showModal('Güçlendirici Yok ⚡', 'Ekstra hamlelerini Marketten satın alabilirsin.');
        }
    });
}

// Float Animation Style
const style = document.createElement('style');
style.innerHTML = `
@keyframes floatUp {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
}`;
document.head.appendChild(style);

// Tutorial Demo
let demoInterval;
const demoGridSize = 3;
let demoGridState = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];

function initTutorialDemo() {
    const demoGridEl = document.getElementById('demo-grid');
    const demoControlsEl = document.getElementById('demo-controls');
    const demoHand = document.querySelector('.demo-hand');
    if (!demoGridEl || !demoControlsEl) return;

    demoGridState = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    renderDemoGrid(demoGridEl);

    demoControlsEl.innerHTML = '';
    [0, 1, 2].forEach(c => {
        const btn = document.createElement('div');
        btn.classList.add('demo-btn');
        btn.style.backgroundColor = COLORS[c];
        demoControlsEl.appendChild(btn);
    });

    let step = 0;
    const steps = [1, 2, 0, 1];

    clearInterval(demoInterval);
    demoInterval = setInterval(() => {
        if (step >= steps.length) {
            step = 0;
            demoGridState = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
            renderDemoGrid(demoGridEl);
            clearInterval(demoInterval);
            setTimeout(() => initTutorialDemo(), 1000);
            return;
        }

        const targetColor = steps[step];
        const targetBtn = demoControlsEl.children[targetColor];
        if (!targetBtn) return;

        const btnRect = targetBtn.getBoundingClientRect();
        const containerRect = document.querySelector('.tutorial-demo').getBoundingClientRect();

        const top = btnRect.top - containerRect.top + 10;
        const left = btnRect.left - containerRect.left + 5;

        if (demoHand) {
            demoHand.style.top = `${top}px`;
            demoHand.style.left = `${left}px`;
        }

        setTimeout(() => {
            targetBtn.classList.add('active');
            setTimeout(() => targetBtn.classList.remove('active'), 200);
            demoFloodFill(0, 0, demoGridState[0][0], targetColor);
            renderDemoGrid(demoGridEl);
        }, 500);

        step++;
    }, 1500);
}

function renderDemoGrid(container) {
    container.innerHTML = '';
    for (let r = 0; r < demoGridSize; r++) {
        for (let c = 0; c < demoGridSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('demo-cell');
            cell.style.backgroundColor = COLORS[demoGridState[r][c]];
            container.appendChild(cell);
        }
    }
}

function demoFloodFill(r, c, target, replace) {
    if (r < 0 || r >= demoGridSize || c < 0 || c >= demoGridSize) return;
    if (demoGridState[r][c] !== target) return;
    demoGridState[r][c] = replace;
    demoFloodFill(r + 1, c, target, replace);
    demoFloodFill(r - 1, c, target, replace);
    demoFloodFill(r, c + 1, target, replace);
    demoFloodFill(r, c - 1, target, replace);
}

function stopTutorialDemo() {
    clearInterval(demoInterval);
}

startTutorialBtn.addEventListener('click', () => {
    tutorialModal.classList.add('hidden');
    stopTutorialDemo();
});

// Init Execution
loadProgress();
switchView('menu-view');
tutorialModal.classList.remove('hidden');
setTimeout(initTutorialDemo, 100);
