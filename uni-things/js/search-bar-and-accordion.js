// ==========================================================
// === ФУНКЦИОНАЛ АККОРДЕОНА + АДАПТИРОВАННЫЙ ПОИСК (JS) ===
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("page-search-form");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const resultsCount = document.getElementById("search-results-count");
    const contentToSearch = document.getElementById("faq-container"); // !!! Ищем только в контейнере FAQ

    const accordionItems = document.querySelectorAll(".accordion-item");

    let allMatches = [];
    let currentMatchIndex = -1;
    let lastSearchTerm = "";

    // --- 1. ФУНКЦИОНАЛ АККОРДЕОНА ---
    function toggleAccordion(item) {
        const isActive = item.classList.contains("active");
        const answerContent = item.querySelector(".answer-content");

        // Закрываем все, кроме текущего
        accordionItems.forEach((i) => {
            i.classList.remove("active");
            i.querySelector(".answer-content").classList.remove("show");
        });

        // Если элемент не был активным, открываем его
        if (!isActive) {
            item.classList.add("active");
            answerContent.classList.add("show");
        }
    }

    // Добавляем обработчики кликов на заголовки
    accordionItems.forEach((item) => {
        const header = item.querySelector(".question-header");
        header.addEventListener("click", () => {
            toggleAccordion(item);
        });
    });

    // --- 2. ФУНКЦИИ ПОИСКА ---

    function clearHighlights() {
        if (allMatches.length === 0 && lastSearchTerm === "") {
            const existingHighlights = contentToSearch.querySelectorAll(
                ".highlight, .current-highlight"
            );
            if (existingHighlights.length === 0) return;
        }

        contentToSearch.querySelectorAll(".highlight").forEach((span) => {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
        });

        allMatches = [];
        currentMatchIndex = -1;
        lastSearchTerm = "";
        resultsCount.textContent = "";
        searchButton.textContent = "Искать";

        // Дополнительно: Закрываем все аккордеоны при очистке
        accordionItems.forEach((i) => {
            i.classList.remove("active");
            i.querySelector(".answer-content").classList.remove("show");
        });
    }

    function highlightAndStoreMatches(searchTerm) {
        // ... (Ваша функция подсветки)
        const escapedTerm = searchTerm.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&"
        );
        const searchRegex = new RegExp(`(${escapedTerm})`, "gi");

        function findAndReplace(element) {
            const excludeTags = [
                "SCRIPT",
                "STYLE",
                "INPUT",
                "TEXTAREA",
                "BUTTON",
                "SELECT",
                "A",
                "NOSCRIPT",
                "IFRAME",
            ];
            if (
                excludeTags.includes(element.tagName) ||
                element.classList.contains("search-bar-container")
            ) {
                return;
            }

            element.childNodes.forEach((node) => {
                if (node.nodeType === 3) {
                    // 3 = TEXT_NODE
                    const text = node.nodeValue;
                    if (searchRegex.test(text)) {
                        const newHtml = text.replace(searchRegex, (match) => {
                            return `<span class="highlight">${match}</span>`;
                        });

                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = newHtml;

                        const parent = node.parentNode;
                        while (tempDiv.firstChild) {
                            parent.insertBefore(tempDiv.firstChild, node);
                        }
                        parent.removeChild(node);
                    }
                } else if (node.nodeType === 1) {
                    // 1 = ELEMENT_NODE
                    findAndReplace(node);
                }
            });
        }

        findAndReplace(contentToSearch);
        lastSearchTerm = searchTerm;
        allMatches = Array.from(contentToSearch.querySelectorAll(".highlight"));
        return allMatches.length;
    }

    function navigateToNextMatch() {
        if (allMatches.length === 0) return;

        // 1. Убираем класс .current-highlight с предыдущего элемента
        if (currentMatchIndex >= 0) {
            allMatches[currentMatchIndex].classList.remove("current-highlight");
        }

        // 2. Вычисляем индекс следующего элемента с учетом циклического перехода
        currentMatchIndex = (currentMatchIndex + 1) % allMatches.length;
        const currentMatch = allMatches[currentMatchIndex];

        // 3. Добавляем класс .current-highlight к новому элементу
        currentMatch.classList.add("current-highlight");

        // --- НОВАЯ ЛОГИКА ДЛЯ АККОРДЕОНА ---
        // Находим родительский элемент .accordion-item
        let parentAccordionItem = currentMatch.closest(".accordion-item");
        if (parentAccordionItem) {
            // Закрываем все остальные, чтобы было как в обычном аккордеоне
            accordionItems.forEach((i) => {
                if (i !== parentAccordionItem) {
                    i.classList.remove("active");
                    i.querySelector(".answer-content").classList.remove("show");
                }
            });

            // Раскрываем родительский элемент, если он еще не раскрыт
            if (!parentAccordionItem.classList.contains("active")) {
                parentAccordionItem.classList.add("active");
                parentAccordionItem
                    .querySelector(".answer-content")
                    .classList.add("show");
            }
        }

        // 4. Прокручиваем страницу к текущему элементу
        currentMatch.scrollIntoView({ behavior: "smooth", block: "center" });

        // 5. Обновляем счетчик
        resultsCount.textContent = `Найдено: ${allMatches.length} (${
            currentMatchIndex + 1
        } из ${allMatches.length})`;
    }

    // --- 3. ОБРАБОТЧИК ФОРМЫ (Оставлен прежним, но вызывает navigateToNextMatch) ---
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();

        if (!searchTerm || searchTerm.length < 2) {
            clearHighlights();
            resultsCount.textContent = "Введите минимум 2 символа.";
            return;
        }

        if (searchTerm !== lastSearchTerm) {
            clearHighlights();
            const count = highlightAndStoreMatches(searchTerm);

            if (count > 0) {
                searchButton.textContent = "Следующий (Next)";
                navigateToNextMatch();
            } else {
                searchButton.textContent = "Искать";
                resultsCount.textContent = "Совпадений не найдено.";
            }
        } else {
            navigateToNextMatch();
        }
    });

    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() !== lastSearchTerm) {
            clearHighlights();
        }
    });
});
