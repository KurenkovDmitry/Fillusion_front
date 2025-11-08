import { useEffect, useState } from "react";
import { ProjectCard } from "./components/ProjectCard";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button } from "@mui/material";
import { ProjectDialog } from "./components/ProjectDialog";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import type { Project } from "@services/api/ProjectService/ProjectService.types";

export interface DialogState {
  open: boolean;
  initiator: "page" | "card";
  projectId?: string;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    initiator: "page",
  });

  const setOpen = (open: boolean) =>
    setDialogState({ open: open, initiator: "page" });

  const onClose = () => setDialogState((s) => ({ ...s, open: false }));

  const setOpenFromCard = (projectId: string, open: boolean) =>
    setDialogState({ open: open, projectId: projectId, initiator: "card" });

  const [newProject, setNewProject] = useState(
    dialogState.initiator === "page"
  );

  useEffect(() => {
    setNewProject(dialogState.initiator === "page");
  }, [dialogState.initiator]);

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
                setOpenFromCard={setOpenFromCard}
                key={idx}
                id={val.id}
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
      <ProjectDialog
        newProject={newProject}
        dialogState={dialogState}
        onClose={onClose}
        projects={projects}
        onSuccess={fetchProjects} // Add this to refresh the list after changes
      />
    </LayoutWithHeader>
  );
};
