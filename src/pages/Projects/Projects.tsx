import { ProjectCard } from "./components/ProjectCard";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button } from "@mui/material";
import { ProjectDialog } from "./components/ProjectDialog";
import { useEffect, useState } from "react";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";

interface Project {
  name: string;
  description: string;
  updatedAt: string;
}

// const projects: Project[] = [
//   {
//     name: "Редизайн веб-сайта",
//     description:
//       "Полное обновление корпоративного сайта с современным дизайном и улучшенной навигацией. Включает адаптивную верстку и оптимизацию производительности.",
//     updatedAt: new Date(2025, 9, 25).toLocaleDateString("ru-RU"),
//   },
//   {
//     name: "Мобильное приложение",
//     description:
//       "Разработка нативного мобильного приложения для iOS и Android с синхронизацией данных в реальном времени.",
//     updatedAt: new Date(2025, 9, 27).toLocaleDateString("ru-RU"),
//   },
//   {
//     name: "Система аналитики",
//     description:
//       "Внедрение комплексной системы аналитики для отслеживания пользовательского поведения и метрик производительности.",
//     updatedAt: new Date(2025, 9, 22).toLocaleDateString("ru-RU"),
//   },
//   {
//     name: "API интеграция",
//     description:
//       "Интеграция с внешними API-сервисами для расширения функциональности платформы и автоматизации процессов.",
//     updatedAt: new Date(2025, 9, 28).toLocaleDateString("ru-RU"),
//   },
//   {
//     name: "База знаний",
//     description:
//       "Создание внутренней базы знаний для команды с возможностью поиска и категоризации документации.",
//     updatedAt: new Date(2025, 9, 20).toLocaleDateString("ru-RU"),
//   },
//   {
//     name: "Оптимизация производительности",
//     description:
//       "Анализ и улучшение производительности существующих систем, оптимизация запросов к базе данных и кеширование.",
//     updatedAt: new Date(2025, 9, 26).toLocaleDateString("ru-RU"),
//   },
// ];

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = import.meta.env.VITE_TOKEN;
    const fetchProjects = async () => {
      const response = await fetch("http://127.0.0.1:8085/api/v1/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Формат: Bearer <токен>
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        console.error(await response.json());
      }
      setProjects(await response.json());
    };
    fetchProjects();
  }, []);

  const [open, setOpen] = useState(false);
  return (
    <LayoutWithHeader noJustify>
      <div style={{ width: "70%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "32px" }}>Проекты</h1>
          <Button
            onClick={() => setOpen(true)}
            variant="contained"
            sx={{
              height: "50px",
              backgroundColor: "#000000ff",
              "&:hover": {
                backgroundColor: "#414141ff",
              },
            }}
          >
            Создать новый проект
          </Button>
        </div>
        {projects.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            {projects.map((val, idx) => (
              <ProjectCard
                key={idx}
                id={idx.toString()}
                title={val.name}
                description={val.description}
                updatedAt={val.updatedAt}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AssignmentLateIcon
              sx={{
                width: "70px",
                height: "70px",
                color: "#555555ff",
                mt: "40px",
              }}
            />
            <span style={{ marginTop: "20px" }}>
              У вас еще нет проектов.{" "}
              <a onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
                Создайте свой первый проект!
              </a>
            </span>
          </div>
        )}
      </div>
      <ProjectDialog open={open} onClose={() => setOpen(false)} newProject />
    </LayoutWithHeader>
  );
};
