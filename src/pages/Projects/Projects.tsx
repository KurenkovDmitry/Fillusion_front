import { useEffect, useState } from "react";
import { ProjectCard } from "./components/ProjectCard";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button } from "@mui/material";
import { ProjectDialog } from "./components/ProjectDialog";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import type { Project } from "@services/api/ProjectService/ProjectService.types";

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getProjects();
      const { projects } = data;
      setProjects(projects);
    } catch (error) {
      console.error("Не удалось загрузить проекты:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Функция для обновления списка проектов после создания/изменения
  const handleProjectUpdate = () => {
    fetchProjects();
  };

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
                key={val.id} // Используй id вместо idx для ключа!
                id={val.id}
                title={val.name}
                description={val.description}
                updatedAt={val.updatedAt}
                onUpdate={handleProjectUpdate} // Передаем callback
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
      <ProjectDialog
        open={open}
        onClose={() => setOpen(false)}
        newProject
        onSuccess={handleProjectUpdate} // Передаем callback
      />
    </LayoutWithHeader>
  );
};
