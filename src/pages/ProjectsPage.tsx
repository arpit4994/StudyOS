
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  FolderKanban,
  CalendarDays,
  CircleCheck,
  Clock3,
} from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  deadline: string;
  progress: number;
};

const STORAGE_KEY = "study-os-projects";

function loadProjects(): Project[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project["status"]>("Planning");
  const [priority, setPriority] = useState<Project["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const project: Project = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      deadline,
      progress: status === "Completed" ? 100 : 0,
    };

    setProjects((previous) => [project, ...previous]);
    setName("");
    setDescription("");
    setStatus("Planning");
    setPriority("Medium");
    setDeadline("");
    setShowForm(false);
  }

  function updateStatus(id: number, nextStatus: Project["status"]) {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === id
          ? {
              ...project,
              status: nextStatus,
              progress: nextStatus === "Completed" ? 100 : project.progress,
            }
          : project
      )
    );
  }

  function updateProgress(id: number, progress: number) {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === id
          ? {
              ...project,
              progress,
              status: progress === 100 ? "Completed" : progress > 0 ? "In Progress" : project.status === "Completed" ? "Planning" : project.status,
            }
          : project
      )
    );
  }

  function deleteProject(id: number) {
    setProjects((previous) => previous.filter((project) => project.id !== id));
  }

  const completed = projects.filter((p) => p.status === "Completed").length;
  const active = projects.filter((p) => p.status === "In Progress").length;
  const planning = projects.filter((p) => p.status === "Planning").length;

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <p className="eyebrow">WORKSPACE MANAGEMENT</p>
          <h1>Projects</h1>
          <p className="welcome-subtitle">
            Organise your work and keep track of progress.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={17} />
          New Project
        </button>
      </div>

      <section className="projects-stats">
        <article className="glass project-stat">
          <FolderKanban size={21} />
          <p>Total Projects</p>
          <h2>{projects.length}</h2>
        </article>
        <article className="glass project-stat">
          <Clock3 size={21} />
          <p>In Progress</p>
          <h2>{active}</h2>
        </article>
        <article className="glass project-stat">
          <CircleCheck size={21} />
          <p>Completed</p>
          <h2>{completed}</h2>
        </article>
      </section>

      {showForm && (
        <section className="glass projects-panel">
          <div className="panel-heading">
            <div>
              <h3>Create Project</h3>
              <p>Add a new project to your workspace.</p>
            </div>
          </div>

          <form className="project-form" onSubmit={addProject}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])}>
              <option>Planning</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Project["priority"])}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <button className="primary-button" type="submit">
              <Plus size={16} /> Create Project
            </button>
          </form>
        </section>
      )}

      <section className="glass projects-panel">
        <div className="panel-heading">
          <div>
            <h3>Your Projects</h3>
            <p>{planning} planning · {active} active · {completed} completed</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FolderKanban size={25} /></div>
            <h4>No projects yet</h4>
            <p>Create your first project to get started.</p>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <div className="project-card-icon">
                    <FolderKanban size={20} />
                  </div>
                  <div className="project-card-info">
                    <h3>{project.name}</h3>
                    <p>{project.description || "No description added."}</p>
                  </div>
                  <button
                    className="project-delete"
                    onClick={() => deleteProject(project.id)}
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="project-meta">
                  <span className={`project-status status-${project.status.toLowerCase().replace(" ", "-")}`}>
                    {project.status}
                  </span>
                  <span className={`project-priority priority-${project.priority.toLowerCase()}`}>
                    {project.priority} priority
                  </span>
                  {project.deadline && (
                    <span className="project-deadline">
                      <CalendarDays size={14} /> {project.deadline}
                    </span>
                  )}
                </div>

                <div className="project-progress-heading">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>
                <div className="project-progress-track">
                  <div style={{ width: `${project.progress}%` }} />
                </div>

                <input
                  className="project-progress-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={project.progress}
                  onChange={(e) => updateProgress(project.id, Number(e.target.value))}
                  aria-label={`Progress for ${project.name}`}
                />

                <div className="project-status-control">
                  <label>Update status</label>
                  <select
                    value={project.status}
                    onChange={(e) => updateStatus(project.id, e.target.value as Project["status"])}
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
