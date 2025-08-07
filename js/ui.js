// KALITE KONTROL SIMÜLATÖRÜ PRO - UI YÖNETİMİ
// Sürüm: v2.0.0

class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.particleSystem = new ParticleSystem(document.getElementById('game-container'));
        this.achievementSystem = new AchievementSystem();
        this.soundManager = new SoundManager();
        this.storySystem = new StorySystem();
        this.setupLanguageSystem();
        this.setupSettingsPanel();
    }

    initializeElements() {
        return {
            gameContainer: document.getElementById('game-container'),
            scoreDisplay: document.getElementById('score-display'),
            timerDisplay: document.getElementById('timer-display'),
            levelDisplay: document.getElementById('level-display'),
            comboDisplay: document.getElementById('combo-display'),
            timeBarFill: document.getElementById('time-bar-fill'),
            timeBarContainer: document.getElementById('time-bar-container'),
            correctCountDisplay: document.getElementById('correct-count'),
            incorrectCountDisplay: document.getElementById('incorrect-count'),
            accuracyRateDisplay: document.getElementById('accuracy-rate'),
            finalStatsDisplay: document.getElementById('final-stats'),
            levelStatsDisplay: document.getElementById('level-stats'),
            startScreen: document.getElementById('start-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),
            levelTransitionScreen: document.getElementById('level-transition-screen'),
            finalScoreDisplay: document.getElementById('final-score'),
            gameResultMessage: document.getElementById('game-result-message'),
            highScoreDisplay: document.getElementById('high-score-display'),
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button'),
            slowmoBtn: document.getElementById('slowmo-btn'),
            // controlLightBtn artık yok - sürekli aktif
            soundToggle: document.getElementById('sound-toggle'),
            pauseBtn: document.getElementById('pause-btn'),
            settingsBtn: document.getElementById('settings-toggle'),
            mobileLeftBtn: document.getElementById('mobile-left'),
            mobileRightBtn: document.getElementById('mobile-right'),
            langTrBtn: document.getElementById('lang-tr'),
            langEnBtn: document.getElementById('lang-en')
        };
    }

    setupLanguageSystem() {
        // Dil değiştirme butonları
        if (this.elements.langTrBtn) {
            this.elements.langTrBtn.addEventListener('click', () => {
                this.changeLanguage('tr');
            });
        }
        
        if (this.elements.langEnBtn) {
            this.elements.langEnBtn.addEventListener('click', () => {
                this.changeLanguage('en');
            });
        }

        // Dil değişikliği olayını dinle
        EventBus.subscribe('languageChanged', () => {
            this.updateAllLanguageTexts();
        });

        // İlk dil güncellemesi
        this.updateLanguageButtons();
        this.updateAllLanguageTexts();
    }

    setupSettingsPanel() {
        const settingsBtn = this.elements.settingsBtn;
        const panel = document.getElementById('settings-panel');
        const closeBtn = document.getElementById('settings-close');
        const volM = document.getElementById('volume-master');
        const volE = document.getElementById('volume-effects');
        const bgT = document.getElementById('video-bg-toggle');
        const qual = document.getElementById('graphics-quality');
        const filt = document.getElementById('color-filter');

        if (!settingsBtn || !panel) return;

        // init values
        volM && (volM.value = window.SettingsManager.get('sound.master'));
        volE && (volE.value = window.SettingsManager.get('sound.effects'));
        bgT && (bgT.checked = !!window.SettingsManager.get('graphics.videoBackground'));
        qual && (qual.value = window.SettingsManager.get('graphics.quality'));
        filt && (filt.value = window.SettingsManager.get('accessibility.colorFilter'));

        settingsBtn.addEventListener('click', () => {
            panel.classList.toggle('show');
        });
        closeBtn && closeBtn.addEventListener('click', () => panel.classList.remove('show'));

        volM && volM.addEventListener('input', (e) => window.SettingsManager.set('sound.master', parseFloat(e.target.value)));
        volE && volE.addEventListener('input', (e) => window.SettingsManager.set('sound.effects', parseFloat(e.target.value)));
        bgT && bgT.addEventListener('change', (e) => {
            window.SettingsManager.set('graphics.videoBackground', e.target.checked);
            const vid = document.getElementById('background-video');
            if (vid) vid.style.display = e.target.checked ? 'block' : 'none';
        });
        qual && qual.addEventListener('change', (e) => window.SettingsManager.set('graphics.quality', e.target.value));
        filt && filt.addEventListener('change', (e) => {
            window.SettingsManager.set('accessibility.colorFilter', e.target.value);
            const gc = document.getElementById('game-container');
            if (!gc) return;
            const map = { none: 'none', mono: 'grayscale(1)', deut: 'url(#)', prot: 'url(#)' };
            gc.style.filter = map[e.target.value] || 'none';
        });
    }

    changeLanguage(lang) {
        window.LanguageManager.setLanguage(lang);
        this.updateLanguageButtons();
        this.soundManager.play('click');
    }

    updateLanguageButtons() {
        const currentLang = window.LanguageManager.getCurrentLanguage();
        
        if (this.elements.langTrBtn && this.elements.langEnBtn) {
            this.elements.langTrBtn.classList.toggle('active', currentLang === 'tr');
            this.elements.langEnBtn.classList.toggle('active', currentLang === 'en');
        }
    }

    updateAllLanguageTexts() {
        // data-lang attributesi olan tüm elementleri güncelle
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = window.LanguageManager.get(key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Buton metinlerini güncelle
        this.updateButtonTexts();
    }

    updateButtonTexts() {
        const lang = window.LanguageManager;
        
        // Puan, süre vb. güncelle
        if (this.elements.scoreDisplay) {
            const scoreSpan = this.ensureSpan(this.elements.scoreDisplay);
            const currentScore = (scoreSpan.textContent.split(': ')[1]) || '0';
            scoreSpan.textContent = `${lang.get('score')}: ${currentScore}`;
        }
        
        if (this.elements.timerDisplay) {
            const timeSpan = this.ensureSpan(this.elements.timerDisplay);
            const currentTime = (timeSpan.textContent.split(': ')[1]) || '60';
            timeSpan.textContent = `${lang.get('time')}: ${currentTime}`;
        }

        if (this.elements.levelDisplay) {
            const levelSpan = this.ensureSpan(this.elements.levelDisplay);
            const currentLevel = (levelSpan.textContent.split(': ')[1]) || '1';
            levelSpan.textContent = `${lang.get('level')}: ${currentLevel}`;
        }

        if (this.elements.comboDisplay) {
            const comboSpan = this.ensureSpan(this.elements.comboDisplay);
            const parsed = comboSpan.textContent.split(': ')[1];
            const currentCombo = parsed || '1x';
            comboSpan.textContent = `${lang.get('combo')}: ${currentCombo}`;
        }
    }

    updateScore(score) {
        const lang = window.LanguageManager;
        const span = this.ensureSpan(this.elements.scoreDisplay);
        span.textContent = `${lang.get('score')}: ${score}`;
    }

    updateTimer(timeLeft) {
        const lang = window.LanguageManager;
        const span = this.ensureSpan(this.elements.timerDisplay);
        span.textContent = `${lang.get('time')}: ${Math.ceil(Math.max(0, timeLeft))}`;
    }

    updateLevel(level) {
        const lang = window.LanguageManager;
        const span = this.ensureSpan(this.elements.levelDisplay);
        span.textContent = `${lang.get('level')}: ${level + 1}`;
    }

    updateStats(stats) {
        this.elements.correctCountDisplay.textContent = stats.correct;
        this.elements.incorrectCountDisplay.textContent = stats.incorrect;
        const accuracy = stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : 0;
        this.elements.accuracyRateDisplay.textContent = `${accuracy}%`;
    }

    updatePowerups(powerups, activePowerups) {
        this.elements.slowmoBtn.querySelector('span').textContent = `Yavaşlat (${powerups.slowmo})`;
        this.elements.slowmoBtn.disabled = powerups.slowmo <= 0 || !!activePowerups.slowmo;

        // Kontrol ışığı artık sürekli aktif olduğu için buton yok
    }

    updateTimeBar(timeLeft, levelDuration) {
        const percent = (timeLeft / levelDuration) * 100;
        this.elements.timeBarFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        
        if (percent < 20) {
            this.elements.timeBarFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (percent < 50) {
            this.elements.timeBarFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            this.elements.timeBarFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        }
    }

    showFloatingText(text, x, y, color = '#2ecc71') {
        const textEl = document.createElement('div');
        textEl.className = 'floating-text';
        textEl.textContent = text;
        textEl.style.left = `${x}px`;
        textEl.style.top = `${y}px`;
        textEl.style.color = color;
        this.elements.gameContainer.appendChild(textEl);

        setTimeout(() => {
            if (textEl.parentNode) {
                textEl.remove();
            }
        }, 1500);
    }

    showCombo(combo) {
        if (combo > 0 && combo % 5 === 0) {
            // Toast oluştur (span'ı bozmadan)
            const toast = document.createElement('div');
            toast.className = 'combo-toast';
            toast.textContent = `${combo}x COMBO!`;
            this.elements.comboDisplay.appendChild(toast);
            this.soundManager.play('combo');

            const canvas = document.getElementById('game-canvas');
            this.particleSystem.create(canvas.width / 2, canvas.height / 2, '#f1c40f', 25);

            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 2000);
        }
    }

    resetCombo() {
        // Sadece geçici toast'ları temizle
        this.elements.comboDisplay.querySelectorAll('.combo-toast').forEach(el => el.remove());
    }

    ensureSpan(container) {
        if (!container) return null;
        let span = container.querySelector('span');
        if (!span) {
            span = document.createElement('span');
            container.appendChild(span);
        }
        return span;
    }

    showStartScreen() {
        this.elements.startScreen.classList.remove('hidden');
    }

    hideStartScreen() {
        this.elements.startScreen.classList.add('hidden');
    }

    showGameOverScreen(score, highScore, stats, currentLevel, isWin) {
        this.elements.finalScoreDisplay.textContent = `Toplam Puan: ${score}`;
        
        if (this.elements.highScoreDisplay) {
            this.elements.highScoreDisplay.textContent = `En Yüksek Puan: ${highScore}`;
        }

        const accuracy = stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : 0;
        this.elements.finalStatsDisplay.innerHTML = `
            <p><strong>İstatistikler:</strong></p>
            <p>Doğru: ${stats.correct} | Yanlış: ${stats.incorrect} | Doğruluk: %${accuracy}</p>
            <p>Tamamlanan Seviye: ${currentLevel} / ${LevelConfig.length}</p>
            <p>Kontrol Işığı Kullanımı: ${stats.controlLightUsed || 0}</p>
            <p>Tespit Edilen Mikro Çatlaklar: ${stats.microCracksFound || 0}</p>
        `;

        if (isWin) {
            this.elements.gameResultMessage.textContent = "Tebrikler! Tüm bölümleri başarıyla tamamladın. Gerçek bir kalite kontrol uzmanısın!";
        } else {
            this.elements.gameResultMessage.textContent = "Daha dikkatli olmalısın. Tekrar denemek ister misin?";
        }

        this.elements.gameoverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.elements.gameoverScreen.classList.add('hidden');
    }

    showLevelTransition(level, config, stats) {
        document.getElementById('transition-level-title').innerText = `Bölüm ${level + 1}: ${config.name}`;
        
        let message = config.description;
        if (config.distractions && config.distractions.shake) message += "\nBantta titremeler olabilir!";
        if (config.distractions && config.distractions.randomStop) message += "\nBantta ani duraksamalar yaşanabilir!";
        if (config.distractions && config.distractions.bandFlicker) message += "\nBant ışığı anlık parlayabilir!";
        if (config.lightFaultRatio > 0) message += "\nBazı hatalar sadece kontrol ışığı ile görülebilir!";
        
        document.getElementById('transition-level-message').innerText = message;
        
        if (config.supervisor && config.dialogue) {
            this.storySystem.showDialogue(config.supervisor, config.dialogue);
        }
        
        if (level > 0 && stats.levelStart) {
            const levelTime = ((performance.now() - stats.levelStart) / 1000).toFixed(1);
            const accuracy = stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : 0;
            
            this.elements.levelStatsDisplay.innerHTML = `
                <p>Önceki Seviye İstatistikleri:</p>
                <p>Doğru: ${stats.correct} | Yanlış: ${stats.incorrect} | Doğruluk: %${accuracy}</p>
                <p>Seviye Süresi: ${levelTime} saniye</p>
            `;
        } else {
            this.elements.levelStatsDisplay.innerHTML = '';
        }
        
        this.elements.levelTransitionScreen.classList.remove('hidden');
    }

    hideLevelTransition() {
        this.elements.levelTransitionScreen.classList.add('hidden');
        this.storySystem.hideDialogue();
    }

    showTimeBar() {
        this.elements.timeBarContainer.style.opacity = '1';
    }

    hideTimeBar() {
        this.elements.timeBarContainer.style.opacity = '0';
    }

    addShakeEffect() {
        this.elements.gameContainer.classList.add('shake');
        setTimeout(() => {
            this.elements.gameContainer.classList.remove('shake');
        }, 500);
    }

    addFlickerEffect() {
        this.elements.gameContainer.classList.add('flicker');
        setTimeout(() => {
            this.elements.gameContainer.classList.remove('flicker');
        }, 400);
    }

    activateControlLight() {
        this.elements.gameContainer.classList.add('control-light-active');
        return setTimeout(() => {
            this.elements.gameContainer.classList.remove('control-light-active');
        }, GameConfig.controlLight.scanDuration);
    }

    removeAllEffects() {
        this.elements.gameContainer.classList.remove('shake', 'control-light-active', 'flicker');
    }
}

class SoundManager {
    constructor() {
        this.enabled = true;
        this.context = null;
        this.sounds = {};
        this.init();
    }
    
    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            this.createSound('click', 200, 0.1, 'square');
            this.createSound('correct', 523.25, 0.2, 'sine');
            this.createSound('wrong', 130.81, 0.3, 'sawtooth');
            this.createSound('powerup', 659.25, 0.3, 'sine');
            this.createSound('levelup', 783.99, 0.5, 'sine');
            this.createSound('combo', 1046.50, 0.4, 'sine');
            this.createSound('controlLight', 440, 0.2, 'sine');
        } catch (e) {
            console.log('Ses sistemi başlatılamadı:', e);
            this.enabled = false;
        }
    }
    
    createSound(name, frequency, duration, type = 'sine') {
        if (!this.enabled) return;
        
        this.sounds[name] = () => {
            if (!this.enabled) return;
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        };
    }
    
    play(name) {
        if (this.sounds[name]) {
            this.sounds[name]();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        const icon = document.querySelector('#sound-toggle i');
        if (icon) {
            icon.className = this.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }

    // temporarily mute while preserving previous state
    mute(state) {
        if (state) {
            this.prevEnabled = this.enabled;
            this.enabled = false;
        } else {
            this.enabled = this.prevEnabled !== undefined ? this.prevEnabled : true;
        }
        const icon = document.querySelector('#sound-toggle i');
        if (icon) {
            icon.className = this.enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }
}

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
    }
    
    create(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 50 + 30;
            const lifetime = Math.random() * 0.5 + 0.5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.opacity = '1';
            
            this.container.appendChild(particle);
            
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = (timestamp - startTime) / 1000 / lifetime;
                
                if (progress < 1) {
                    const currentX = x + Math.cos(angle) * speed * progress * 20;
                    const currentY = y + Math.sin(angle) * speed * progress * 20 - 100 * progress;
                    
                    particle.style.left = `${currentX}px`;
                    particle.style.top = `${currentY}px`;
                    particle.style.opacity = 1 - progress;
                    particle.style.transform = `scale(${1 - progress * 0.5})`;
                    
                    requestAnimationFrame(animate);
                } else {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
}

class AchievementSystem {
    constructor() {
        this.achievements = GameConfig.achievements;
        this.unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    }
    
    check(gameData) {
        this.achievements.forEach(achievement => {
            if (!this.unlocked.includes(achievement.id)) {
                try {
                    const condition = new Function('stats', 'combo', 'currentLevel', 'score', 'gameState', 
                        `return ${achievement.condition}`);
                    
                    if (condition(gameData.stats, gameData.combo, gameData.currentLevel, gameData.score, gameData.gameState)) {
                        this.unlock(achievement);
                    }
                } catch (e) {
                    console.warn('Başarım koşulu değerlendirilemedi:', achievement.id, e);
                }
            }
        });
    }
    
    unlock(achievement) {
        this.unlocked.push(achievement.id);
        
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement';
        achievementEl.innerHTML = `
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        
        document.getElementById('game-container').appendChild(achievementEl);
        
        const soundManager = new SoundManager();
        soundManager.play('levelup');
        
        setTimeout(() => {
            if (achievementEl.parentNode) {
                achievementEl.remove();
            }
        }, 3000);
        
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlocked));
    }
}

class StorySystem {
    constructor() {
        this.currentPanel = null;
        this.supervisors = {
            "Mehmet Abi": "👨‍🔧",
            "Mühendis Ayşe": "👩‍💼",
            "Fabrika Müdürü": "👨‍💼",
            "CEO": "🤵"
        };
    }
    
    showDialogue(supervisor, dialogue) {
        this.hideDialogue();
        
        this.currentPanel = document.createElement('div');
        this.currentPanel.className = 'story-panel';
        
        const avatar = this.supervisors[supervisor] || "👤";
        
        this.currentPanel.innerHTML = `
            <div class="story-character">
                <div class="character-avatar">${avatar}</div>
                <div class="character-name">${supervisor}</div>
            </div>
            <div class="story-dialogue">${dialogue}</div>
        `;
        
        document.getElementById('game-container').appendChild(this.currentPanel);
        
        setTimeout(() => {
            this.hideDialogue();
        }, 5000);
    }
    
    hideDialogue() {
        if (this.currentPanel && this.currentPanel.parentNode) {
            this.currentPanel.remove();
            this.currentPanel = null;
        }
    }
}

const UIUtils = {
    shadeColor: (col, percent) => {
        let num = parseInt(col.replace('#', ''), 16);
        let r = (num >> 16);
        let g = (num >> 8) & 0x00FF;
        let b = num & 0x0000FF;
        r = Math.min(255, Math.max(0, r + (percent / 100) * 255));
        g = Math.min(255, Math.max(0, g + (percent / 100) * 255));
        b = Math.min(255, Math.max(0, b + (percent / 100) * 255));
        return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
    }
};
