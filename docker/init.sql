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

-- Вставка тестовых данных
INSERT INTO categories (name, age_range) VALUES
    ('Веб-разработка', '16+'),
    ('Мобильная разработка', '18+'),
    ('Data Science', '20+')
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, level, duration, price, url, category_id) VALUES
    ('JavaScript с нуля', 'Основы JavaScript для начинающих', 'начальный', '2 месяца', 19900, 'javascript-basics', 1),
    ('React для профессионалов', 'Продвинутый курс по React', 'продвинутый', '3 месяца', 34900, 'react-advanced', 1),
    ('Python для анализа данных', 'Data Science с использованием Python', 'средний', '4 месяца', 29900, 'python-data-science', 3)
ON CONFLICT (url) DO NOTHING;

INSERT INTO requirements (text, course_id) VALUES
    ('Базовые знания HTML/CSS', 1),
    ('Опыт программирования на JavaScript', 2),
    ('Базовые знания математики', 3)
ON CONFLICT DO NOTHING;

INSERT INTO outcomes (skill, level, course_id) VALUES
    ('Понимание основ JavaScript', 'начальный', 1),
    ('Разработка SPA приложений', 'продвинутый', 2),
    ('Анализ данных с помощью pandas', 'средний', 3)
ON CONFLICT DO NOTHING;