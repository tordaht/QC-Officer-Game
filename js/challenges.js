// CHALLENGE MANAGER - daily/weekly tasks
class ChallengeManager {
    constructor() {
        this.seed = new Date().toISOString().slice(0,10);
        this.challenges = this.generateDaily(this.seed);
        this.progress = JSON.parse(localStorage.getItem('qc_challenges') || '{}');
    }
    generateDaily(seed) {
        // simple static set for first iteration
        return [
            { id: 'find_3_micro', text: 'Find 3 micro-cracks under control light', target: 3 },
            { id: 'zone_10', text: 'Inspect 10 bottles in control zone', target: 10 },
            { id: 'combo_5', text: 'Reach 5x combo', target: 1 }
        ];
    }
    addProgress(id, amount = 1) {
        this.progress[id] = (this.progress[id] || 0) + amount;
        localStorage.setItem('qc_challenges', JSON.stringify(this.progress));
        document.dispatchEvent(new CustomEvent('challengeProgress', { detail: { id, value: this.progress[id] } }));
    }
    getStatus(id) {
        const ch = this.challenges.find(c => c.id === id);
        const cur = this.progress[id] || 0;
        return { current: cur, target: ch?.target || 0 };
    }
}

window.ChallengeManager = new ChallengeManager();


