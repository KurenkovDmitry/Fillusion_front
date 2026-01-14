import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Fab, Fade, useScrollTrigger } from "@mui/material";
import { useAuth } from "@shared/hooks/useAuth";
import SplitText from "./components/SplitText";
import { useState } from "react";
import { useStyles } from "./NonModalGenerate.styles";
import FeaturesIcon from "@assets/features.svg?react";
import DBIcon from "@assets/db.svg?react";
import UniqueIcon from "@assets/uniq.svg?react";
import CodeIcon from "@assets/code.svg?react";
import EditorIcon from "@assets/editor.svg?react";
import NotificationsIcon from "@assets/notif.svg?react";
import JSONIcon from "@assets/json.svg?react";
import SnapshotIcon from "@assets/snapshot.svg?react";
import EmailIcon from "@assets/email.svg?react";
import TgIcon from "@assets/tg.svg?react";
import VkIcon from "@assets/vk.svg?react";
import IosShareIcon from "@mui/icons-material/IosShare";
import NorthIcon from "@mui/icons-material/North";
import { motion } from "framer-motion";
import { FeatureCard } from "./components/FeatureCard";
import { CodeBox } from "./components/CodeBox";

const animationProps = {
  initial: { opacity: 0, y: 50 }, // Начальное состояние
  whileInView: { opacity: 1, y: 0 }, // Когда элемент появился на экране
  viewport: { once: true }, // Анимировать только один раз
  transition: { duration: 0.5 },
};

const codeExample = `{
  "datasets": [
    {
      "records": [
        {
          "id": "5796835f-af62-4adc-acad-baf84ef787d8",
          "rating": 10,
          "review": "Отличная лампа! Яркий регулируемый свет, стильный дизайн. Рекомендую!",
          "user_id": "3b5b7d6b-fc05-4bc9-8515-edd52785c89c"
        },
        {
          "id": "17bace43-77a2-4728-9093-7912cc2f279e",
          "rating": 9,
          "review": "Очень доволен: удобная настройка, комфортный для глаз свет. Лучшая покупка!",
          "user_id": "83c679dc-8c08-4fd3-be67-6799dfa0775a"
        }
      ],
      "table_name": "reviews"
    }
  ]
}`;

export const NonModalGenerate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { classes } = useStyles();

  const navigateToProjects = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    navigate("/projects");
  };

  const features = [
    {
      title: "Автоматическое заполнение БД",
      description: "Заполнение баз данных тестовыми и демо-данными в один клик",
      icon: <DBIcon className={classes.main__icon} />,
    },
    {
      title: "AI-генерация данных",
      description:
        "Использование нейросетевых моделей для создания реалистичных синтетических данных",
      icon: <FeaturesIcon className={classes.main__icon} />,
    },
    {
      title: "Уникальность и валидность",
      description:
        "Генерация данных с учётом уникальности и SQL-валидности, гарантия корректности",
      icon: <UniqueIcon className={classes.main__icon} />,
    },
    {
      title: "Детальная настройка",
      description:
        "Генерация данных с детальной настройкой правил, возможность предоставить примеры данных",
      icon: <CodeIcon className={classes.main__icon} />,
    },
    {
      title: "Визуальный редактор",
      description:
        "Создание новых баз данных и их редактирование через интуитивный визуальный интерфейс",
      icon: <EditorIcon className={classes.main__icon} />,
    },
    {
      title: "Уведомления",
      description:
        "Настройка уведомлений о завершении через VK, Email или Telegram",
      icon: <NotificationsIcon className={classes.main__icon} />,
    },
  ];

  const formats = [
    {
      format: "Прямая запись в БД",
      description: "Непосредственное подключение к базе данных",
      icon: <DBIcon className={classes.format__icon} />,
    },
    {
      format: "DB Snapshot",
      description: "Снапшот заполненной базы данных",
      icon: <SnapshotIcon className={classes.format__icon} />,
    },
    {
      format: "JSON",
      description: "Экспорт в структурированный JSON формат",
      icon: <JSONIcon className={classes.format__icon} />,
    },
  ];

  const notifications = [
    {
      title: "Email",
      description: "Уведомления на почту",
      icon: <EmailIcon className={classes.notifications__icon} />,
    },
    {
      title: "Telegram",
      description: "Мгновенные уведомления в Telegram",
      icon: <TgIcon className={classes.notifications__icon} />,
    },
    {
      title: "VK мессенджер",
      description: "Получайте уведомления в VK",
      icon: <VkIcon className={classes.notifications__icon} />,
    },
  ];

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 200,
  });

  const handleScrollClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LayoutWithHeader activeLogin={isLoginOpen} setActiveLogin={setIsLoginOpen}>
      <Fade in={trigger}>
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            right: "40px",
            zIndex: 1000,
          }}
        >
          <Fab size="medium" onClick={handleScrollClick}>
            <NorthIcon />
          </Fab>
        </div>
      </Fade>
      <div className={classes.main}>
        <section className={classes.main__container}>
          <div className={classes.main__content}>
            <SplitText
              text="Наполните ваши базы данных"
              delay={20}
              duration={2}
              ease="elastic.out(1, 0.45)"
              splitType="chars"
              from={{ opacity: 0, y: 20, x: 0 }}
              to={{ opacity: 1, y: 0, x: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              tag="h1"
              className={classes.main__title}
            />
            <SplitText
              text="реалистичными данными"
              delay={20}
              duration={2}
              ease="elastic.out(1, 0.45)"
              splitType="chars"
              from={{ opacity: 0, y: 20, x: 0 }}
              to={{ opacity: 1, y: 0, x: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              tag="h1"
              className={classes.main__title}
            />
            <SplitText
              text="Автоматическая генерация синтетических данных для тестирования, разработки и демонстрации."
              delay={20}
              duration={1.5}
              ease="power3.out(1, 0.45)"
              splitType="words"
              from={{ opacity: 0, y: 20, x: 0 }}
              to={{ opacity: 1, y: 0, x: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              tag="h4"
              className={classes.main__description}
            />
            <SplitText
              text="Поддержка нейросетевых моделей, несколько форматов экспорта и прямая интеграция с базами данных."
              delay={20}
              duration={1.5}
              ease="power3.out(1, 0.45)"
              splitType="words"
              from={{ opacity: 0, y: 20, x: 0 }}
              to={{ opacity: 1, y: 0, x: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              tag="h4"
              className={classes.main__description_secondary}
            />
          </div>
          <div className={classes.main__actions}>
            <Button
              onClick={navigateToProjects}
              variant="contained"
              className={classes.main__button}
            >
              {user ? "Перейти к проектам" : "Начать"}
            </Button>
          </div>
        </section>
        <div className={classes.main__divider} />
        <section className={classes.main__page}>
          <div className={classes.container__wrapper}>
            <Chip
              icon={
                <FeaturesIcon
                  style={{ width: "14px", height: "14px", color: "black" }}
                />
              }
              label="Возможности"
              sx={{
                border: "1px solid black",
                backgroundColor: "transparent",
                padding: "4px 10px",
                fontSize: "14px",
              }}
            />
            <motion.h1
              className={classes.main__featureTitle}
              {...animationProps}
            >
              Всё необходимое для работы с данными
            </motion.h1>
            <motion.span
              {...animationProps}
              transition={{ ...animationProps.transition, delay: 0.3 }}
              className={classes.main__featureSubTitle}
            >
              Мощные инструменты для генерации, управления и экспорта
              синтетических данных
            </motion.span>
            <div className={classes.main__features}>
              {features.map((f, idx) => (
                <motion.div
                  {...animationProps}
                  transition={{
                    ...animationProps.transition,
                    delay: 0.1 * idx,
                  }}
                >
                  <FeatureCard
                    key={idx}
                    icon={f.icon}
                    title={f.title}
                    description={f.description}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* <div className={classes.main__divider} /> */}
        <section className={classes.main__page}>
          <div className={classes.container__wrapper}>
            <Chip
              icon={
                <IosShareIcon
                  style={{ width: "16px", height: "16px", color: "black" }}
                />
              }
              label="Экспорт данных"
              sx={{
                border: "1px solid black",
                backgroundColor: "transparent",
                padding: "4px 10px",
                fontSize: "14px",
              }}
            />
            <motion.h1
              className={classes.main__featureTitle}
              {...animationProps}
            >
              Различные форматы экспорта
            </motion.h1>
            <motion.span
              {...animationProps}
              transition={{ ...animationProps.transition, delay: 0.3 }}
              className={classes.main__featureSubTitle}
            >
              Экспортируйте данные в любом удобном формате для вашего проекта
            </motion.span>
            <div className={classes.main__features}>
              {formats.map((f, idx) => (
                <motion.div
                  {...animationProps}
                  transition={{
                    ...animationProps.transition,
                    delay: 0.1 * idx,
                  }}
                >
                  <FeatureCard
                    key={idx}
                    icon={f.icon}
                    title={f.format}
                    description={f.description}
                    variant="formats"
                  />
                </motion.div>
              ))}
            </div>
            <motion.div
              {...animationProps}
              className={classes.main__codeWrapper}
            >
              <CodeBox code={codeExample} />
            </motion.div>
          </div>
        </section>
        <section className={classes.main__page}>
          <div className={classes.container__wrapper}>
            <Chip
              icon={
                <NotificationsIcon
                  style={{ width: "14px", height: "14px", color: "black" }}
                />
              }
              label="Уведомления"
              sx={{
                border: "1px solid black",
                backgroundColor: "transparent",
                padding: "4px 10px",
                fontSize: "14px",
              }}
            />
            <motion.h1
              className={classes.main__featureTitle}
              {...animationProps}
            >
              Будьте в курсе каждого процесса
            </motion.h1>
            <motion.span
              {...animationProps}
              transition={{ ...animationProps.transition, delay: 0.3 }}
              className={classes.main__featureSubTitle}
            >
              Настройте уведомления о завершении генерации данных в удобном для
              вас формате
            </motion.span>
            <div className={classes.main__features}>
              {notifications.map((f, idx) => (
                <motion.div
                  {...animationProps}
                  transition={{
                    ...animationProps.transition,
                    delay: 0.1 * idx,
                  }}
                >
                  <FeatureCard
                    key={idx}
                    icon={f.icon}
                    title={f.title}
                    description={f.description}
                    soon={f.title !== "Email"}
                  />
                </motion.div>
              ))}
            </div>
            <motion.article
              className={classes.main__startContainer}
              {...animationProps}
              transition={{
                ...animationProps.transition,
                delay: 0.4,
              }}
            >
              <h1 className={classes.main__featureTitle}>
                Начните работу с Fillusion уже сегодня
              </h1>
              <p className={classes.main__featureSubTitle}>
                Присоединяйтесь к разработчикам, которые уже используют
                Fillusion для генерации тестовых данных
              </p>
              <Button
                className={classes.main__startButton}
                onClick={navigateToProjects}
              >
                {user ? "Перейти к проектам" : "Начать"}
              </Button>
            </motion.article>
          </div>
        </section>
        <section className={classes.main__footer}>
          <div
            style={{
              width: "70%",
              color: "#a1a1a1ff",
              textAlign: "center",
              marginTop: "20px",
              alignItems: "baseline",
              lineHeight: "14px",
            }}
          >
            <span style={{ fontFamily: "sans-serif", fontSize: "16px" }}>
              ©
            </span>{" "}
            2025 Fillusion
          </div>
          <div
            style={{
              width: "70%",
              color: "#a1a1a1ff",
              textAlign: "center",
            }}
          >
            Создано командой Coffee Overflow
          </div>
          <div
            style={{
              width: "70%",
              color: "#a1a1a1ff",
              textAlign: "center",
            }}
          >
            Email: anyflexsolutions@gmail.com
          </div>
          <div
            style={{
              width: "",
              color: "#a1a1a1ff",
              textAlign: "center",
            }}
          >
            Telegram:{" "}
            <a
              style={{ color: "#c4c4c4ff", cursor: "pointer" }}
              href="https://t.me/fillusion_group"
            >
              https://t.me/fillusion_group
            </a>
          </div>
        </section>
      </div>
    </LayoutWithHeader>
  );
};
