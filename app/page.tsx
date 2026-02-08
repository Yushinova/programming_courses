import Image from "next/image";

export default function Home() {
  return (
   <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">
        🚀 Курсы программирования
      </h1>
      <p className="text-lg mb-4">
        Добро пожаловать в платформу для обучения программированию!
      </p>
      <div className="mt-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Начать обучение
        </button>
      </div>
    </div>
  );
}
