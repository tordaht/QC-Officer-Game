// KALITE KONTROL SIMÜLATÖRÜ PRO - OYUN MOTORU
// Sürüm: v2.0.0

// basit oyun döngüsü yöneticisi
class GameEngine {
    constructor(game) {
        this.game = game;
        this.raf = null;
        this.paused = false;
        this.lastTime = 0;
    }

    loop = (timestamp) => {
        if (!this.raf) return; // stopped
        const delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        if (!this.paused) {
            this.game.update(delta);
            this.game.draw();
            this.game.updateUI();
            if (this.game.timeLeft <= 0) {
                this.game.endLevel();
                return;
            }
        }
        this.raf = requestAnimationFrame(this.loop);
    };

    start() {
        this.paused = false;
        this.lastTime = performance.now();
        this.raf = requestAnimationFrame(this.loop);
    }

    stop() {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        this.game.uiManager.soundManager.mute(true);
    }

    resume() {
        if (!this.paused) return;
        this.paused = false;
        this.game.uiManager.soundManager.mute(false);
        this.lastTime = performance.now();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.uiManager = new UIManager();
        
        // Oyun durumu
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameover', 'transition'
        this.currentLevel = 0;
        this.score = 0;
        this.timeLeft = 0;
        this.combo = 0;
        this.spawnTimer = 0;
        
        // Objeler
        this.bottles = [];
        this.conveyorBelt = new ConveyorBelt(this.canvas);
        this.controlLight = new ControlLight(this.canvas);
        this.backgroundManager = new BackgroundManager(this.canvas);
        this.engine = new GameEngine(this);
        
        // Şişe görselleri yükleme
        this.bottleImages = {};
        this.loadBottleImages();
        
        // Güçlendirmeler
        this.powerups = {
            slowmo: GameConfig.powerups.slowmo.initial
        };
        this.activePowerups = {
            slowmo: null
        };
        
        // İstatistikler
        this.stats = {
            correct: 0,
            incorrect: 0,
            total: 0,
            levelStart: 0,
            levelMistakes: 0,
            controlLightUsed: 0,
            microCracksFound: 0
        };
        
        // Efekt yöneticileri
        this.shakeIntervals = [];
        this.highScore = parseInt(localStorage.getItem('qualityHighScore') || '0');
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Olay dinleyicileri
        this.setupEventListeners();
        
        // Ses sistemini başlat
        this.uiManager.soundManager.init();
        
        // Başarımları yükle
        this.uiManager.achievementSystem.unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    }
    
    setupEventListeners() {
        // Canvas etkileşimleri
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouch(e));
        
        // Buton etkileşimleri
        this.uiManager.elements.startButton.addEventListener('click', () => {
            this.uiManager.soundManager.play('click');
            this.uiManager.hideStartScreen();
            window.saveService?.clear();
            this.startGame();
        });
        
        this.uiManager.elements.restartButton.addEventListener('click', () => {
            this.uiManager.soundManager.play('click');
            this.uiManager.hideGameOverScreen();
            this.resetGame();
            window.saveService?.clear();
            this.startGame();
        });
        
        this.uiManager.elements.slowmoBtn.addEventListener('click', () => this.activateSlowmo());
        // Kontrol ışığı artık sürekli aktif - buton yok
        
        this.uiManager.elements.soundToggle.addEventListener('click', () => {
            this.uiManager.soundManager.toggle();
            this.uiManager.soundManager.play('click');
        });

        // Pause button
        this.uiManager.elements.pauseBtn?.addEventListener('click', () => {
            this.togglePause();
        });
        
        // Mobil kontroller
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        const { mobileLeftBtn, mobileRightBtn } = this.uiManager.elements;
        
        mobileLeftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Mobil kontrol mantığı gerekirse buraya eklenebilir
        });
        
        mobileRightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Mobil kontrol mantığı gerekirse buraya eklenebilir
        });
    }

    togglePause() {
        if (this.gameState !== 'playing' && this.gameState !== 'paused') return;

        if (this.engine.paused) {
            this.engine.resume();
            this.gameState = 'playing';
        } else {
            this.engine.pause();
            this.gameState = 'paused';
        }

        const icon = this.uiManager.elements.pauseBtn?.querySelector('i');
        if (icon) {
            icon.className = this.engine.paused ? 'fas fa-play' : 'fas fa-pause';
        }
    }
    
    resizeCanvas() {
        const maxWidth = Math.min(window.innerWidth * 0.9, GameConfig.maxWidth);
        const maxHeight = Math.min(window.innerHeight * 0.8, GameConfig.maxHeight);
        
        // Mobil cihazlarda farklı en-boy oranı
        const aspectRatio = window.innerWidth < 768 ? GameConfig.mobileAspectRatio : GameConfig.aspectRatio;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.uiManager.elements.gameContainer.style.width = `${width}px`;
        this.uiManager.elements.gameContainer.style.height = `${height}px`;
        
        // Konveyör bandını güncelle
        this.conveyorBelt.updateDimensions(width, height);
        this.controlLight.updateDimensions(width, height);
        this.backgroundManager.updateDimensions(width, height);
        
        this.draw();
    }
    
    startGame() {
        this.engine.stop();
        this.bottles = [];
        this.combo = 0;
        this.clearAllEffects();
        this.gameState = 'transition';
        this.showLevelTransition();
    }
    
    resetGame() {
        this.score = 0;
        this.currentLevel = 0;
        this.powerups = {
            slowmo: GameConfig.powerups.slowmo.initial
        };
        this.stats = {
            correct: 0,
            incorrect: 0,
            total: 0,
            levelStart: 0,
            levelMistakes: 0,
            controlLightUsed: 0,
            microCracksFound: 0
        };
    }

    loadState(data) {
        this.currentLevel = data.level || 0;
        this.score = data.score || 0;
        this.combo = data.combo || 0;
    }
    
    startLevel() {
        const config = ConfigUtils.getLevelConfig(this.currentLevel);
        this.timeLeft = config.duration;
        this.spawnTimer = 0;
        this.gameState = 'playing';

        // Seviye istatistiklerini sıfırla
        this.stats.levelStart = performance.now();
        this.stats.levelMistakes = 0;
        
        // Dikkat dağıtıcı efektleri başlat
        this.setupDistractions(config);
        
        // Kontrol ışığını güncelle
        this.controlLight.updateConfig(config);

        this.engine.start();
    }
    
    setupDistractions(config) {
        // Önceki efektleri temizle
        this.clearAllEffects();
        
        // Titreme efekti
        if (config.distractions.shake) {
            const intervalId = setInterval(() => {
                if (this.gameState === 'playing') {
                    this.uiManager.addShakeEffect();
                }
            }, config.distractions.shakeFrequency);
            this.shakeIntervals.push(intervalId);
        }
    }
    
    showLevelTransition() {
        const config = ConfigUtils.getLevelConfig(this.currentLevel);
        this.uiManager.showLevelTransition(this.currentLevel, config, this.stats);
        
        setTimeout(() => {
            this.uiManager.hideLevelTransition();
            this.startLevel();
        }, 4000);
    }
    
    // game loop handled by GameEngine
    
    update(deltaTime) {
        // Zamanlayıcı
        this.timeLeft -= deltaTime;
        
        // Şişe üretimi
        this.spawnTimer += deltaTime * 1000;
        const config = ConfigUtils.getLevelConfig(this.currentLevel);
        
        // Band flaş efektleri
        if (config.distractions.bandFlicker && Math.random() < 0.02) {
            this.uiManager.addFlickerEffect();
        }
        
        if (this.spawnTimer > config.spawnRate) {
            this.spawnTimer = 0;
            this.spawnBottle();
        }
        
        // Şişeleri güncelle
        let effectiveSpeed = config.speed;
        if (this.activePowerups.slowmo) {
            effectiveSpeed *= GameConfig.powerups.slowmo.effect;
        }
        if (config.distractions.randomStop && Math.random() < (config.distractions.stopChance / 60)) {
            effectiveSpeed = 0;
        }
        
        // Şişeleri hareket ettir
        this.bottles.forEach(bottle => {
            bottle.update(effectiveSpeed, deltaTime);
        });
        
        // Konveyör bandını güncelle
        this.conveyorBelt.update(effectiveSpeed, deltaTime);
        
        // Kontrol ışığını güncelle
        this.controlLight.update(deltaTime);
        
        // Arka planı güncelle
        this.backgroundManager.update(effectiveSpeed, deltaTime);

        // Ekran dışına çıkan şişeleri kontrol et
        this.checkMissedBottles();

        // Başarımları kontrol et
        this.uiManager.achievementSystem.check({
            stats: this.stats,
            combo: this.combo,
            currentLevel: this.currentLevel,
            score: this.score,
            gameState: this.gameState
        });

        // Kaydı periyodik olarak güncelle
        window.saveService?.save({
            level: this.currentLevel,
            score: this.score,
            combo: this.combo
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dinamik arka planı çiz
        this.backgroundManager.draw(this.ctx);
        
        // Konveyör bandını çiz
        this.conveyorBelt.draw(this.ctx);
        
        // Kontrol ışığını çiz
        this.controlLight.setCombo(this.combo);
        this.controlLight.draw(this.ctx);
        
        // Şişeleri çiz
        this.bottles.forEach(bottle => {
            bottle.draw(this.ctx, this.controlLight.isInLightZone(bottle.x), this);
        });
    }
    
    spawnBottle() {
        const config = ConfigUtils.getLevelConfig(this.currentLevel);
        const isFaulty = Math.random() < config.faultyChance;
        
        let faultType = null;
        if (isFaulty) {
            // Seviye yapılandırmasına göre görünür veya gizli hata seç
            const needsLight = config.lightFaultRatio && Math.random() < config.lightFaultRatio;
            faultType = ConfigUtils.getRandomFaultType(needsLight);
        }
        
        const bottle = new Bottle({
            x: -50,
            y: this.canvas.height * GameConfig.belt.yPosition,
            isFaulty: isFaulty,
            faultType: faultType
        });
        
        this.bottles.push(bottle);
    }
    
    checkMissedBottles() {
        const initialBottleCount = this.bottles.length;
        this.bottles = this.bottles.filter(bottle => {
            if (bottle.x > this.canvas.width + 50) {
                if (bottle.isFaulty) {
                    this.updateScore(-5, bottle.x - 50, bottle.y);
                    this.resetCombo();
                    this.stats.incorrect++;
                    this.stats.total++;
                    this.stats.levelMistakes++;
                }
                return false;
            }
            return true;
        });
    }
    
    handleCanvasClick(event) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        this.checkBottleClick(clickX, clickY);
    }
    
    handleCanvasTouch(event) {
        if (this.gameState !== 'playing') return;
        
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const clickX = touch.clientX - rect.left;
        const clickY = touch.clientY - rect.top;
        
        this.checkBottleClick(clickX, clickY);
    }
    
    checkBottleClick(clickX, clickY) {
        for (let i = this.bottles.length - 1; i >= 0; i--) {
            const bottle = this.bottles[i];
            
            if (bottle.isClickedAt(clickX, clickY)) {
                if (bottle.isFaulty) {
                    // Doğru tespit
                    this.updateScore(10, clickX, clickY);
                    this.bottles.splice(i, 1);
                    this.combo++;
                    this.stats.correct++;
                    this.stats.total++;
                    
                    // Özel hata türü bonusları
                    if (bottle.faultType && bottle.faultType.id === 'microCrack') {
                        this.stats.microCracksFound++;
                        this.updateScore(5, clickX, clickY); // Bonus puan
                    }
                    
                    this.uiManager.showCombo(this.combo);
                    this.uiManager.soundManager.play('correct');
                    this.uiManager.particleSystem.create(clickX, clickY, '#2ecc71', 15);
                } else {
                    // Yanlış tespit
                    this.updateScore(-3, clickX, clickY);
                    this.resetCombo();
                    this.stats.incorrect++;
                    this.stats.total++;
                    this.stats.levelMistakes++;
                    this.uiManager.soundManager.play('wrong');
                    this.uiManager.particleSystem.create(clickX, clickY, '#e74c3c', 10);
                }
                break;
            }
        }
    }
    
    updateScore(amount, x, y) {
        this.score += amount;
        this.score = Math.max(0, this.score);
        
        const text = (amount > 0 ? '+' : '') + amount;
        const color = amount > 0 ? '#2ecc71' : '#e74c3c';
        this.uiManager.showFloatingText(text, x, y, color);
    }
    
    resetCombo() {
        this.combo = 0;
        this.uiManager.resetCombo();
    }
    
    activateSlowmo() {
        if (this.powerups.slowmo > 0 && !this.activePowerups.slowmo) {
            this.powerups.slowmo--;
            this.activePowerups.slowmo = setTimeout(() => {
                this.activePowerups.slowmo = null;
                this.updateUI();
            }, GameConfig.powerups.slowmo.duration);
            
            this.updateUI();
            this.uiManager.soundManager.play('powerup');
            
            // Partikül efekti
            const rect = this.uiManager.elements.slowmoBtn.getBoundingClientRect();
            const containerRect = this.uiManager.elements.gameContainer.getBoundingClientRect();
            this.uiManager.particleSystem.create(
                rect.left - containerRect.left + rect.width / 2,
                rect.top - containerRect.top + rect.height / 2,
                '#3498db',
                20
            );
        }
    }
    
    // activateControlLight fonksiyonu artık gerekmiyor - ışık sürekli aktif
    
    loadBottleImages() {
        const imageNames = {
            'normal': 'Bottle-Normal.png',
            'crack': 'Bottle-Crack-Error-1.png',
            'cap': 'Bottle-Cap-Error-1.png',
            'fill': 'Bottle-Fill-Error-1.png',
            'label1': 'Bottle-Label-Error-1.png',
            'label2': 'Bottle-Label-Error-2.png',
            'liquid1': 'Bottle-Liquid-Error-1.png',
            'liquid2': 'Bottle-Liquid-Error-2.png'
        };
        
        let loadedCount = 0;
        const totalImages = Object.keys(imageNames).length;
        
        Object.keys(imageNames).forEach(key => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    console.log('Tüm şişe görselleri yüklendi!');
                }
            };
            img.onerror = () => {
                console.warn(`Şişe görseli yüklenemedi: ${imageNames[key]}`);
                loadedCount++;
            };
            img.src = `assets/images/${imageNames[key]}`;
            this.bottleImages[key] = img;
        });
    }
    
    updateUI() {
        this.uiManager.updateScore(this.score);
        this.uiManager.updateTimer(this.timeLeft);
        this.uiManager.updateLevel(this.currentLevel);
        this.uiManager.updateStats(this.stats);
        this.uiManager.updatePowerups(this.powerups, this.activePowerups);
        
        // Zaman çubuğu
        const config = ConfigUtils.getLevelConfig(this.currentLevel);
        this.uiManager.updateTimeBar(this.timeLeft, config.duration);
        
        // Zaman çubuğunu sadece oyun sırasında göster
        if (this.gameState === 'playing') {
            this.uiManager.showTimeBar();
        } else {
            this.uiManager.hideTimeBar();
        }
    }
    
    endLevel() {
        this.engine.stop();
        this.currentLevel++;
        
        // Hızlı bitirme başarımı kontrolü
        const levelTime = (performance.now() - this.stats.levelStart) / 1000;
        const config = ConfigUtils.getLevelConfig(this.currentLevel - 1);
        if (levelTime < config.duration * 0.7) {
            // Hızlı bitirme başarımı tetikle
            console.log('Hızlı bitirme başarımı!');
        }
        
        if (this.currentLevel >= LevelConfig.length) {
            this.endGame(true); // Kazandı
        } else {
            // Seviye geçişi bonusları
            this.powerups.slowmo++;
            this.powerups.controlLight++;
            this.uiManager.soundManager.play('levelup');
            this.startGame(); // Sonraki seviyeyi başlat
        }
    }
    
    endGame(isWin = false) {
        this.engine.stop();
        window.saveService?.clear();
        this.gameState = 'gameover';
        this.clearAllEffects();
        
        // Yüksek skoru güncelle
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('qualityHighScore', this.highScore.toString());
        }
        
        // Başarımları kaydet
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.uiManager.achievementSystem.unlocked));
        
        // Oyun bitti ekranını göster
        this.uiManager.showGameOverScreen(this.score, this.highScore, this.stats, this.currentLevel, isWin);
        
        if (isWin) {
            this.uiManager.soundManager.play('levelup');
        }
    }
    
    clearAllEffects() {
        this.shakeIntervals.forEach(id => clearInterval(id));
        this.shakeIntervals = [];
        this.uiManager.removeAllEffects();
    }
}

// ŞİŞE SINIFI
class Bottle {
    constructor({ x, y, isFaulty = false, faultType = null }) {
        this.x = x;
        this.y = y;
        this.isFaulty = isFaulty;
        this.faultType = faultType;
        this.width = GameConfig.bottle.width;
        this.height = GameConfig.bottle.height;
        
        // Renk belirleme
        if (isFaulty && faultType && faultType.id === 'color') {
            this.color = GameConfig.bottle.faultyColor;
        } else {
            this.color = GameConfig.bottle.normalColor;
        }
    }
    
    update(speed, deltaTime) {
        this.x += speed * deltaTime;
    }
    
    draw(ctx, isInLight = false, game = null) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Gerçek şişe görselini kullanmayı dene
        if (game && game.bottleImages) {
            this.drawWithRealImages(ctx, isInLight, game);
        } else {
            // Fallback: Eski canvas çizimi
            this.drawFallback(ctx, isInLight);
        }
        
        ctx.restore();
    }
    
    drawWithRealImages(ctx, isInLight, game) {
        // Hangi görseli kullanacağını belirle
        let imageKey = 'normal';
        
        if (this.isFaulty && this.faultType) {
            switch(this.faultType.id) {
                case 'crack':
                case 'microCrack':
                    imageKey = 'crack';
                    break;
                case 'cap':
                    imageKey = 'cap';
                    break;
                case 'fillLevel':
                    imageKey = 'fill';
                    break;
                case 'labelMisalign':
                    // Şişe yaratılırken belirlenen sabit seçim
                    if (!this.imageVariant) {
                        this.imageVariant = Math.random() > 0.5 ? 'label1' : 'label2';
                    }
                    imageKey = this.imageVariant;
                    break;
                case 'color':
                case 'wrongColor':
                    // Şişe yaratılırken belirlenen sabit seçim
                    if (!this.imageVariant) {
                        this.imageVariant = Math.random() > 0.5 ? 'liquid1' : 'liquid2';
                    }
                    imageKey = this.imageVariant;
                    break;
                default:
                    imageKey = 'normal';
            }
        }
        
        const img = game.bottleImages[imageKey];
        if (img && img.complete) {
            // Görsel boyutlandırma
            const scale = 0.8;
            const width = 60 * scale;
            const height = 120 * scale;
            
            // Gölge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(-width / 2 + 3, 3, width, height);
            
            // Kontrol ışığı efekti
            if (isInLight) {
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 15;
            }
            
            // Ana görsel
            ctx.drawImage(img, -width / 2, -height, width, height);
            
            // Kontrol ışığı altında ekstra efektler
            if (isInLight && this.isFaulty && this.faultType && this.faultType.needsLight) {
                this.drawLightEffects(ctx, width, height);
            }
            
            ctx.shadowBlur = 0; // Shadow temizle
        } else {
            // Görsel yüklenmemişse fallback kullan
            this.drawFallback(ctx, isInLight);
        }
    }
    
    drawFallback(ctx, isInLight) {
        // Eski canvas çizim sistemi
        const bottleWidth = this.width;
        const bottleHeight = this.height;
        const neckHeight = GameConfig.bottle.neckHeight;
        const neckWidth = GameConfig.bottle.neckWidth;
        
        // Kontrol ışığı efekti
        if (isInLight) {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 15;
        }
        
        // Şişe gövdesi
        const bodyHeight = bottleHeight - neckHeight;
        const gradBody = ctx.createLinearGradient(-bottleWidth / 2, 0, bottleWidth / 2, 0);
        gradBody.addColorStop(0, UIUtils.shadeColor(this.color, -30));
        gradBody.addColorStop(0.5, this.color);
        gradBody.addColorStop(1, UIUtils.shadeColor(this.color, 30));
        ctx.fillStyle = gradBody;
        ctx.fillRect(-bottleWidth / 2, -bottleHeight, bottleWidth, bodyHeight);
        
        // Şişe boynu
        const gradNeck = ctx.createLinearGradient(-neckWidth / 2, 0, neckWidth / 2, 0);
        gradNeck.addColorStop(0, UIUtils.shadeColor(this.color, -30));
        gradNeck.addColorStop(0.5, this.color);
        gradNeck.addColorStop(1, UIUtils.shadeColor(this.color, 30));
        ctx.fillStyle = gradNeck;
        ctx.fillRect(-neckWidth / 2, -neckHeight, neckWidth, neckHeight);
        
        // Kapak
        ctx.fillStyle = '#e74c3c';
        if (this.isFaulty && this.faultType && this.faultType.id === 'cap') {
            ctx.fillStyle = '#f39c12';
        }
        ctx.fillRect(-neckWidth / 2 - 2, -neckHeight - 5, neckWidth + 4, 5);
        
        // Hata çizimi
        if (this.isFaulty && this.faultType) {
            this.drawFault(ctx, isInLight);
        }
    }
    
    drawLightEffects(ctx, width, height) {
        // Kontrol ışığı altında extra efektler
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-width / 2, -height, width, height);
        ctx.restore();
        
        // Parlaklık efekti
        const gradient = ctx.createRadialGradient(0, -height/2, 0, 0, -height/2, width/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-width / 2, -height, width, height);
    }
    
    drawFault(ctx, isInLight) {
        if (!this.faultType) return;
        
        // Sadece ışık altında görülebilen hatalar
        const lightRequiredFaults = ['microCrack', 'foreignObject', 'fillLevel', 'labelMisalign'];
        const needsLight = lightRequiredFaults.includes(this.faultType.id);
        
        if (needsLight && !isInLight) {
            return; // Işık yoksa hata görünmez
        }
        
        switch (this.faultType.id) {
            case 'microCrack':
                if (isInLight) {
                    // Kontrol ışığı altında çok belirgin çatlak
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#ff0000';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(-8, -55);
                    ctx.lineTo(12, -75);
                    ctx.lineTo(3, -85);
                    ctx.lineTo(-5, -90);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // Çatlak parlaması efekti
                    ctx.strokeStyle = '#ffaaaa';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-6, -57);
                    ctx.lineTo(10, -73);
                    ctx.stroke();
                } else {
                    // Normal durumda çok hafif görünür
                    ctx.strokeStyle = 'rgba(100,100,100,0.4)';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-3, -58);
                    ctx.lineTo(6, -72);
                    ctx.stroke();
                }
                break;
                
            case 'foreignObject':
                if (isInLight) {
                    // Kontrol ışığı altında çok belirgin yabancı cisim
                    ctx.fillStyle = '#000000';
                    ctx.shadowColor = '#000000';
                    ctx.shadowBlur = 5;
                    ctx.beginPath();
                    ctx.arc(-2, -50, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                    // Çevresinde parlaklık halkası
                    ctx.strokeStyle = '#666666';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(-2, -50, 6, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    // Normal durumda çok hafif görünür
                    ctx.fillStyle = 'rgba(50,50,50,0.3)';
                    ctx.beginPath();
                    ctx.arc(-1, -52, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'fillLevel':
                if (isInLight) {
                    // Kontrol ışığı altında belirgin dolum hatası
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.strokeStyle = '#ffaa00';
                    ctx.lineWidth = 2;
                    ctx.fillRect(-18, -42, 36, 12);
                    ctx.strokeRect(-18, -42, 36, 12);
                    
                    // "EKSİK" yazısı
                    ctx.fillStyle = '#ff6600';
                    ctx.font = '8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('EKSİK', 0, -35);
                } else {
                    // Normal durumda çok hafif görünür
                    ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
                    ctx.fillRect(-12, -44, 24, 8);
                }
                break;
                
            case 'labelMisalign':
                if (isInLight) {
                    // Kontrol ışığı altında belirgin eğri etiket
                    ctx.save();
                    ctx.rotate(0.15); // Daha belirgin eğim
                    ctx.fillStyle = '#ffff00';
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 2;
                    ctx.fillRect(-15, -58, 30, 12);
                    ctx.strokeRect(-15, -58, 30, 12);
                    
                    // "EĞRİ" yazısı
                    ctx.fillStyle = '#cc0000';
                    ctx.font = '7px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('EĞRİ', 0, -50);
                    ctx.restore();
                } else {
                    // Normal durumda çok hafif görünür
                    ctx.save();
                    ctx.rotate(0.05);
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
                    ctx.fillRect(-10, -56, 20, 6);
                    ctx.restore();
                }
                break;
                
            default:
                // Görünür hatalar her zaman görünür
                break;
        }
    }
    
    isClickedAt(x, y) {
        const bottleLeft = this.x - this.width / 2;
        const bottleRight = this.x + this.width / 2;
        const bottleTop = this.y - this.height;
        const bottleBottom = this.y;
        
        return x > bottleLeft && x < bottleRight && y > bottleTop && y < bottleBottom;
    }
}

// KONVEYÖR BANDI SINIFI
class ConveyorBelt {
    constructor(canvas) {
        this.canvas = canvas;
        this.animationOffset = 0;
        this.updateDimensions(canvas.width, canvas.height);
    }
    
    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.beltY = height * GameConfig.belt.yPosition;
        this.beltHeight = height * GameConfig.belt.height;
    }
    
    update(speed, deltaTime) {
        this.animationOffset += speed * deltaTime / GameConfig.belt.animationSpeed;
        this.animationOffset %= GameConfig.belt.lineSpacing;
    }
    
    draw(ctx) {
        // Bant yüzeyi
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, this.beltY, this.width, this.beltHeight);
        
        // Bant detayları
        ctx.fillStyle = '#566573';
        ctx.fillRect(0, this.beltY, this.width, 10);
        ctx.fillRect(0, this.beltY + this.beltHeight - 10, this.width, 10);
        
        // Hareketli çizgiler
        ctx.strokeStyle = 'rgba(149, 165, 166, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = -GameConfig.belt.lineSpacing + this.animationOffset; x < this.width; x += GameConfig.belt.lineSpacing) {
            ctx.moveTo(x, this.beltY + 15);
            ctx.lineTo(x + 20, this.beltY + this.beltHeight - 15);
        }
        
        ctx.stroke();
    }
}

// KONTROL IŞIĞI SINIFI (YENİ)
class ControlLight {
    constructor(canvas) {
        this.canvas = canvas;
        this.isAlwaysActive = true; // Artık sürekli aktif
        this.position = GameConfig.controlLight.position;
        this.width = GameConfig.controlLight.width;
        this.intensity = GameConfig.controlLight.intensity;
        this.animationPhase = 0;
        this.combo = 0; // current combo multiplier for glow strength
        this.updateDimensions(canvas.width, canvas.height);
    }
    
    updateDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.centerX = width * this.position;
        this.lightWidth = width * this.width;
        this.lightLeft = this.centerX - this.lightWidth / 2;
        this.lightRight = this.centerX + this.lightWidth / 2;
        
        // Dikdörtgen ışık alanı
        this.beltY = height * GameConfig.belt.yPosition;
        this.lightHeight = height * GameConfig.belt.height;
    }
    
    updateConfig(levelConfig) {
        // Seviye konfigürasyonuna göre ışık özelliklerini güncelle
        // Bu fonksiyon gelecekte genişletilebilir
    }
    
    update(deltaTime) {
        // Işık titreşim animasyonu
        this.animationPhase += deltaTime * 2;
    }
    
    activate() {
        // Artık sürekli aktif olduğu için bu fonksiyon boş
        // Gelecekte özel efektler için kullanılabilir
    }
    
    draw(ctx) {
        if (!this.isAlwaysActive) return;

        // pulse grows slightly with combo multiplier
        const comboFactor = 1 + Math.min(this.combo, 10) * 0.05;
        const pulseFactor = 0.9 + Math.sin(this.animationPhase) * 0.1 * comboFactor;

        // glow backdrop
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const radius = this.lightWidth * 0.8;
        const radial = ctx.createRadialGradient(
            this.centerX, this.beltY + this.lightHeight / 2, 0,
            this.centerX, this.beltY + this.lightHeight / 2, radius
        );
        radial.addColorStop(0, `rgba(0,255,255,${0.15 * comboFactor * pulseFactor})`);
        radial.addColorStop(1, 'rgba(0,255,255,0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(this.centerX, this.beltY + this.lightHeight / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ana ışık dikdörtgeni
        const gradient = ctx.createLinearGradient(
            this.lightLeft, this.beltY,
            this.lightRight, this.beltY
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${this.intensity * 0.4 * pulseFactor})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.intensity * 0.7 * pulseFactor})`);
        gradient.addColorStop(0.8, `rgba(255, 255, 255, ${this.intensity * 0.4 * pulseFactor})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.lightLeft, this.beltY, this.lightWidth, this.lightHeight);

        // Işık kenarları (daha belirgin alan)
        ctx.strokeStyle = `rgba(200, 200, 255, ${0.6 * pulseFactor})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(this.lightLeft, this.beltY, this.lightWidth, this.lightHeight);
        ctx.setLineDash([]);

        // "KONTROL ALANI" yazısı
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulseFactor})`;
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText('KONTROL ALANI', this.centerX, this.beltY - 15);
        ctx.shadowBlur = 0;
    }

    setCombo(combo) {
        this.combo = combo;
    }
    
    isInLightZone(bottleX) {
        // Şişenin merkezi kontrol alanında mı?
        return this.isAlwaysActive && bottleX >= this.lightLeft && bottleX <= this.lightRight;
    }
}

// DİNAMİK ARKA PLAN YÖNETİCİSİ (YENİ)
class BackgroundManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.elements = [];
        this.updateDimensions(canvas.width, canvas.height);
        this.initElements();
    }
    
    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
    }
    
    initElements() {
        // Arka plan elemanlarını oluştur
        this.elements = [
            // Fabrika duvarı deseni
            {
                type: 'factoryWall',
                x: 0,
                y: 0,
                width: this.width,
                height: this.height * 0.3,
                scrollSpeed: 0
            },
            // Büyük dişliler
            {
                type: 'gear',
                x: this.width * 0.1,
                y: this.height * 0.15,
                radius: 40,
                rotation: 0,
                rotationSpeed: 0.5,
                scrollSpeed: 0.1
            },
            {
                type: 'gear',
                x: this.width * 0.8,
                y: this.height * 0.2,
                radius: 30,
                rotation: 0,
                rotationSpeed: -0.3,
                scrollSpeed: 0.1
            },
            // Borular
            {
                type: 'pipe',
                x: this.width * 0.3,
                y: 0,
                width: 20,
                height: this.height * 0.4,
                scrollSpeed: 0.05
            },
            {
                type: 'pipe',
                x: this.width * 0.7,
                y: 0,
                width: 15,
                height: this.height * 0.35,
                scrollSpeed: 0.05
            },
            // Buhar efektleri
            {
                type: 'steam',
                x: this.width * 0.2,
                y: this.height * 0.3,
                particles: this.createSteamParticles(this.width * 0.2, this.height * 0.3),
                scrollSpeed: 0.2
            },
            {
                type: 'steam',
                x: this.width * 0.9,
                y: this.height * 0.25,
                particles: this.createSteamParticles(this.width * 0.9, this.height * 0.25),
                scrollSpeed: 0.2
            },
            // Konveyör destekleri
            {
                type: 'support',
                x: this.width * 0.25,
                y: this.height * 0.6,
                width: 30,
                height: this.height * 0.2,
                scrollSpeed: 1.0
            },
            {
                type: 'support',
                x: this.width * 0.75,
                y: this.height * 0.6,
                width: 30,
                height: this.height * 0.2,
                scrollSpeed: 1.0
            }
        ];
    }
    
    createSteamParticles(x, y) {
        const particles = [];
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + Math.random() * 20,
                opacity: Math.random() * 0.6 + 0.2,
                size: Math.random() * 8 + 4,
                life: Math.random() * 2 + 1,
                maxLife: Math.random() * 2 + 1
            });
        }
        return particles;
    }
    
    update(beltSpeed, deltaTime) {
        this.elements.forEach(element => {
            switch (element.type) {
                case 'gear':
                    element.rotation += element.rotationSpeed * deltaTime;
                    element.x -= beltSpeed * element.scrollSpeed * deltaTime;
                    
                    // Ekran dışına çıkarsa karşı taraftan getir
                    if (element.x < -element.radius) {
                        element.x = this.width + element.radius;
                    } else if (element.x > this.width + element.radius) {
                        element.x = -element.radius;
                    }
                    break;
                    
                case 'pipe':
                    element.x -= beltSpeed * element.scrollSpeed * deltaTime;
                    if (element.x < -element.width) {
                        element.x = this.width + element.width;
                    }
                    break;
                    
                case 'support':
                    element.x -= beltSpeed * element.scrollSpeed * deltaTime;
                    if (element.x < -element.width) {
                        element.x = this.width + Math.random() * 200;
                    }
                    break;
                    
                case 'steam':
                    element.x -= beltSpeed * element.scrollSpeed * deltaTime;
                    if (element.x < -50) {
                        element.x = this.width + 50;
                        element.particles = this.createSteamParticles(element.x, element.y);
                    }
                    
                    // Buhar parçacıklarını güncelle
                    element.particles.forEach(particle => {
                        particle.y -= 30 * deltaTime;
                        particle.life -= deltaTime;
                        particle.opacity = (particle.life / particle.maxLife) * 0.6;
                        
                        if (particle.life <= 0) {
                            particle.y = element.y + Math.random() * 20;
                            particle.life = particle.maxLife;
                            particle.opacity = Math.random() * 0.6 + 0.2;
                        }
                    });
                    break;
            }
        });
    }
    
    draw(ctx) {
        ctx.save();
        
        this.elements.forEach(element => {
            switch (element.type) {
                case 'factoryWall':
                    this.drawFactoryWall(ctx, element);
                    break;
                case 'gear':
                    this.drawGear(ctx, element);
                    break;
                case 'pipe':
                    this.drawPipe(ctx, element);
                    break;
                case 'steam':
                    this.drawSteam(ctx, element);
                    break;
                case 'support':
                    this.drawSupport(ctx, element);
                    break;
            }
        });
        
        ctx.restore();
    }
    
    drawFactoryWall(ctx, element) {
        // Fabrika duvarı deseni
        const gradient = ctx.createLinearGradient(0, 0, 0, element.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(0.5, '#34495e');
        gradient.addColorStop(1, '#2c3e50');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Tuğla deseni
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 2;
        
        const brickHeight = 20;
        const brickWidth = 60;
        
        for (let y = 0; y < element.height; y += brickHeight) {
            for (let x = 0; x < element.width; x += brickWidth) {
                const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                ctx.strokeRect(x + offsetX, y, brickWidth, brickHeight);
            }
        }
        
        // Pencereler
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(element.width * 0.1, element.height * 0.2, 40, 30);
        ctx.fillRect(element.width * 0.8, element.height * 0.3, 35, 25);
    }
    
    drawGear(ctx, element) {
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation);
        
        // Dişli dış çemberi
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        
        const teeth = 12;
        const outerRadius = element.radius;
        const innerRadius = element.radius * 0.8;
        
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
            
            const x1 = Math.cos(angle) * outerRadius;
            const y1 = Math.sin(angle) * outerRadius;
            const x2 = Math.cos(angle + 0.1) * innerRadius;
            const y2 = Math.sin(angle + 0.1) * innerRadius;
            const x3 = Math.cos(nextAngle - 0.1) * innerRadius;
            const y3 = Math.sin(nextAngle - 0.1) * innerRadius;
            const x4 = Math.cos(nextAngle) * outerRadius;
            const y4 = Math.sin(nextAngle) * outerRadius;
            
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // İç delik
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.arc(0, 0, element.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawPipe(ctx, element) {
        // Boru gövdesi
        const gradient = ctx.createLinearGradient(element.x, 0, element.x + element.width, 0);
        gradient.addColorStop(0, '#95a5a6');
        gradient.addColorStop(0.5, '#bdc3c7');
        gradient.addColorStop(1, '#95a5a6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Boru kenarları
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        
        // Boru bağlantıları
        ctx.fillStyle = '#7f8c8d';
        for (let i = 0; i < 3; i++) {
            const y = element.y + (element.height / 4) * (i + 1);
            ctx.fillRect(element.x - 5, y - 3, element.width + 10, 6);
        }
    }
    
    drawSteam(ctx, element) {
        element.particles.forEach(particle => {
            if (particle.opacity > 0) {
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }
    
    drawSupport(ctx, element) {
        // Destek ayağı
        const gradient = ctx.createLinearGradient(element.x, 0, element.x + element.width, 0);
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(0.5, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Destek çubukları
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(element.x + 5, element.y);
        ctx.lineTo(element.x + element.width - 5, element.y + element.height);
        ctx.moveTo(element.x + element.width - 5, element.y);
        ctx.lineTo(element.x + 5, element.y + element.height);
        ctx.stroke();
        
        // Alt plaka
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(element.x - 10, element.y + element.height - 5, element.width + 20, 10);
    }
}
