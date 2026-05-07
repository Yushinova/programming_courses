import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { coursesRepository } from '@/lib/db/repository';
import type { Course } from '@/lib/db/repository';

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

// Тип для сообщений в истории
type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        response: "Пожалуйста, введите ваш запрос о курсах."
      });
    }

    // 1. Получаем ВСЕ курсы
    const allCourses = await coursesRepository.getCourses();
    
    // 2. Используем существующий метод для кликабельных ссылок
    const markdownLinks = coursesRepository.formatCoursesWithMarkdownLinks(allCourses);
    
    // 3. Формируем текстовое представление с кликабельными ссылками
    const coursesText = allCourses.map(course => 
      `КУРС: ${course.title}
       Уровень: ${course.level}
       Длительность: ${course.duration}
       Цена: ${course.price}${course.currency || '₽'}
      Описание: ${course.description}
      Ссылка: [${course.title}](/courses/${course.url})
---
      `).join('\n');

    // 4. Получаем ответ от GPT
    const gptResponse = await getGPTResponseWithCoursesAnalysis(
      message,
      coursesText,
      markdownLinks,
      conversationHistory as ChatMessage[]
    );

    return NextResponse.json({
      success: true,
      response: gptResponse
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json({
      success: false,
      response: "Извините, произошла ошибка. Попробуйте еще раз."
    });
  }
}

// Функция получения ответа от GPT с анализом курсов
async function getGPTResponseWithCoursesAnalysis(
  userMessage: string,
  coursesText: string,
  markdownLinks: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    // Формируем промпт для GPT с акцентом на использование ссылок
    const systemPrompt = `Ты дружелюбный консультант по курсам программирования. Здороваться не нужно. Вот информация обо всех курсах:

${coursesText}

И готовые markdown ссылки для использования:
${markdownLinks}

В ОТВЕТЕ ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ КЛИКАБЕЛЬНЫЕ ССЫЛКИ формата [Название курса](/courses/url).`;

    // Формируем массив сообщений
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.slice(-6),
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Получаем ответ от GPT
    const response = await yandexGPTClient.chat.completions.create({
      model: `gpt://${YANDEX_FOLDER_ID}/${MODEL}`,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0]?.message?.content || "Извините, не удалось сформировать ответ.";

  } catch (error: any) {
    console.error('GPT Response Error:', error);
    return "Извините, произошла ошибка при анализе курсов.";
  }
}