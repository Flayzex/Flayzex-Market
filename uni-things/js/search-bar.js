document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('page-search-form');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsCount = document.getElementById('search-results-count');

    // !!! ЭТА СТРОКА ВКЛЮЧАЕТ В ПОИСК ВСЕ ВОПРОСЫ, ОТВЕТЫ И ПРОЧИЙ КОНТЕНТ НА СТРАНИЦЕ
    const contentToSearch = document.body;

    // Переменные для отслеживания состояния поиска
    let allMatches = [];
    let currentMatchIndex = -1;
    let lastSearchTerm = '';

    // -------------------
    // ФУНКЦИЯ ОЧИСТКИ (удаляет всю подсветку)
    // -------------------
    function clearHighlights() {
        if (allMatches.length === 0 && lastSearchTerm === '') {
            const existingHighlights = contentToSearch.querySelectorAll('.highlight, .current-highlight');
            if (existingHighlights.length === 0) return;
        }

        contentToSearch.querySelectorAll('.highlight').forEach(span => {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
        });

        allMatches = [];
        currentMatchIndex = -1;
        lastSearchTerm = '';
        resultsCount.textContent = '';
        searchButton.textContent = 'Искать';
    }

    // -------------------
    // ФУНКЦИЯ ПОИСКА и ПОДСВЕТКИ (выполняется только при новом запросе)
    // -------------------
    function highlightAndStoreMatches(searchTerm) {
        const escapedTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const searchRegex = new RegExp(`(${escapedTerm})`, 'gi');

        // Рекурсивная функция для безопасного обхода только текстовых узлов
        function findAndReplace(element) {
            // Исключаем теги, которые не содержат пользовательский текст или могут сломать функционал
            const excludeTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A', 'NOSCRIPT', 'IFRAME'];
            if (excludeTags.includes(element.tagName)) {
                return;
            }

            element.childNodes.forEach(node => {
                if (node.nodeType === 3) { // 3 = TEXT_NODE (текстовый узел)
                    const text = node.nodeValue;
                    if (searchRegex.test(text)) {

                        // Создаем новый HTML с подсвеченными тегами
                        const newHtml = text.replace(searchRegex, (match) => {
                            return `<span class="highlight">${match}</span>`;
                        });

                        // Создаем временный div для преобразования HTML в DOM-узлы
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newHtml;

                        const parent = node.parentNode;
                        while (tempDiv.firstChild) {
                            parent.insertBefore(tempDiv.firstChild, node);
                        }
                        parent.removeChild(node); // Удаляем старый текстовый узел
                    }
                } else if (node.nodeType === 1) { // 1 = ELEMENT_NODE (элемент-тег)
                    findAndReplace(node); // Рекурсивный вызов для дочерних элементов
                }
            });
        }

        findAndReplace(contentToSearch);
        lastSearchTerm = searchTerm;

        // Сохраняем все найденные элементы в массив для навигации
        allMatches = Array.from(contentToSearch.querySelectorAll('.highlight'));
        return allMatches.length;
    }

    // -------------------
    // ФУНКЦИЯ НАВИГАЦИИ (переход к следующему результату)
    // -------------------
    function navigateToNextMatch() {
        if (allMatches.length === 0) return;

        // 1. Убираем класс .current-highlight с предыдущего элемента
        if (currentMatchIndex >= 0) {
            allMatches[currentMatchIndex].classList.remove('current-highlight');
        }

        // 2. Вычисляем индекс следующего элемента с учетом циклического перехода
        currentMatchIndex = (currentMatchIndex + 1) % allMatches.length;

        const currentMatch = allMatches[currentMatchIndex];

        // 3. Добавляем класс .current-highlight к новому элементу
        currentMatch.classList.add('current-highlight');

        // 4. Прокручиваем страницу к текущему элементу
        currentMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 5. Обновляем счетчик
        resultsCount.textContent = `Найдено: ${allMatches.length} (${currentMatchIndex + 1} из ${allMatches.length})`;
    }


    // -------------------
    // ОБРАБОТЧИК ФОРМЫ
    // -------------------
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();

        if (!searchTerm || searchTerm.length < 2) {
            clearHighlights();
            resultsCount.textContent = 'Введите минимум 2 символа.';
            return;
        }

        // 1. Проверяем, новый ли это поисковый запрос
        if (searchTerm !== lastSearchTerm) {
            clearHighlights();
            const count = highlightAndStoreMatches(searchTerm);

            if (count > 0) {
                // Первый поиск успешен, переходим к первому результату
                searchButton.textContent = 'Следующий (Next)';
                navigateToNextMatch();
            } else {
                // Результатов нет
                searchButton.textContent = 'Искать';
                resultsCount.textContent = 'Совпадений не найдено.';
            }
        } else {
            // 2. Если запрос тот же, просто переходим к следующему результату
            navigateToNextMatch();
        }
    });

    // Обработчик для очистки при изменении ввода
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() !== lastSearchTerm) {
            clearHighlights();
        }
    });
});