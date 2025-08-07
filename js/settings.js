// SETTINGS MANAGER - v1 (sound, graphics, accessibility, language proxy)
class SettingsManager {
    constructor() {
        this.defaults = {
            sound: { master: 1, effects: 1 },
            graphics: { videoBackground: true, quality: 'high' },
            accessibility: { colorFilter: 'none' },
            language: localStorage.getItem('gameLanguage') || 'en'
        };
        this.state = JSON.parse(localStorage.getItem('qc_settings') || 'null') || this.defaults;
        this.persist();
    }

    set(path, value) {
        const parts = path.split('.');
        let ref = this.state;
        for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
        ref[parts[parts.length - 1]] = value;
        this.persist();
        if (path === 'language') {
            window.LanguageManager.setLanguage(value);
        }
        document.dispatchEvent(new CustomEvent('settingsChanged', { detail: { path, value } }));
    }

    get(path) {
        const parts = path.split('.');
        let ref = this.state;
        for (const p of parts) ref = ref?.[p];
        return ref;
    }

    persist() {
        localStorage.setItem('qc_settings', JSON.stringify(this.state));
    }
}

window.SettingsManager = new SettingsManager();


