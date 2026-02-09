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

-- Вставка курсов (7 курсов)
INSERT INTO courses (title, description, level, duration, price, url, image_url, category_id) VALUES
    -- Детские курсы (категория 1)
    ('Scratch: создай свою первую игру', 'Основы программирования через создание игр в визуальной среде Scratch', 'начальный', '2 месяца', 12900, 'scratch-for-kids', 'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=800&auto=format&fit=crop', 1),
    ('Майнкрафт: программирование на Python', 'Изучение основ Python через модификацию игры Майнкрафт', 'начальный', '3 месяца', 16900, 'minecraft-python', 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w-800&auto=format&fit=crop', 1),
    
    -- Курсы для подростков (категория 2)
    ('Веб-разработка на HTML/CSS/JavaScript', 'Создание современных веб-сайтов с нуля', 'начальный', '4 месяца', 21900, 'web-development-teen', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w-800&auto=format&fit=crop', 2),
    ('Разработка игр на Unity', 'Создание 2D и 3D игр на движке Unity с C#', 'средний', '5 месяцев', 27900, 'unity-game-dev', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w-800&auto=format&fit=crop', 2),
    
    -- Курсы для взрослых (категория 3)
    ('JavaScript с нуля до PRO', 'Полный курс JavaScript от основ до продвинутых тем', 'начальный', '6 месяцев', 29900, 'javascript-pro', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w-800&auto=format&fit=crop', 3),
    ('React + Next.js: современный фронтенд', 'Разработка SPA приложений на React с серверным рендерингом', 'средний', '4 месяца', 34900, 'react-nextjs', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w-800&auto=format&fit=crop', 3),
    ('Python для Data Science и ML', 'Анализ данных, машинное обучение и нейросети на Python', 'продвинутый', '8 месяцев', 49900, 'python-data-science-ml', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w-800&auto=format&fit=crop', 3)
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
    ('Знание английского для чтения документации', 7)
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
    ('Работа с Big Data', 'продвинутый', 7)
ON CONFLICT DO NOTHING;