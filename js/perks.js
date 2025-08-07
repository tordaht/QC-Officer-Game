// PERK MANAGER - temporary boosts
class PerkManager {
    constructor() {
        this.active = {};
    }
    activate(perkId, durationMs) {
        const until = performance.now() + durationMs;
        this.active[perkId] = until;
        setTimeout(() => {
            if (this.active[perkId] && performance.now() >= until) delete this.active[perkId];
        }, durationMs + 50);
        document.dispatchEvent(new CustomEvent('perkChanged', { detail: { perkId, active: true } }));
    }
    isActive(perkId) {
        return !!this.active[perkId] && performance.now() < this.active[perkId];
    }
}

window.PerkManager = new PerkManager();


