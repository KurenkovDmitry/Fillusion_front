import { useEffect, useState } from "react";
import { ProjectCard } from "./components/ProjectCard";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { ProjectDialog } from "./components/ProjectDialog";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import type { Project } from "@services/api/ProjectService/ProjectService.types";
import { ProjectDeleteDialog } from "./components/ProjectDeleteDialog";
import { motion } from "framer-motion";

export interface DialogState {
  open: boolean;
  initiator: "page" | "card";
  projectId?: string;
}

export interface DeleteDialogState {
  open: boolean;
  projectId?: string;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    initiator: "page",
  });

  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>(
    { open: false }
  );

  const setOpen = (open: boolean) =>
    setDialogState({ open: open, initiator: "page" });

  const onClose = () => setDialogState((s) => ({ ...s, open: false }));

  const onDeleteClose = () =>
    setDeleteDialogState((s) => ({ ...s, open: false }));

  const setOpenFromCard = (projectId: string, open: boolean) =>
    setDialogState({ open: open, projectId: projectId, initiator: "card" });

  const setDeleteOpenFromCard = (projectId: string, open: boolean) =>
    setDeleteDialogState({ open: open, projectId });

  const [newProject, setNewProject] = useState(
    dialogState.initiator === "page"
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNewProject(dialogState.initiator === "page");
  }, [dialogState.initiator]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectService.getProjects();
      const { projects } = data;
      setProjects(projects);
    } catch (error) {
      console.error("Не удалось загрузить проекты:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const isPhone = window.innerWidth <= 600;

  return (
    <LayoutWithHeader noJustify>
      <div style={{ width: isPhone ? "95%" : "70%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: isPhone ? "28px" : "32px" }}>Проекты</h1>
          {projects?.length < 6 ? (
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
          ) : (
            <Tooltip title="Максимальное число проектов - 6" arrow>
              <div>
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
                  disabled
                >
                  Создать новый проект
                </Button>
              </div>
            </Tooltip>
          )}
        </div>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </div>
        ) : projects.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr 1fr",
              gridTemplateRows: "auto auto",
              gap: "20px",
            }}
          >
            {projects.map((val, idx) => (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <ProjectCard
                  setOpenFromCard={setOpenFromCard}
                  setDeleteOpenFromCard={setDeleteOpenFromCard}
                  id={val.id}
                  title={val.name}
                  description={val.description}
                  updatedAt={val.updatedAt}
                />
              </motion.div>
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
        onSuccess={fetchProjects}
      />
      <ProjectDeleteDialog
        dialogState={deleteDialogState}
        onClose={onDeleteClose}
        projects={projects}
        onSuccess={fetchProjects}
      />
    </LayoutWithHeader>
  );
};
