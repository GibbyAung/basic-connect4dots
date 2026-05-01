class ThemeManager {
  constructor() {
    this.themeToggle = null;
    this.themeIcon = null;
    this.themeText = null;
    this.init();
  }

  init() {
    this.setupThemeElements();
    this.loadSavedTheme();
    this.setupEventListeners();
  }

  setupThemeElements() {
    this.themeToggle = document.getElementById("theme-toggle");
    if (!this.themeToggle) return;

    this.themeIcon = this.themeToggle.querySelector(".theme-icon");
    this.themeText = this.themeToggle.querySelector(".theme-text");
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    this.setTheme(savedTheme);
    this.updateThemeButton(savedTheme);
  }

  setupEventListeners() {
    if (!this.themeToggle) return;

    this.themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    this.setTheme(newTheme);
    this.saveTheme(newTheme);
    this.updateThemeButton(newTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  updateThemeButton(theme) {
    if (!this.themeIcon || !this.themeText) return;

    if (theme === "dark") {
      this.themeIcon.textContent = "🌙";
      this.themeText.textContent = "Dark";
    } else {
      this.themeIcon.textContent = "☀️";
      this.themeText.textContent = "Light";
    }
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.themeManager = new ThemeManager();
});
