-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age_range VARCHAR(50) NOT NULL
);

-- Создание таблицы курсов
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('начальный', 'средний', 'продвинутый')),
    duration VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    url VARCHAR(200) NOT NULL UNIQUE,
    image_url VARCHAR(500), -- ← НОВОЕ ПОЛЕ для URL картинки
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

-- Создание таблицы требований
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

-- Создание таблицы результатов
CREATE TABLE IF NOT EXISTS outcomes (
    id SERIAL PRIMARY KEY,
    skill VARCHAR(200) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('начальный', 'средний', 'продвинутый')),
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

-- Создание индексов для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_requirements_course ON requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_course ON outcomes(course_id);

-- Вставка категорий
INSERT INTO categories (name, age_range) VALUES
    ('Для детей', '7-12'),
    ('Для подростков', '13-18'),
    ('Для взрослых', '18+')
ON CONFLICT DO NOTHING;

-- Вставка курсов
INSERT INTO courses (title, description, level, duration, price, url, image_url, category_id) VALUES
    -- Детские курсы (категория 1)
    ('Scratch: создай свою первую игру', 'Основы программирования через создание игр в визуальной среде Scratch', 'начальный', '2 месяца', 12900, 'scratch-for-kids', 'https://storage.yandexcloud.net/backet-online-storage/courses/scratch.jpg', 1),
    ('Майнкрафт: программирование на Python', 'Изучение основ Python через модификацию игры Майнкрафт', 'начальный', '3 месяца', 16900, 'minecraft-python', 'https://storage.yandexcloud.net/backet-online-storage/courses/minecrafte.jpg', 1),
    
    -- Курсы для подростков (категория 2)
    ('Веб-разработка на HTML/CSS/JavaScript', 'Создание современных веб-сайтов с нуля', 'начальный', '4 месяца', 21900, 'web-development-teen', 'https://storage.yandexcloud.net/backet-online-storage/courses/js.jpg', 2),
    ('Разработка игр на Unity', 'Создание 2D и 3D игр на движке Unity с C#', 'средний', '5 месяцев', 27900, 'unity-game-dev', 'https://storage.yandexcloud.net/backet-online-storage/courses/phat-trien-game-unity.jpg', 2),
    
    -- Курсы для взрослых (категория 3)
    ('JavaScript с нуля до PRO', 'Полный курс JavaScript от основ до продвинутых тем', 'начальный', '6 месяцев', 29900, 'javascript-pro', 'https://storage.yandexcloud.net/backet-online-storage/courses/maxresdefault.jpg', 3),

    ('React + Next.js: современный фронтенд', 'Разработка SPA приложений на React с серверным рендерингом', 'средний', '4 месяца', 34900, 'react-nextjs', 'https://storage.yandexcloud.net/backet-online-storage/courses/social-2.jpeg', 3),

    ('Python для Data Science и ML', 'Анализ данных, машинное обучение и нейросети на Python', 'продвинутый', '8 месяцев', 49900, 'python-data-science-ml', 'https://storage.yandexcloud.net/backet-online-storage/courses/pitonds.jpg', 3),

    ('Основы Python для начинающих', 'Полный курс Python с нуля: синтаксис, структуры данных, функции и основы ООП', 'начальный', '3 месяца', 18900, 'python-basics', 'https://storage.yandexcloud.net/backet-online-storage/courses/pitonds.jpg', 3),
    
    ('Frontend-разработка с нуля', 'HTML, CSS, JavaScript и современные инструменты для создания веб-интерфейсов', 'начальный', '4 месяца', 23900, 'frontend-zero', 'https://storage.yandexcloud.net/backet-online-storage/courses/frontbg.jpg', 3),
    
    ('Backend-разработка на Node.js', 'Создание серверной части приложений с использованием Node.js, Express и баз данных', 'средний', '5 месяцев', 28900, 'nodejs-backend', 'https://storage.yandexcloud.net/backet-online-storage/courses/node.jpg', 3),
    
    ('Базы данных: SQL и NoSQL', 'Работа с реляционными и нереляционными базами данных, проектирование схем, оптимизация запросов', 'средний', '2 месяца', 16900, 'databases-sql-nosql', 'https://storage.yandexcloud.net/backet-online-storage/courses/db.jpeg', 3),
    
    ('Мобильная разработка на Flutter', 'Создание кроссплатформенных мобильных приложений для iOS и Android с использованием Dart и Flutter', 'средний', '6 месяцев', 32900, 'flutter-mobile', 'https://storage.yandexcloud.net/backet-online-storage/courses/mob.jpg', 3)
ON CONFLICT (url) DO NOTHING;

-- Вставка требований для курсов
INSERT INTO requirements (text, course_id) VALUES
    -- Scratch
    ('Умение пользоваться компьютером', 1),
    ('Базовые знания математики', 1),
    
    -- Майнкрафт + Python
    ('Опыт игры в Майнкрафт', 2),
    ('Интерес к программированию', 2),
    
    -- Веб-разработка для подростков
    ('Знание английского языка на базовом уровне', 3),
    ('Умение работать с файлами и папками', 3),
    
    -- Unity Game Dev
    ('Базовые знания программирования', 4),
    ('Знание математики на уровне 8-9 класса', 4),
    
    -- JavaScript PRO
    ('Базовые знания HTML/CSS', 5),
    ('Логическое мышление', 5),
    
    -- React + Next.js
    ('Опыт программирования на JavaScript', 6),
    ('Знание Git и командной строки', 6),
    
    -- Python Data Science
    ('Знание математики (статистика, алгебра)', 7),
    ('Опыт программирования на любом языке', 7),
    ('Знание английского для чтения документации', 7),

    -- Python Basics (id = 8)
    ('Базовые знания компьютера', 8),
    ('Логическое мышление', 8),
    ('Навыки работы с файловой системой', 8),
    
    -- Frontend Zero (id = 9)
    ('Умение пользоваться браузером', 9),
    ('Базовые знания английского', 9),
    ('Внимательность к деталям', 9),
    
    -- Node.js Backend (id = 10)
    ('Знание JavaScript на базовом уровне', 10),
    ('Опыт работы с командной строкой', 10),
    ('Понимание HTTP протокола', 10),
    
    -- Databases SQL/NoSQL (id = 11)
    ('Базовые знания программирования', 11),
    ('Понимание структуры данных', 11),
    ('Логическое мышление', 11),
    
    -- Flutter Mobile (id = 12)
    ('Знание любого языка программирования', 12),
    ('Опыт работы с ООП', 12),
    ('Знание английского для чтения документации', 12)
ON CONFLICT DO NOTHING;

-- Вставка результатов (скиллов) для курсов
INSERT INTO outcomes (skill, level, course_id) VALUES
    -- Scratch
    ('Создание игр в Scratch', 'начальный', 1),
    ('Понимание алгоритмов', 'начальный', 1),
    ('Работа с координатами', 'начальный', 1),
    
    -- Майнкрафт + Python
    ('Основы Python', 'начальный', 2),
    ('Создание модов для Майнкрафт', 'начальный', 2),
    ('Работа с API игры', 'начальный', 2),
    
    -- Веб-разработка для подростков
    ('HTML5 и семантическая верстка', 'начальный', 3),
    ('CSS3 и Flexbox/Grid', 'начальный', 3),
    ('Базовый JavaScript', 'начальный', 3),
    ('Адаптивная верстка', 'начальный', 3),
    
    -- Unity Game Dev
    ('Разработка 2D игр на Unity', 'средний', 4),
    ('Программирование на C#', 'средний', 4),
    ('Работа с физикой и коллизиями', 'средний', 4),
    ('Создание игровой логики', 'средний', 4),
    
    -- JavaScript PRO
    ('ES6+ синтаксис', 'начальный', 5),
    ('Асинхронное программирование', 'средний', 5),
    ('Работа с DOM', 'начальный', 5),
    ('ООП в JavaScript', 'средний', 5),
    ('Тестирование кода', 'средний', 5),
    
    -- React + Next.js
    ('Разработка на React', 'средний', 6),
    ('Серверный рендеринг Next.js', 'средний', 6),
    ('State management (Redux/Zustand)', 'средний', 6),
    ('Работа с API', 'средний', 6),
    ('Оптимизация производительности', 'продвинутый', 6),
    
    -- Python Data Science
    ('Анализ данных с pandas', 'средний', 7),
    ('Визуализация данных (matplotlib, seaborn)', 'средний', 7),
    ('Машинное обучение (scikit-learn)', 'продвинутый', 7),
    ('Нейросети с TensorFlow/PyTorch', 'продвинутый', 7),
    ('Работа с Big Data', 'продвинутый', 7),

    -- Python Basics (id = 8)
    ('Синтаксис Python 3', 'начальный', 8),
    ('Работа с базовыми структурами данных', 'начальный', 8),
    ('Функции и модули', 'начальный', 8),
    ('Основы ООП в Python', 'начальный', 8),
    ('Работа с файлами', 'начальный', 8),
    ('Обработка исключений', 'начальный', 8),
    
    -- Frontend Zero (id = 9)
    ('HTML5 и семантическая верстка', 'начальный', 9),
    ('CSS3 с Flexbox и Grid', 'начальный', 9),
    ('Базовый JavaScript (ES6+)', 'начальный', 9),
    ('Адаптивная и кроссбраузерная верстка', 'начальный', 9),
    ('Работа с Git', 'начальный', 9),
    ('Основы доступности (a11y)', 'начальный', 9),
    
    -- Node.js Backend (id = 10)
    ('Создание REST API на Express.js', 'средний', 10),
    ('Работа с базами данных (MongoDB/PostgreSQL)', 'средний', 10),
    ('Аутентификация и авторизация', 'средний', 10),
    ('Тестирование backend приложений', 'средний', 10),
    ('Работа с WebSocket', 'средний', 10),
    ('Деплой приложений на сервер', 'средний', 10),
    
    -- Databases SQL/NoSQL (id = 11)
    ('SQL: SELECT, JOIN, агрегатные функции', 'средний', 11),
    ('Проектирование схем баз данных', 'средний', 11),
    ('Оптимизация SQL запросов', 'средний', 11),
    ('Работа с MongoDB (NoSQL)', 'средний', 11),
    ('Транзакции и ACID', 'средний', 11),
    ('Индексы и их оптимизация', 'средний', 11),
    
    -- Flutter Mobile (id = 12)
    ('Разработка UI на Flutter', 'средний', 12),
    ('State management (Provider/Riverpod)', 'средний', 12),
    ('Работа с API в мобильных приложениях', 'средний', 12),
    ('Навигация между экранами', 'средний', 12),
    ('Работа с локальными данными (SQLite)', 'средний', 12),
    ('Публикация в App Store и Google Play', 'средний', 12)
ON CONFLICT DO NOTHING;