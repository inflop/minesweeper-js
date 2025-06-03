export class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.body = document.body;
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setInitialTheme();
  }

  setupThemeToggle() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => this.toggleTheme());
    }
  }

  setInitialTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      this.body.classList.add("theme-light");
    } else if (theme === "dark") {
      this.body.classList.add("theme-dark");
    }
  }

  toggleTheme() {
    if (this.body.classList.contains("theme-light")) {
      this.body.classList.remove("theme-light");
      this.body.classList.add("theme-dark");
      localStorage.setItem("theme", "dark");
    } else if (this.body.classList.contains("theme-dark")) {
      this.body.classList.remove("theme-dark");
      this.body.classList.add("theme-light");
      localStorage.setItem("theme", "light");
    } else {
      // If no class, check system preference and switch to opposite
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      if (prefersLight) {
        this.body.classList.add("theme-dark");
        localStorage.setItem("theme", "dark");
      } else {
        this.body.classList.add("theme-light");
        localStorage.setItem("theme", "light");
      }
    }
  }
}
