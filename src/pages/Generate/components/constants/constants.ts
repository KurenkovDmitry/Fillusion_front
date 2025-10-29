export const getLabelByValue = (value: string): string => {
  for (const [_, types] of Object.entries(availableDataTypes)) {
    const found = types.find((type) => type.value === value);
    if (found) {
      return found.label;
    }
  }
  return value;
};

export const availableDataTypes = {
  basicTypes: [
    {
      value: "COLUMN_TYPE_TEXT",
      label: "Текст",
      examples: ["Произвольный текст", "Описание", "Заметка"],
      examples_en: ["lorem", "ipsum", "exmaple text"],
    },
    {
      value: "COLUMN_TYPE_INT",
      label: "Целое число",
      examples: ["42", "1000", "777"],
      examples_en: ["42", "1000", "777"],
    },
  ],
  personalInfo: [
    {
      value: "COLUMN_TYPE_FIRST_NAME",
      label: "Имя",
      examples: ["Дмитрий", "Елена", "Андрей"],
      examples_en: ["James", "Emma", "William"],
    },
    {
      value: "COLUMN_TYPE_LAST_NAME",
      label: "Фамилия",
      examples: ["Смирнов", "Кузнецова", "Попов"],
      examples_en: ["Wilson", "Anderson", "Taylor"],
    },
    {
      value: "COLUMN_TYPE_EMAIL",
      label: "Email",
      examples: [
        "ivan.petrov@example.com",
        "maria.s@mail.ru",
        "alex.k@gmail.com",
      ],
      examples_en: [
        "ivan.petrov@example.com",
        "maria.s@mail.ru",
        "alex.k@gmail.com",
      ],
    },
    {
      value: "COLUMN_TYPE_PHONE_NUMBER",
      label: "Номер телефона",
      examples: [
        "+7 (912) 345-67-89",
        "+7 (495) 123-45-67",
        "+7 (903) 987-65-43",
      ],
      examples_en: [
        "+7 (912) 345-67-89",
        "+7 (495) 123-45-67",
        "+7 (903) 987-65-43",
      ],
    },
  ],
};
