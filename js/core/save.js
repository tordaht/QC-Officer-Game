class SaveService {
  constructor(key = 'qc_save_v1') {
    this.key = key;
    this.version = 1;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== this.version) {
        return this.migrate(data);
      }
      return data;
    } catch (err) {
      console.warn('SaveService load failed', err);
      return null;
    }
  }

  save(state) {
    try {
      const payload = { ...state, version: this.version };
      localStorage.setItem(this.key, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.warn('SaveService save failed', err);
      return false;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
    } catch (err) {
      console.warn('SaveService clear failed', err);
    }
  }

  migrate(/* oldData */) {
    // stub for future schema migrations
    return { version: this.version };
  }
}

window.saveService = new SaveService();
