// Количество пройденных уроков (8 + 4). Для каждого ожидается файл pdf/lesson-N.pdf
const LESSONS_COUNT = 12;

// Уроки, для которых уже лежит файл pdf/lesson-N.pdf
const LESSONS_WITH_PDF = [1];

// Колоды карточек. Сейчас тут примеры — заменим на ваши слова.
const DECKS = [
  {
    id: 'basics',
    title: 'Основы',
    cards: [
      { arm: 'Բարեւ', translit: 'барев', ru: 'привет' },
      { arm: 'Շնորհակալություն', translit: 'шноракалутюн', ru: 'спасибо' },
      { arm: 'Այո', translit: 'ayo', ru: 'да' },
      { arm: 'Ոչ', translit: 'voch', ru: 'нет' },
      { arm: 'Խնդրեմ', translit: 'хндрем', ru: 'пожалуйста' },
      { arm: 'Ջուր', translit: 'джур', ru: 'вода' },
      { arm: 'Հաց', translit: 'хац', ru: 'хлеб' }
    ]
  }
];
