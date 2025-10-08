import { useState } from 'react';
import { Button } from "@mui/material";

interface CopyButtonProps {
    textToCopy: string;
}

// Компонент принимает текст для копирования как пропс
export const CopyButton = (props: CopyButtonProps) => {
  const [buttonText, setButtonText] = useState('Копировать');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.textToCopy);
      setButtonText('Скопировано!');
      setTimeout(() => {
        setButtonText('Копировать');
      }, 2000); // Возвращаем исходный текст через 2 секунды
    } catch (err) {
      console.error('Ошибка при копировании текста: ', err);
      setButtonText('Ошибка');
    }
  };

  return (
    <Button onClick={handleCopy} style={{width: '140px', height: '40px'}} variant='contained'>
      {buttonText}
    </Button>
  );
};

// Пример использования этого компонента
const MyComponent = () => {
  const resultText = "Это мой результат, который нужно скопировать.";

  return (
    <div>
      <p>{resultText}</p>
      <CopyButton textToCopy={resultText} />
    </div>
  );
};

export default MyComponent;
