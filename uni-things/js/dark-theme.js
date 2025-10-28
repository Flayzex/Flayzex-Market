const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");
const storageKey = "user-theme";
const darkThemeClass = "dark-theme";

/**
 * Устанавливает класс темы и обновляет иконку/текст кнопки.
 * @param {string} theme - 'dark' или 'light'
 */
function applyTheme(theme) {
    if (theme === "dark") {
        body.classList.add(darkThemeClass);
        themeIcon.textContent = "🌙";
        themeText.textContent = "Светлая тема";
        localStorage.setItem(storageKey, "dark");
    } else {
        body.classList.remove(darkThemeClass);
        themeIcon.textContent = "☀️";
        themeText.textContent = "Тёмная тема";
        localStorage.setItem(storageKey, "light");
    }
}

// 1. ПРИМЕНЕНИЕ ТЕМЫ ПРИ ЗАГРУЗКЕ
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        // Проверка системных настроек пользователя
        applyTheme("dark");
    } else {
        applyTheme("light"); // Тема по умолчанию
    }
});

// 2. ОБРАБОТЧИК КЛИКА ПО КНОПКЕ
themeToggle.addEventListener("click", () => {
    const currentTheme = body.classList.contains(darkThemeClass)
        ? "dark"
        : "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
});
