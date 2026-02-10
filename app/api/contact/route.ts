import { NextRequest, NextResponse } from 'next/server';

interface ContactRequest {
  name: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();
    
    // Валидация данных
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Здесь можно добавить:
    // 1. Сохранение в базу данных
    // 2. Отправку email уведомления
    // 3. Интеграцию с CRM системой
    // 4. Отправку в Telegram бот

    console.log('Получена заявка:', body);

    // Имитация успешной обработки
    return NextResponse.json(
      { 
        success: true, 
        message: 'Заявка успешно отправлена',
        data: body 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка обработки заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Метод не разрешен' },
    { status: 405 }
  );
}