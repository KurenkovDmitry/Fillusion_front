import { useState } from "react";

interface SliderWithInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange?: (value: number) => void;
}

export const SliderWithInput = (props: SliderWithInputProps) => {
  const [value, setValue] = useState(props.value);
  const [inputValue, setInputValue] = useState(String(props.value)); // ✅ Отдельное состояние для input

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const numValue = newValue as number;
    setValue(numValue);
    setInputValue(String(numValue)); // ✅ Синхронизируем input
    if (props.onChange) {
      props.onChange(numValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    // ✅ Разрешаем пустую строку для возможности очистки
    if (rawValue === "") {
      setInputValue("");
      return;
    }

    // ✅ Проверяем что это валидное число
    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      setInputValue(rawValue); // ✅ Сохраняем строку как есть
      setValue(numValue);
      if (props.onChange) {
        props.onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    // ✅ Если поле пустое, устанавливаем минимальное значение
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setValue(props.min);
      setInputValue(String(props.min));
      if (props.onChange) {
        props.onChange(props.min);
      }
      return;
    }

    const numValue = Number(inputValue);

    if (numValue < props.min) {
      setValue(props.min);
      setInputValue(String(props.min));
      if (props.onChange) {
        props.onChange(props.min);
      }
    } else if (numValue > props.max) {
      setValue(props.max);
      setInputValue(String(props.max));
      if (props.onChange) {
        props.onChange(props.max);
      }
    } else {
      // ✅ Нормализуем значение (убираем лидирующие нули)
      setInputValue(String(numValue));
    }
  };

  // ✅ Синхронизируем с props.value
  useState(() => {
    setValue(props.value);
    setInputValue(String(props.value));
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        margin: "10px 0",
      }}
    >
      <h4
        style={{
          margin: "0",
          fontSize: "15px",
          lineHeight: "18px",
          alignSelf: "flex-start",
        }}
      >
        {props.label}
      </h4>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="number"
          value={inputValue} // ✅ Используем inputValue
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            width: "auto",
            padding: "10px 15px",
            height: "32px",
            borderRadius: "7px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxSizing: "border-box",
            outline: "none",
            background: "#F3F3F5",
            color: "black",
          }}
          min={props.min}
          max={props.max}
        />
        <input
          type="range"
          value={value}
          onChange={(e) =>
            handleSliderChange(
              e as unknown as Event,
              Number((e.target as HTMLInputElement).value)
            )
          }
          min={props.min}
          max={props.max}
          step={props.step}
          style={{
            flex: 1,
            borderRadius: "7px",
            height: "9px",
            appearance: "none",
            cursor: "pointer",
            border: "1px solid #ccc",
            background: `linear-gradient(
              to right,
              #4f8cff 0%,
              #4f8cff ${(100 * (value - props.min)) / (props.max - props.min)}%,
              #F3F3F5 ${(100 * (value - props.min)) / (props.max - props.min)}%,
              #F3F3F5 100%
            )`,
          }}
        />
      </div>
    </div>
  );
};
