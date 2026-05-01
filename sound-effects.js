class SoundEffects {
  constructor() {
    const savedSoundEnabled = localStorage.getItem("soundEnabled");
    this.soundsOn = savedSoundEnabled !== "false";
    this.replayMode = false;
    this.audioCache = new Map();
    this.lastSoundTime = 0;
    this.soundCooldown = 100;
    this.bootUpSoundSystem();
  }

  bootUpSoundSystem() {
    this.loadSoundFiles();
  }

  loadSoundFiles() {
    const soundFiles = {
      drop: "sound-effects/drop.mp3",
      win: "sound-effects/win.mp3",
      reset: "sound-effects/reset.mp3",
      draw: "sound-effects/draw.mp3",
      hover: "sound-effects/hover.mp3",
      click: "sound-effects/click.mp3",
      error: "sound-effects/error.mp3",
      undo: "sound-effects/undo.mp3",
    };

    Object.entries(soundFiles).forEach(([name, path]) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.volume = 0.5;

      audio.addEventListener("error", () => {});

      this.audioCache.set(name, audio);
    });
  }

  playSound(soundName) {
    if (!this.soundsOn || this.replayMode) return;

    const now = Date.now();
    if (now - this.lastSoundTime < this.soundCooldown) return;
    this.lastSoundTime = now;

    const audio = this.audioCache.get(soundName);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => {});
    }
  }

  playDropSound() {
    this.playSound("drop");
  }

  playWinSong() {
    this.playSound("win");
  }

  playResetSound() {
    this.playSound("reset");
  }

  playDrawSound() {
    this.playSound("draw");
  }

  playHoverSound() {
    this.playSound("hover");
  }

  playClickSound() {
    this.playSound("click");
  }

  playErrorSound() {
    this.playSound("error");
  }

  playUndoSound() {
    this.playSound("undo");
  }

  turnSoundsOn(enabled) {
    this.soundsOn = enabled;
  }

  setVolume(level) {
    this.audioCache.forEach((audio) => {
      audio.volume = Math.max(0, Math.min(1, level));
    });
  }

  setReplayMode(enabled) {
    this.replayMode = enabled;
  }
}
