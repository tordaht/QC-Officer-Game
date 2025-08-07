// Basit pub/sub sistemi
const EventBus = {
    events: {},
    subscribe(name, fn) {
        (this.events[name] || (this.events[name] = [])).push(fn);
    },
    publish(name, data) {
        (this.events[name] || []).forEach(fn => fn(data));
    }
};
window.EventBus = EventBus;

// ÇOK DİLLİ DESTEK SİSTEMİ
class LanguageManager {
    constructor() {
        // load persisted language or default
        this.currentLanguage = localStorage.getItem('qc_currentLang') || 'en';
        this.translations = {};
        this.debounceTimer = null;
        this.loadTranslations();
    }

    loadTranslations() {
        // İNGİLİZCE ÇEVİRİLER
        this.translations.en = {
            // BAŞLIK VE MENÜLER
            gameTitle: "QUALITY<br>CONTROL",
            gameSubtitle: "Pro Simulator v2.0",
            introTip: "⚡ Use the Control Zone to spot hidden defects!",
            gameDescription: "You must inspect products passing through our company's production line. Detect defective bottles and remove them from the belt. Correct detections earn points, mistakes lose points.",
            gameFeatures: "<strong>NEW:</strong> With the control light system, you can now detect microscopic defects! Some defects are only visible under special light.",
            gameStory: "<strong>Story:</strong> You're a newly hired quality control specialist at EuroBottle Industries. In this epic 40-level adventure, you must protect the factory from sabotage!",
            
            // BUTONLAR
            startGame: "START SHIFT",
            continueGame: "CONTINUE",
            restartGame: "RESTART",
            soundToggle: "Sound",
            slowDown: "Slow Down",
            
            // OYUN ARAYÜZÜ
            score: "Score",
            time: "Time",
            level: "Level",
            combo: "Combo",
            
            // İSTATİSTİKLER
            correct: "Correct",
            wrong: "Wrong",
            accuracy: "Accuracy",
            
            // GÜÇLER
            slowmoBtn: `Slow Motion (1)`,
            controlLightBtn: `Control Light (2)`,
            
            // OYUN DURUMLARI
            gameOver: "SHIFT ENDED",
            levelComplete: "LEVEL COMPLETE!",
            newHighScore: "NEW HIGH SCORE!",
            
            // MESAJLAR
            perfectLevel: "Perfect Quality Control!",
            excellentWork: "Excellent Work!",
            goodJob: "Good Job!",
            needsImprovement: "Quality Standards Not Met",
            
            // BAŞARIMLAR
            achievements: {
                first_blood: {
                    name: "First Catch",
                    description: "Spot your first defective bottle"
                },
                perfectionist: {
                    name: "Perfectionist",
                    description: "Complete a level with 100% accuracy"
                },
                speed_demon: {
                    name: "Speed Demon", 
                    description: "Reach 10x combo multiplier"
                },
                eagle_eye: {
                    name: "Eagle Eye",
                    description: "Find 5 micro-cracks in one level"
                },
                quality_master: {
                    name: "Quality Master",
                    description: "Complete 10 levels"
                },
                legendary_inspector: {
                    name: "Legendary Inspector",
                    description: "Reach level 20"
                }
            },

            // HİKAYE KARAKTERLER
            storyCharacters: {
                supervisor: "Shift Supervisor",
                engineer: "Quality Engineer", 
                manager: "Plant Manager",
                inspector: "Chief Inspector"
            },

            // HATA TİPLERİ
            faultTypes: {
                wrongColor: "Wrong Color",
                crack: "Crack",
                cap: "Cap Defect",
                fillLevel: "Fill Level",
                microCrack: "Micro Crack",
                foreignObject: "Foreign Object",
                labelMisalign: "Label Misaligned"
            },

            // SEVİYE GEÇİŞ
            levelTransition: {
                preparing: "Preparing next batch...",
                levelUp: "Level {level}",
                getReady: "Quality check in progress"
            },

            // KONTROL ALANI
            controlZone: "CONTROL ZONE",
            
            // HİKAYE DİYALOGLARI (AVRUPA TARZI)
            storyDialogues: [
                {
                    level: 1,
                    character: "supervisor",
                    dialogue: "Welcome to EuroBottle Industries! I'm Sarah, your shift supervisor. Today you'll learn our quality control procedures."
                },
                {
                    level: 2,
                    character: "supervisor", 
                    dialogue: "Excellent work! Remember, each bottle must meet our strict European quality standards. Look for color variations and visible cracks."
                },
                {
                    level: 3,
                    character: "engineer",
                    dialogue: "I'm Marcus from Quality Engineering. We've installed a new control light system. Use it to spot defects invisible to the naked eye."
                },
                {
                    level: 5,
                    character: "supervisor",
                    dialogue: "The production line is speeding up. Stay focused! Some defects are only visible under the control light."
                },
                {
                    level: 7,
                    character: "manager",
                    dialogue: "Impressive results! I'm Elena, the plant manager. Our clients demand perfection - micro-cracks can cause catastrophic failures."
                },
                {
                    level: 10,
                    character: "inspector",
                    dialogue: "Greetings! I'm Chief Inspector Hans. You've proven yourself capable. Now we test your skills with the most challenging batches."
                },
                {
                    level: 15,
                    character: "engineer",
                    dialogue: "The new polymer bottles require extra attention. Foreign objects and fill level errors are becoming more common."
                },
                {
                    level: 20,
                    character: "manager",
                    dialogue: "Outstanding performance! You've maintained our zero-defect policy. The European Quality Council will be impressed."
                }
            ]
        };

        // TÜRKÇE ÇEVİRİLER
        this.translations.tr = {
            // BAŞLIK VE MENÜLER
            gameTitle: "KALİTE<br>KONTROL",
            gameSubtitle: "Pro Simülatör v2.0",
            introTip: "⚡ Gizli hataları görmek için Kontrol Alanını kullan!",
            gameDescription: "Şirketimizin üretim bandından geçen ürünleri kontrol etmelisin. Hatalı şişeleri tespit edip banttan ayıklamalısın. Doğru tespitler puan kazandırır, hatalar ise puan kaybettirir.",
            gameFeatures: "<strong>YENİ:</strong> Kontrol ışığı sistemi ile artık mikroskobik hataları da tespit edebilirsin! Bazı hatalar sadece özel ışık altında görünür.",
            gameStory: "<strong>Hikaye:</strong> AnadoluŞişe Fabrikasında yeni başlayan bir kalite kontrol uzmanısın. 40 bölümlük epik bir serüvende fabrikayı sabotajdan koruman gerekiyor!",
            
            // BUTONLAR
            startGame: "VARDİYA BAŞLAT",
            continueGame: "DEVAM ET",
            restartGame: "YENİDEN BAŞLAT",
            soundToggle: "Ses",
            slowDown: "Yavaşlat",
            
            // OYUN ARAYÜZÜ
            score: "Puan",
            time: "Süre",
            level: "Seviye",
            combo: "Kombo",
            
            // İSTATİSTİKLER
            correct: "Doğru",
            wrong: "Yanlış",
            accuracy: "İsabet",
            
            // GÜÇLER
            slowmoBtn: `Yavaş Çekim (1)`,
            controlLightBtn: `Kontrol Işığı (2)`,
            
            // OYUN DURUMLARI
            gameOver: "VARDİYA BİTTİ",
            levelComplete: "SEVİYE TAMAMLANDI!",
            newHighScore: "YENİ REKOR!",
            
            // MESAJLAR
            perfectLevel: "Mükemmel Kalite Kontrolü!",
            excellentWork: "Mükemmel İş!",
            goodJob: "İyi İş!",
            needsImprovement: "Kalite Standartları Karşılanmadı",
            
            // BAŞARIMLAR
            achievements: {
                first_blood: {
                    name: "İlk Yakalama",
                    description: "İlk hatalı şişeni yakala"
                },
                perfectionist: {
                    name: "Mükemmeliyetçi",
                    description: "Bir seviyeyi %100 isabetli tamamla"
                },
                speed_demon: {
                    name: "Hız Şeytanı",
                    description: "10x kombo çarpanına ulaş"
                },
                eagle_eye: {
                    name: "Kartal Gözü",
                    description: "Bir seviyede 5 mikro çatlak bul"
                },
                quality_master: {
                    name: "Kalite Ustası", 
                    description: "10 seviye tamamla"
                },
                legendary_inspector: {
                    name: "Efsanevi Denetçi",
                    description: "20. seviyeye ulaş"
                }
            },

            // HİKAYE KARAKTERLER
            storyCharacters: {
                supervisor: "Vardiya Amiri",
                engineer: "Kalite Mühendisi",
                manager: "Tesis Müdürü", 
                inspector: "Başdenetçi"
            },

            // HATA TİPLERİ
            faultTypes: {
                wrongColor: "Yanlış Renk",
                crack: "Çatlak",
                cap: "Kapak Hatası",
                fillLevel: "Dolum Seviyesi",
                microCrack: "Mikro Çatlak",
                foreignObject: "Yabancı Cisim",
                labelMisalign: "Etiket Hizası"
            },

            // SEVİYE GEÇİŞ
            levelTransition: {
                preparing: "Sonraki parti hazırlanıyor...",
                levelUp: "Seviye {level}",
                getReady: "Kalite kontrolü devam ediyor"
            },

            // KONTROL ALANI
            controlZone: "KONTROL ALANI",
            
            // HİKAYE DİYALOGLARI
            storyDialogues: [
                {
                    level: 1,
                    character: "supervisor",
                    dialogue: "AnadoluŞişe Fabrikasına hoş geldin! Ben Ayşe, vardiya amirin. Bugün kalite kontrol prosedürlerimizi öğreneceksin."
                },
                {
                    level: 2,
                    character: "supervisor",
                    dialogue: "Harika iş! Unutma, her şişe sıkı kalite standartlarımızı karşılamalı. Renk farklılıkları ve görünür çatlakları ara."
                },
                {
                    level: 3,
                    character: "engineer", 
                    dialogue: "Ben Mehmet, Kalite Mühendisiyim. Yeni kontrol ışık sistemi kurduk. Çıplak gözle görünmeyen hataları tespit etmek için kullan."
                },
                {
                    level: 5,
                    character: "supervisor",
                    dialogue: "Üretim hattı hızlanıyor. Odaklan! Bazı hatalar sadece kontrol ışığı altında görülür."
                },
                {
                    level: 7,
                    character: "manager",
                    dialogue: "Etkileyici sonuçlar! Ben Fatma, tesis müdürü. Müşterilerimiz mükemmellik talep ediyor - mikro çatlaklar felaket yaratabilir."
                },
                {
                    level: 10,
                    character: "inspector",
                    dialogue: "Merhaba! Ben Başdenetçi Ali. Yeteneklerini kanıtladın. Şimdi en zorlayıcı partilerle becerini test ediyoruz."
                },
                {
                    level: 15,
                    character: "engineer",
                    dialogue: "Yeni polimer şişeler ekstra dikkat gerektiriyor. Yabancı cisim ve dolum seviyesi hataları yaygınlaşıyor."
                },
                {
                    level: 20,
                    character: "manager",
                    dialogue: "Olağanüstü performans! Sıfır hata politikamızı sürdürdün. Kalite Konseyi çok memnun olacak."
                }
            ]
        };
    }

    setLanguage(lang) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (this.currentLanguage === lang) return;
            this.currentLanguage = lang;
            // persist and update central config
            localStorage.setItem('qc_currentLang', lang);
            if (window.GameConfig) {
                GameConfig.currentLang = lang;
            }
            this.updateAllTexts();
        }, 100);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    get(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Fallback: return key if translation not found
            }
        }
        
        if (typeof value === 'string') {
            // Replace parameters like {level}
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value || key;
    }

    updateAllTexts() {
        // notify subscribers that language changed
        EventBus.publish('languageChanged', this.currentLanguage);
    }
}

// Global dil yöneticisi
window.LanguageManager = new LanguageManager();
