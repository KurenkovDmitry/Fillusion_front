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
  personalInfo: [
    {
      value: "name",
      label: "Полное имя",
      examples: ["Иван Петров", "Мария Сидорова", "Алексей Козлов"],
      examples_en: ["John Smith", "Sarah Johnson", "Michael Brown"],
    },
    {
      value: "first_name",
      label: "Имя",
      examples: ["Дмитрий", "Елена", "Андрей"],
      examples_en: ["James", "Emma", "William"],
    },
    {
      value: "last_name",
      label: "Фамилия",
      examples: ["Смирнов", "Кузнецова", "Попов"],
      examples_en: ["Wilson", "Anderson", "Taylor"],
    },
    {
      value: "email",
      label: "Email",
      examples: [
        "ivan.petrov@example.com",
        "maria.s@mail.ru",
        "alex.k@gmail.com",
      ],
      examples_en: [
        "john.smith@example.com",
        "sarah.j@gmail.com",
        "michael.b@yahoo.com",
      ],
    },
    {
      value: "phone_number",
      label: "Номер телефона",
      examples: [
        "+7 (912) 345-67-89",
        "+7 (495) 123-45-67",
        "+7 (903) 987-65-43",
      ],
      examples_en: [
        "+1 (555) 123-4567",
        "+44 20 7946 0958",
        "+1 (202) 555-0173",
      ],
    },
  ],
  address: [
    {
      value: "address",
      label: "Полный адрес",
      examples: [
        "ул. Ленина, д. 15, кв. 42, Москва, 123456",
        "пр. Мира, д. 88, Санкт-Петербург, 198765",
        "ул. Гагарина, д. 3, Казань, 420000",
      ],
      examples_en: [
        "123 Main Street, Apt 4B, New York, NY 10001",
        "456 Oak Avenue, London, SW1A 1AA, UK",
        "789 Maple Drive, Los Angeles, CA 90001",
      ],
    },
    {
      value: "city",
      label: "Город",
      examples: ["Москва", "Санкт-Петербург", "Екатеринбург"],
      examples_en: ["New York", "London", "Los Angeles"],
    },
    {
      value: "country",
      label: "Страна",
      examples: ["Россия", "Казахстан", "Беларусь"],
      examples_en: ["United States", "United Kingdom", "Canada"],
    },
    {
      value: "postcode",
      label: "Почтовый индекс",
      examples: ["123456", "198765", "420000"],
      examples_en: ["10001", "SW1A 1AA", "90001"],
    },
    {
      value: "street_address",
      label: "Улица и номер дома",
      examples: ["ул. Ленина, д. 15", "пр. Мира, д. 88", "ул. Гагарина, д. 3"],
      examples_en: ["123 Main Street", "456 Oak Avenue", "789 Maple Drive"],
    },
  ],
  datetime: [
    {
      value: "date_of_birth",
      label: "Дата рождения",
      examples: ["15.03.1990", "22.07.1985", "08.11.1995"],
      examples_en: ["03/15/1990", "07/22/1985", "11/08/1995"],
    },
    {
      value: "date_this_decade",
      label: "Дата (текущее десятилетие)",
      examples: ["12.05.2023", "30.09.2024", "18.01.2025"],
      examples_en: ["05/12/2023", "09/30/2024", "01/18/2025"],
    },
    {
      value: "date_this_year",
      label: "Дата (текущий год)",
      examples: ["15.02.2025", "28.06.2025", "03.10.2025"],
      examples_en: ["02/15/2025", "06/28/2025", "10/03/2025"],
    },
    {
      value: "time",
      label: "Время (HH:MM:SS)",
      examples: ["14:23:45", "09:15:30", "18:47:12"],
      examples_en: ["02:23:45 PM", "09:15:30 AM", "06:47:12 PM"],
    },
  ],
  workFinance: [
    {
      value: "job",
      label: "Должность / Профессия",
      examples: ["Менеджер по продажам", "Программист", "Бухгалтер"],
      examples_en: ["Sales Manager", "Software Engineer", "Accountant"],
    },
    {
      value: "company",
      label: "Компания",
      examples: ['ООО "Рога и Копыта"', 'АО "Техпром"', "ИП Иванов"],
      examples_en: [
        "Tech Solutions Inc.",
        "Global Dynamics LLC",
        "Innovate Corp.",
      ],
    },
    {
      value: "credit_card_number",
      label: "Номер кредитной карты",
      examples: [
        "4532 1488 0343 6467",
        "5425 2334 3010 9903",
        "3782 822463 10005",
      ],
      examples_en: [
        "4539 1488 0343 6467",
        "5555 5555 5555 4444",
        "3714 496353 98431",
      ],
    },
    {
      value: "iban",
      label: "IBAN",
      examples: [
        "RU12 1234 5678 9012 3456 7890 1234",
        "RU98 7654 3210 9876 5432 1098 7654",
        "RU45 1111 2222 3333 4444 5555 6666",
      ],
      examples_en: [
        "GB29 NWBK 6016 1331 9268 19",
        "DE89 3704 0044 0532 0130 00",
        "US64 SVBK US61 1234 5678 90",
      ],
    },
  ],
  internet: [
    {
      value: "url",
      label: "URL",
      examples: [
        "https://example.com",
        "https://mysite.ru/page",
        "https://shop.org/products",
      ],
      examples_en: [
        "https://example.com",
        "https://website.io/page",
        "https://store.net/products",
      ],
    },
    {
      value: "ipv4",
      label: "IPv4-адрес",
      examples: ["192.168.1.1", "10.0.0.45", "172.16.254.1"],
      examples_en: ["192.168.0.1", "10.0.0.100", "172.16.0.1"],
    },
    {
      value: "user_name",
      label: "Имя пользователя",
      examples: ["ivan_petrov", "maria_s_1990", "alex_kozlov"],
      examples_en: ["john_smith", "sarah_j_1990", "mike_brown"],
    },
  ],
};
