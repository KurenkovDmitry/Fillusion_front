import Popover from "@mui/material/Popover";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton, ToggleButtonGroup, ToggleButton } from "@mui/material";
import React, { useState } from "react";
import { useStyles } from "./AdditionalSettings.styles";

interface AdditionalSettingsProps {}

const availableDataTypes = {
  personalInfo: [
    {
      value: "name",
      label: "Полное имя",
      examples: ["Иван Петров", "Мария Сидорова", "Алексей Козлов"],
    },
    {
      value: "first_name",
      label: "Имя",
      examples: ["Дмитрий", "Елена", "Андрей"],
    },
    {
      value: "last_name",
      label: "Фамилия",
      examples: ["Смирнов", "Кузнецова", "Попов"],
    },
    {
      value: "email",
      label: "Email",
      examples: [
        "ivan.petrov@example.com",
        "maria.s@mail.ru",
        "alex.k@gmail.com",
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
    },
    {
      value: "city",
      label: "Город",
      examples: ["Москва", "Санкт-Петербург", "Екатеринбург"],
    },
    {
      value: "country",
      label: "Страна",
      examples: ["Россия", "Казахстан", "Беларусь"],
    },
    {
      value: "postcode",
      label: "Почтовый индекс",
      examples: ["123456", "198765", "420000"],
    },
    {
      value: "street_address",
      label: "Улица и номер дома",
      examples: ["ул. Ленина, д. 15", "пр. Мира, д. 88", "ул. Гагарина, д. 3"],
    },
  ],
  datetime: [
    {
      value: "date_of_birth",
      label: "Дата рождения",
      examples: ["15.03.1990", "22.07.1985", "08.11.1995"],
    },
    {
      value: "date_this_decade",
      label: "Дата (текущее десятилетие)",
      examples: ["12.05.2023", "30.09.2024", "18.01.2025"],
    },
    {
      value: "date_this_year",
      label: "Дата (текущий год)",
      examples: ["15.02.2025", "28.06.2025", "03.10.2025"],
    },
    {
      value: "time",
      label: "Время (HH:MM:SS)",
      examples: ["14:23:45", "09:15:30", "18:47:12"],
    },
  ],
  workFinance: [
    {
      value: "job",
      label: "Должность / Профессия",
      examples: ["Менеджер по продажам", "Программист", "Бухгалтер"],
    },
    {
      value: "company",
      label: "Компания",
      examples: ['ООО "Рога и Копыта"', 'АО "Техпром"', "ИП Иванов"],
    },
    {
      value: "credit_card_number",
      label: "Номер кредитной карты",
      examples: [
        "4532 1488 0343 6467",
        "5425 2334 3010 9903",
        "3782 822463 10005",
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
    },
    {
      value: "ipv4",
      label: "IPv4-адрес",
      examples: ["192.168.1.1", "10.0.0.45", "172.16.254.1"],
    },
    {
      value: "user_name",
      label: "Имя пользователя",
      examples: ["ivan_petrov", "maria_s_1990", "alex_kozlov"],
    },
  ],
};

interface FakerType {
  value: string;
  label: string;
  examples: string[];
}

const FakerDataType = (props: FakerType) => {
  const { classes } = useStyles();
  return (
    <div className={classes.dataTypeBox}>
      <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>{props.label}</p>
      <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
        Примеры: {props.examples.join(", ")}
      </p>
    </div>
  );
};

export const AdditionalSettings = (props: AdditionalSettingsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [approach, setApproach] = useState("faker");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleApproachChange = (event: any, newApproach: string) => {
    if (newApproach !== null) {
      setApproach(newApproach);
    }
  };
  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <SettingsIcon sx={{ color: "#888" }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPopover-paper": {
            scrollbarWidth: "thin",
            scrollbarColor: "#ccc transparent",
          },
        }}
      >
        <div style={{ padding: "15px", width: "600px", maxHeight: "500px" }}>
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <p style={{ margin: 0 }}>Способ генерации данных</p>
            <ToggleButtonGroup
              value={approach}
              exclusive
              onChange={handleApproachChange}
              aria-label="approach"
              sx={{
                height: "32px",
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <ToggleButton
                value="faker"
                sx={{
                  fontFamily: "onest",
                  textTransform: "none",
                  height: "32px",
                }}
              >
                Faker
              </ToggleButton>
              <ToggleButton
                value="ai"
                sx={{
                  fontFamily: "onest",
                  textTransform: "none",
                  height: "32px",
                }}
              >
                ИИ
              </ToggleButton>
            </ToggleButtonGroup>
            <div
              style={{
                overflowY: "auto",
              }}
            >
              {approach === "faker" && (
                <>
                  {Object.entries(availableDataTypes).map(
                    ([category, types]) => (
                      <div key={category}>
                        <h4
                          style={{
                            margin: "10px 0",
                            borderBottom: "1px solid #ccc",
                            paddingBottom: "5px",
                          }}
                        >
                          {category === "personalInfo"
                            ? "Личные данные"
                            : category === "address"
                            ? "Адрес"
                            : category === "datetime"
                            ? "Дата и время"
                            : category === "workFinance"
                            ? "Работа и финансы"
                            : category === "internet"
                            ? "Интернет"
                            : category}
                        </h4>
                        <div
                          style={{
                            display: "grid",
                            gap: "10px",
                            gridTemplateColumns: "1fr 1fr",
                          }}
                        >
                          {types.map((type) => (
                            <FakerDataType
                              key={type.value}
                              value={type.value}
                              label={type.label}
                              examples={type.examples}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Popover>
    </>
  );
};
