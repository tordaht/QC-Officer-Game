// KALITE KONTROL SIMÜLATÖRÜ PRO - YAPILANDIRMA
// Sürüm: v2.0.0

const GameConfig = {
    version: "2.0.0",
    // active language shared across modules
    currentLang: localStorage.getItem('qc_currentLang') || 'en',

    // Oyun ayarları
    maxWidth: 1000,
    maxHeight: 600,
    aspectRatio: 1.67,
    mobileAspectRatio: 1.5,
    
    // Şişe özellikleri
    bottle: {
        width: 40,
        height: 100,
        neckHeight: 30,
        neckWidth: 20,
        normalColor: '#76c7c0',
        faultyColor: '#b33939'
    },
    
    // Konveyör bandı
    belt: {
        yPosition: 0.7, // Canvas yüksekliğinin yüzdesi
        height: 0.2,    // Canvas yüksekliğinin yüzdesi
        lineSpacing: 40,
        animationSpeed: 20
    },
    
    // Kontrol ışığı sistemi (YENİ - SÜREKLİ AKTİF)
    controlLight: {
        position: 0.4,      // Bandın hangi noktasında (0-1 arası)
        width: 0.3,         // Bandın genişliğinin yüzdesi (biraz daha geniş)
        intensity: 0.6,     // Işık yoğunluğu (biraz daha yumuşak)
        alwaysActive: true  // Artık sürekli aktif
    },
    
    // Güçlendirmeler
    powerups: {
        slowmo: {
            initial: 1,
            duration: 5000,
            effect: 0.4 // Hız çarpanı
        }
        // Kontrol ışığı artık sürekli aktif olduğu için powerup değil
    },
    
    // Başarımlar
    achievements: [
        { 
            id: 'first_blood', 
            title: 'İlk Kan', 
            desc: 'İlk hatalı ürünü buldun!', 
            condition: 'stats.correct >= 1' 
        },
        { 
            id: 'combo_5', 
            title: '5x Kombo', 
            desc: '5 ürün üst üste doğru tespit!', 
            condition: 'combo >= 5' 
        },
        { 
            id: 'combo_10', 
            title: '10x Kombo', 
            desc: '10 ürün üst üste doğru tespit!', 
            condition: 'combo >= 10' 
        },
        { 
            id: 'combo_20', 
            title: '20x Kombo', 
            desc: '20 ürün üst üste doğru tespit!', 
            condition: 'combo >= 20' 
        },
        { 
            id: 'level_5', 
            title: 'Deneyimli', 
            desc: '5. seviyeye ulaştın!', 
            condition: 'currentLevel >= 5' 
        },
        { 
            id: 'level_10', 
            title: 'Uzman', 
            desc: '10. seviyeye ulaştın!', 
            condition: 'currentLevel >= 10' 
        },
        { 
            id: 'level_15', 
            title: 'Usta', 
            desc: '15. seviyeye ulaştın!', 
            condition: 'currentLevel >= 15' 
        },
        { 
            id: 'level_20', 
            title: 'Efsane', 
            desc: '20. seviyeye ulaştın!', 
            condition: 'currentLevel >= 20' 
        },
        { 
            id: 'score_500', 
            title: 'Başlangıç', 
            desc: '500 puana ulaştın!', 
            condition: 'score >= 500' 
        },
        { 
            id: 'score_1000', 
            title: 'Yetenekli', 
            desc: '1000 puana ulaştın!', 
            condition: 'score >= 1000' 
        },
        { 
            id: 'score_2000', 
            title: 'Profesyonel', 
            desc: '2000 puana ulaştın!', 
            condition: 'score >= 2000' 
        },
        { 
            id: 'score_5000', 
            title: 'Deha', 
            desc: '5000 puana ulaştın!', 
            condition: 'score >= 5000' 
        },
        { 
            id: 'accuracy_80', 
            title: 'Keskin Göz', 
            desc: '%80 doğruluk oranı!', 
            condition: 'stats.total > 0 && (stats.correct / stats.total) >= 0.8' 
        },
        { 
            id: 'accuracy_90', 
            title: 'Kartal Gözü', 
            desc: '%90 doğruluk oranı!', 
            condition: 'stats.total > 0 && (stats.correct / stats.total) >= 0.9' 
        },
        { 
            id: 'accuracy_95', 
            title: 'Mükemmel', 
            desc: '%95 doğruluk oranı!', 
            condition: 'stats.total > 0 && (stats.correct / stats.total) >= 0.95' 
        },
        { 
            id: 'no_mistakes', 
            title: 'Kusursuz', 
            desc: 'Bir seviyede hiç hata yapmadan bitir!', 
            condition: 'stats.levelMistakes === 0 && gameState === "transition"' 
        },
        { 
            id: 'control_light_master', 
            title: 'Işık Ustası', 
            desc: 'Kontrol ışığını 10 kez kullan!', 
            condition: 'stats.controlLightUsed >= 10' 
        },
        { 
            id: 'micro_crack_hunter', 
            title: 'Mikro Çatlak Avcısı', 
            desc: '5 mikro çatlak tespit et!', 
            condition: 'stats.microCracksFound >= 5' 
        }
    ],
    
    // Hata türleri (GENİŞLETİLMİŞ)
    faultTypes: {
        // Görünür hatalar (her zaman görülebilir)
        visible: [
            {
                id: 'color',
                name: 'Renk Hatası',
                color: '#b33939',
                description: 'Yanlış renk sıvı'
            },
            {
                id: 'cap',
                name: 'Kapak Hatası',
                color: '#f39c12',
                description: 'Yanlış renk kapak'
            }
        ],
        
        // Kontrol ışığı gerektiren hatalar (YENİ)
        lightRequired: [
            {
                id: 'microCrack',
                name: 'Mikro Çatlak',
                description: 'Sadece ışık altında görülebilen ince çatlak'
            },
            {
                id: 'foreignObject',
                name: 'Yabancı Cisim',
                description: 'İçinde küçük bir parçacık'
            },
            {
                id: 'fillLevel',
                name: 'Dolum Hatası',
                description: 'Eksik veya fazla dolum'
            },
            {
                id: 'labelMisalign',
                name: 'Etiket Hizalama',
                description: 'Eğri veya eksik etiket'
            }
        ]
    }
};

// SEVİYE YAPILANDIRMASI (GENİŞLETİLMİŞ)
const LevelConfig = [
    // 1-5: Başlangıç seviyeleri - Sadece görünür hatalar
    { 
        duration: 45, 
        speed: 100, 
        faultyChance: 0.15, 
        spawnRate: 1500, 
        distractions: {},
        visibleFaultsOnly: true,
        name: "İşe Başlangıç",
        description: "Kalite kontrol uzmanı olarak ilk günün. Temel becerilerini göster!",
        supervisor: "Mehmet Abi",
        dialogue: "Hoş geldin çaylak! Bu iş kolay görünebilir ama dikkat et. Hatalı şişeleri banttan ayıklaman lazım."
    },
    { 
        duration: 45, 
        speed: 110, 
        faultyChance: 0.18, 
        spawnRate: 1400, 
        distractions: {},
        visibleFaultsOnly: true,
        name: "Ritim Bulma",
        description: "Artık daha hızlı çalışmalısın. Ürünler daha hızlı akıyor!",
        supervisor: "Mehmet Abi",
        dialogue: "İyi gidiyorsun! Şimdi hızı biraz artırıyorum. Dikkatini dağıtma."
    },
    { 
        duration: 50, 
        speed: 120, 
        faultyChance: 0.20, 
        spawnRate: 1300, 
        distractions: {},
        visibleFaultsOnly: true,
        name: "Dikkatli Ol",
        description: "Hata oranı artıyor. Daha dikkatli olmalısın!",
        supervisor: "Mehmet Abi",
        dialogue: "Makinede sorun var galiba, hata oranı artıyor. Sen sadece dikkatli ol."
    },
    { 
        duration: 50, 
        speed: 130, 
        faultyChance: 0.23, 
        spawnRate: 1250, 
        distractions: {},
        visibleFaultsOnly: true,
        name: "Hız Artıyor",
        description: "Bant hızı artıyor. Gözlerini dört aç!",
        supervisor: "Mehmet Abi",
        dialogue: "Siparişler artıyor, hızlı çalışmamız lazım. Ama kaliteyi sakın ihmal etme!"
    },
    { 
        duration: 55, 
        speed: 140, 
        faultyChance: 0.25, 
        spawnRate: 1150, 
        distractions: {},
        visibleFaultsOnly: true,
        name: "Deneyim Kazan",
        description: "Artık deneyimli bir kontrol uzmanısın. Kendini kanıtlama zamanı!",
        supervisor: "Mehmet Abi",
        dialogue: "Artık işi kapmışsın. Şimdi seni daha zor seviyelere hazırlayacağım."
    },
    
    // 6-10: Kontrol ışığı tanıtımı ve titreşimler
    { 
        duration: 60, 
        speed: 150, 
        faultyChance: 0.27, 
        lightFaultRatio: 0.3, // Hataların %30'u ışık gerektirir
        spawnRate: 1050, 
        distractions: { shake: true, shakeFrequency: 6000 },
        name: "Kontrol Işığı",
        description: "Artık kontrol ışığını kullanmayı öğrenmelisin. Bazı hatalar sadece ışık altında görünür!",
        supervisor: "Mühendis Ayşe",
        dialogue: "Merhaba! Ben Ayşe, sistem mühendisiyim. Sana yeni kontrol ışığı sistemini göstereceğim. Bazı hatalar çok küçük, sadece özel ışık altında görünür."
    },
    { 
        duration: 60, 
        speed: 160, 
        faultyChance: 0.30, 
        lightFaultRatio: 0.4,
        spawnRate: 1000, 
        distractions: { shake: true, shakeFrequency: 5000 },
        name: "Gizli Hatalar",
        description: "Mikro çatlaklar ve yabancı cisimler sadece kontrol ışığı ile tespit edilebilir.",
        supervisor: "Mühendis Ayşe",
        dialogue: "Gördün mü? O çatlak çıplak gözle görünmüyordu. Işık olmadan bu hataları kaçırırsın!"
    },
    { 
        duration: 60, 
        speed: 170, 
        faultyChance: 0.32, 
        lightFaultRatio: 0.5,
        spawnRate: 950, 
        distractions: { bandFlicker: true },
        name: "Işık Ustası",
        description: "Kontrol ışığını verimli kullanmayı öğren. Zamanlama çok önemli!",
        supervisor: "Mühendis Ayşe",
        dialogue: "Işığı sürekli açık tutma, enerji israfı! Stratejik kullan, şüpheli şişelerde kullan."
    },
    { 
        duration: 65, 
        speed: 180, 
        faultyChance: 0.34, 
        lightFaultRatio: 0.6,
        spawnRate: 900, 
        distractions: { shake: true, shakeFrequency: 4500 },
        name: "Karma Karışık",
        description: "Artık hem görünür hem de gizli hatalar karışık olarak geliyor!",
        supervisor: "Mühendis Ayşe",
        dialogue: "Artık gerçek işin başlıyor. Hızlı karar ver: Bu şişeyi ışığa tutmaya değer mi?"
    },
    { 
        duration: 65, 
        speed: 190, 
        faultyChance: 0.36, 
        lightFaultRatio: 0.7,
        spawnRate: 850, 
        distractions: { randomStop: true, stopChance: 0.02 },
        name: "Ani Duruşlar",
        description: "Bant aniden durabiliyor. Hazırlıklı ol!",
        supervisor: "Mühendis Ayşe",
        dialogue: "Makine yaşlanıyor, ara sıra duruyor. Sen fırsatı değerlendir, durunca detaylı bak!"
    },
    
    // 11-15: Uzmanlık seviyeleri
    { 
        duration: 70, 
        speed: 200, 
        faultyChance: 0.38, 
        lightFaultRatio: 0.8,
        spawnRate: 800, 
        distractions: { randomStop: true, stopChance: 0.025 },
        name: "Uzman Seviyesi",
        description: "Hataların çoğu artık gizli. Kontrol ışığına güven!",
        supervisor: "Fabrika Müdürü",
        dialogue: "İyi iş çıkarıyorsun! Artık seni uzman seviyesine terfi ettiriyorum. Sorumluluk daha büyük artık."
    },
    { 
        duration: 70, 
        speed: 210, 
        faultyChance: 0.40, 
        lightFaultRatio: 0.85,
        spawnRate: 780, 
        distractions: { shake: true, shakeFrequency: 4000 },
        name: "Mikro Detaylar",
        description: "En küçük hatalar bile müşteriye ulaşmamalı!",
        supervisor: "Fabrika Müdürü",
        dialogue: "Müşteri şikayeti aldık, mikro çatlaklar kaçıyor. Daha dikkatli olmalısın!"
    },
    { 
        duration: 70, 
        speed: 220, 
        faultyChance: 0.42, 
        lightFaultRatio: 0.9,
        spawnRate: 760, 
        distractions: { randomStop: true, stopChance: 0.03, bandFlicker: true },
        name: "Kaotik Ortam",
        description: "Her şey bir arada! Sakin kal ve odaklan.",
        supervisor: "Fabrika Müdürü",
        dialogue: "Fabrikada her şey ters gidiyor ama üretim durmamalı. Sen işine odaklan!"
    },
    { 
        duration: 75, 
        speed: 230, 
        faultyChance: 0.44, 
        lightFaultRatio: 0.95,
        spawnRate: 740, 
        distractions: { randomStop: true, stopChance: 0.03 },
        name: "Sınır Testleri",
        description: "Sınırlarını zorla! Hemen hemen tüm hatalar gizli artık.",
        supervisor: "Fabrika Müdürü",
        dialogue: "Bu seviyeye çok az kişi ulaşır. Kendini kanıtlama zamanı!"
    },
    { 
        duration: 75, 
        speed: 240, 
        faultyChance: 0.46, 
        lightFaultRatio: 1.0, // Tüm hatalar gizli!
        spawnRate: 720, 
        distractions: { shake: true, shakeFrequency: 3500 },
        name: "Tamamen Gizli",
        description: "Artık tüm hatalar kontrol ışığı gerektiriyor!",
        supervisor: "Fabrika Müdürü",
        dialogue: "Son test! Artık hiçbir hata çıplak gözle görünmüyor. Sadece ışığa güven!"
    },
    
    // 16-20: Usta seviyeleri
    { 
        duration: 80, 
        speed: 250, 
        faultyChance: 0.48, 
        lightFaultRatio: 1.0,
        spawnRate: 700, 
        distractions: { randomStop: true, stopChance: 0.04 },
        name: "Usta Kalite Kontrolcüsü",
        description: "Artık gerçek bir ustasın!",
        supervisor: "CEO",
        dialogue: "Tebrikler! Şirket tarihinde bu seviyeye ulaşan 3. kişisin. Özel bir yeteneksin!"
    },
    { 
        duration: 80, 
        speed: 260, 
        faultyChance: 0.50, 
        lightFaultRatio: 1.0,
        spawnRate: 680, 
        distractions: { bandFlicker: true, shake: true, shakeFrequency: 3200 },
        name: "Efsanevi Zorluk",
        description: "Bu seviyeyi bitiren efsane olur!",
        supervisor: "CEO",
        dialogue: "İnanılmaz! Hiç kimse bu seviyeyi geçemedi. Şirket rekorunu kırabilir misin?"
    },
    { 
        duration: 80, 
        speed: 270, 
        faultyChance: 0.52, 
        lightFaultRatio: 1.0,
        spawnRate: 660, 
        distractions: { randomStop: true, stopChance: 0.045 },
        name: "İmkansızın Sınırında",
        description: "İnsan sınırlarını zorla!",
        supervisor: "CEO",
        dialogue: "Bu artık insanlık sınırı! Robotlar bile bu seviyede zorlanıyor!"
    },
    { 
        duration: 85, 
        speed: 280, 
        faultyChance: 0.55, 
        lightFaultRatio: 1.0,
        spawnRate: 640, 
        distractions: { randomStop: true, stopChance: 0.05, shake: true, shakeFrequency: 3000 },
        name: "Süper İnsan",
        description: "İnsan üstü performans!",
        supervisor: "CEO",
        dialogue: "Sen bir süper insansın! Şirket tarihine adını yazdırıyorsun!"
    },
    { 
        duration: 90, 
        speed: 300, 
        faultyChance: 0.60, 
        lightFaultRatio: 1.0,
        spawnRate: 620, 
        distractions: { randomStop: true, stopChance: 0.06, bandFlicker: true, shake: true, shakeFrequency: 2500 },
        name: "Kalite Kontrol Tanrısı",
        description: "Efsanevi son seviye! Hiç kimse burayı geçemez!",
        supervisor: "CEO",
        dialogue: "Seni bir tanrı yaptı! Bu seviyeyi geçersen, senin adına yeni bir fabrika açacağım!"
    }
];

// Yardımcı fonksiyonlar
const ConfigUtils = {
    getLevelConfig: (level) => {
        if (level >= LevelConfig.length) {
            // Sonsuz mod için son seviyeyi tekrarla ama zorlaştır
            const lastLevel = LevelConfig[LevelConfig.length - 1];
            const multiplier = Math.floor(level / LevelConfig.length) + 1;
            return {
                ...lastLevel,
                speed: lastLevel.speed * multiplier,
                faultyChance: Math.min(0.8, lastLevel.faultyChance * multiplier),
                spawnRate: Math.max(300, lastLevel.spawnRate / multiplier),
                name: `Sonsuz Mod - Seviye ${level + 1}`,
                description: `Zorluk çarpanı: x${multiplier}`
            };
        }
        return LevelConfig[level];
    },
    
    getRandomFaultType: (useLight = false) => {
        if (useLight) {
            const lightFaults = GameConfig.faultTypes.lightRequired;
            return lightFaults[Math.floor(Math.random() * lightFaults.length)];
        } else {
            const visibleFaults = GameConfig.faultTypes.visible;
            return visibleFaults[Math.floor(Math.random() * visibleFaults.length)];
        }
    }
};
