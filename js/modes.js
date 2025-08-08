// GAME MODES - Arcade / Story / TimeAttack
const ModeConfig = {
    Story: {
        id: 'story',
        name: 'Story',
        // LevelConfig GameConfig içinde değil, global LevelConfig kullan
        timer: (level) => (typeof LevelConfig !== 'undefined' && LevelConfig[level]?.duration) || 60,
        endless: false,
        scoring: { controlZoneBonus: 1.2, earlyClickPenalty: 0.8 }
    },
    Arcade: {
        id: 'arcade',
        name: 'Arcade',
        timer: () => Infinity,
        endless: true,
        scoring: { controlZoneBonus: 1.3, earlyClickPenalty: 0.7 }
    },
    TimeAttack: {
        id: 'time',
        name: 'Time Attack',
        timer: () => 180,
        endless: false,
        scoring: { controlZoneBonus: 1.4, earlyClickPenalty: 0.6 }
    }
};

class GameModeManager {
    constructor() {
        this.current = localStorage.getItem('qc_mode') || 'story';
    }
    setMode(id) {
        this.current = id;
        localStorage.setItem('qc_mode', id);
        document.dispatchEvent(new CustomEvent('modeChanged', { detail: { id } }));
    }
    getConfig() {
        return ModeConfig[this.current.charAt(0).toUpperCase() + this.current.slice(1)] || ModeConfig.Story;
    }
}

window.GameModeManager = new GameModeManager();


