// KALITE KONTROL SIMÜLATÖRÜ PRO - ANA BAŞLATICI
// Sürüm: v2.0.0


class AppLoader {
    constructor() {
        this.game = null;
        this.loadingStartTime = Date.now();
    }
    
    async init() {
        console.log(`Kalite Kontrol Simülatörü Pro v${GameConfig.version} başlatılıyor...`);
        
        // Yükleme ekranını göster
        this.showLoader();
        
        // Minimum yükleme süresi (UX için)
        await this.ensureMinimumLoadTime(1500);
        
        // Intro ekranını göster
        this.showIntro();
        
        // Intro'dan sonra oyunu başlat
        setTimeout(() => {
            this.startMainGame();
        }, 3000);
    }
    
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    showIntro() {
        this.hideLoader();
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) {
            introScreen.style.display = 'flex';
        }
    }
    
    hideIntro() {
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) {
            introScreen.style.display = 'none';
        }
    }
    
    startMainGame() {
        this.hideIntro();
        
        // Ana oyun nesnesini oluştur
        this.game = new Game();

        // Başlangıç ekranını göster
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.remove('hidden');

            const save = window.saveService.load();
            const continueBtn = document.getElementById('continue-button');
            if (save && continueBtn) {
                continueBtn.classList.remove('hidden');
                continueBtn.addEventListener('click', () => {
                    this.game.loadState(save);
                    this.game.uiManager.hideStartScreen();
                    this.game.startGame();
                    this.game.combo = save.combo || 0;
                }, { once: true });
            }
        }
        
        console.log('Oyun başarıyla yüklendi ve hazır!');
        this.logSystemInfo();
    }
    
    async ensureMinimumLoadTime(minTime) {
        const elapsed = Date.now() - this.loadingStartTime;
        const remaining = Math.max(0, minTime - elapsed);
        
        if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, remaining));
        }
    }
    
    logSystemInfo() {
        console.log('=== SİSTEM BİLGİLERİ ===');
        console.log(`Tarayıcı: ${navigator.userAgent}`);
        console.log(`Ekran Çözünürlüğü: ${window.screen.width}x${window.screen.height}`);
        console.log(`Canvas Boyutu: ${this.game.canvas.width}x${this.game.canvas.height}`);
        console.log(`Toplam Seviye: ${LevelConfig.length}`);
        console.log(`Ses Sistemi: ${this.game.uiManager.soundManager.enabled ? 'Aktif' : 'Devre Dışı'}`);
        console.log('========================');
    }
}

// Uygulama yükleyici ve başlatıcı
document.addEventListener('DOMContentLoaded', () => {
    const appLoader = new AppLoader();
    
    // Tüm kaynaklar yüklendiğinde başlat
    window.addEventListener('load', () => {
        appLoader.init().catch(error => {
            console.error('Oyun başlatılırken hata oluştu:', error);
        });
    });
    
    // Hata yakalayıcı
    window.addEventListener('error', (event) => {
        console.error('Global hata:', event.error);
        
        // Eğer hata UI.js ile ilgiliyse özel mesaj göster
        if (event.error && event.error.message && event.error.message.includes('UIManager')) {
            console.error('KRITIK HATA: UIManager sınıfı bulunamadı! ui.js dosyası düzgün yüklenmedi.');
            return;
        }
        
        // Kritik hata durumunda kullanıcıyı bilgilendir
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 9999;
            max-width: 80%;
            text-align: center;
            font-family: Arial, sans-serif;
        `;
        errorMessage.innerHTML = `
            <h3>🚨 Kalite Kontrol Hatası!</h3>
            <p>Oyunda beklenmedik bir hata oluştu. Fabrika işletmecisine (geliştirici) bildirildi.</p>
            <p><small>Hata: ${event.error?.message || 'Bilinmeyen hata'}</small></p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                font-weight: bold;
            ">🔄 Fabrikayı Yeniden Başlat</button>
        `;
        document.body.appendChild(errorMessage);
    });
    
    // Performans izleme
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log(`Sayfa yükleme süresi: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            }, 0);
        });
    }
});

// Geliştirici araçları (sadece development ortamında)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DevTools = {
        skipToLevel: (level) => {
            if (window.game && window.game.game) {
                window.game.game.currentLevel = level;
                console.log(`Seviye ${level + 1}'e atlandı`);
            }
        },
        
        addScore: (amount) => {
            if (window.game && window.game.game) {
                window.game.game.score += amount;
                console.log(`${amount} puan eklendi`);
            }
        },
        
        unlockAllAchievements: () => {
            const allIds = GameConfig.achievements.map(a => a.id);
            localStorage.setItem('unlockedAchievements', JSON.stringify(allIds));
            console.log('Tüm başarımlar açıldı');
        },
        
        resetProgress: () => {
            localStorage.removeItem('qualityHighScore');
            localStorage.removeItem('unlockedAchievements');
            console.log('Tüm ilerleme sıfırlandı');
        }
    };
    
    console.log('=== GELİŞTİRİCİ ARAÇLARI ===');
    console.log('DevTools.skipToLevel(n) - Seviye atla');
    console.log('DevTools.addScore(n) - Puan ekle');
    console.log('DevTools.unlockAllAchievements() - Tüm başarımları aç');
    console.log('DevTools.resetProgress() - İlerlemeyi sıfırla');
    console.log('============================');
}
