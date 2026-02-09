import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { coursesRepository } from '@/lib/db/repository';
import type { Course } from '@/lib/db/repository'; // Импортируем тип

const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID!;
const YANDEX_API_KEY = process.env.YANDEX_API_KEY!;
const MODEL = "yandexgpt/latest";

const yandexGPTClient = new OpenAI({
  apiKey: YANDEX_API_KEY,
  baseURL: "https://ai.api.cloud.yandex.net/v1",
  defaultHeaders: {
    "OpenAI-Project": YANDEX_FOLDER_ID,
  },
});

// Тип для анализа (можно вынести в отдельный файл)
interface GPTAnalysis {
  age?: number;
  level?: 'начальный' | 'средний' | 'продвинутый';
  keywords: string[];
  category?: 'дети' | 'подростки' | 'взрослые';
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // 1. Анализируем запрос через GPT
    const analysis = await analyzeQueryWithGPT(message);
    
    // 2. Ищем курсы в БД (теперь получаем объект)
    const searchResult = await coursesRepository.findCoursesByGPTAnalysis(analysis);
    
    // 3. Генерируем ответ
    const response = await generateAlexResponse(
      message, 
      searchResult.analysis, 
      searchResult.courses
    );
    
    return NextResponse.json({
      success: true,
      response: response,
      analysis: searchResult.analysis,
      coursesFound: searchResult.courses.length,
      courses: searchResult.courses.map(course => ({
        id: course.id,
        title: course.title,
        url: course.url,
        link: `/courses/${course.url}`
      }))
    });
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json({
      success: false,
      response: "Извините, произошла ошибка. Попробуйте еще раз."
    });
  }
}

// Функция анализа через GPT
async function analyzeQueryWithGPT(query: string): Promise<GPTAnalysis> {
  try {
    const response = await yandexGPTClient.chat.completions.create({
      model: `gpt://${YANDEX_FOLDER_ID}/${MODEL}`,
      messages: [
        {
          role: 'system',
          content: `Ты анализируешь запросы о курсах программирования.
                    Извлекай информацию в строгом JSON формате.
ПРАВИЛА:
1. Возраст: если упоминается "лет", "возраст", "мне N" - извлеки число
2. Уровень: 
   - "с нуля", "начинаю", "новичок" → "начальный"
   - "уже знаю", "опыт", "средний" → "средний"
   - "продвинутый", "профессионал" → "продвинутый"
3. Ключевые слова: javascript, python, react, игры, сайты, данные, веб, мобильные, C#, Java, программирование
4. Категория:
   - до 12 лет → "дети"
   - 13-18 лет → "подростки"
   - старше 18 → "взрослые"

Пример ответа:
{
  "age": 14,
  "level": "начальный",
  "keywords": ["игры", "программирование"],
  "category": "подростки"
}

Запрос: "${query}"`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return { keywords: [], age: undefined, level: undefined, category: undefined };
    }
    
    try {
      const parsed = JSON.parse(content);
      return {
        age: parsed.age || undefined,
        level: parsed.level || undefined,
        keywords: parsed.keywords || [],
        category: parsed.category || undefined
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { keywords: [], age: undefined, level: undefined, category: undefined };
    }
    
  } catch (error) {
    console.error('GPT Analysis error:', error);
    
    // Простой fallback анализ
    return simpleQueryAnalysis(query);
  }
}

// Простой анализ запроса (fallback)
function simpleQueryAnalysis(query: string): GPTAnalysis {
  const queryLower = query.toLowerCase();
  const analysis: GPTAnalysis = { keywords: [] };
  
  // Извлечение возраста
  const ageMatch = query.match(/(\d+)\s*(?:лет|год|года)/);
  if (ageMatch) {
    analysis.age = parseInt(ageMatch[1]);
    
    // Определяем категорию по возрасту
    if (analysis.age <= 12) analysis.category = 'дети';
    else if (analysis.age <= 18) analysis.category = 'подростки';
    else analysis.category = 'взрослые';
  }
  
  // Извлечение уровня
  if (queryLower.includes('с нуля') || queryLower.includes('начать') || queryLower.includes('новичок')) {
    analysis.level = 'начальный';
  } else if (queryLower.includes('средний') || queryLower.includes('опыт')) {
    analysis.level = 'средний';
  } else if (queryLower.includes('продвинут')) {
    analysis.level = 'продвинутый';
  }
  
  // Ключевые слова
  const keywordMap = [
    { words: ['javascript', 'js', 'джаваскрипт'], keyword: 'javascript' },
    { words: ['python', 'питон'], keyword: 'python' },
    { words: ['react', 'реакт'], keyword: 'react' },
    { words: ['игр', 'unity', 'геймдев'], keyword: 'игры' },
    { words: ['сайт', 'веб', 'web'], keyword: 'веб' },
    { words: ['данн', 'data', 'анализ'], keyword: 'данные' },
    { words: ['html', 'css'], keyword: 'html' },
    { words: ['мобильн', 'android', 'ios'], keyword: 'мобильные' }
  ];
  
  keywordMap.forEach(item => {
    if (item.words.some(word => queryLower.includes(word))) {
      analysis.keywords.push(item.keyword);
    }
  });
  
  return analysis;
}

// Функция генерации ответа Alex
async function generateAlexResponse(
  userMessage: string,
  analysis: GPTAnalysis,
  courses: Course[]
): Promise<string> {
  
  if (courses.length === 0) {
    return `🎯 Я проанализировал ваш запрос: "${userMessage}"
    
К сожалению, не нашел подходящих курсов по вашим критериям.

💡 Попробуйте уточнить:
• Какой у вас возраст?
• Есть ли опыт в программировании?
• Что именно хотите создавать?

— Alex, ваш помощник`;
  }
  
  // Формируем текст с ссылками
  const coursesWithLinks = courses.map(course => 
    `• [${course.title}](/courses/${course.url}) - ${course.level}, ${course.duration}, ${course.price}₽`
  ).join('\n');
  
  try {
    const response = await yandexGPTClient.chat.completions.create({
      model: `gpt://${YANDEX_FOLDER_ID}/${MODEL}`,
      messages: [
        {
          role: 'system',
          content: `Ты Alex - дружелюбный помощник по курсам программирования.

КОНТЕКСТ:
Запрос пользователя: "${userMessage}"
Найденные курсы (${courses.length}):
${coursesWithLinks}

ИНСТРУКЦИИ:
1. Начни с краткого резюме анализа запроса
2. Предложи 1-3 подходящих курса
3. Используй Markdown ссылки: [название](/courses/url-slug)
4. Объясни почему курс подходит
5. Добавь призыв перейти по ссылке для подробностей
6. В конце задай уточняющий вопрос если нужно
7. Подпишись: "— Alex"

ВАЖНО:
• Будь краток и полезен
• Используй эмодзи для наглядности
• Не перечисляй все курсы, только лучшие`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    return response.choices[0]?.message?.content || 
      `🎯 Нашёл ${courses.length} подходящих курсов!\n\n` +
      courses.map(course => 
        `• [${course.title}](/courses/${course.url}) - ${course.description.slice(0, 80)}...`
      ).join('\n\n') +
      `\n\n💡 Нажмите на названия курсов для подробностей!\n\n— Alex`;
    
  } catch (error) {
    console.error('GPT Response error:', error);
    
    // Fallback ответ
    return `🎯 По вашему запросу найдено ${courses.length} курсов:\n\n` +
      courses.slice(0, 3).map(course => 
        `• [${course.title}](/courses/${course.url}) - ${course.level}, ${course.duration}, ${course.price}₽`
      ).join('\n\n') +
      `\n\n💡 Нажмите на название курса, чтобы увидеть полную программу!\n\n— Alex`;
  }
}