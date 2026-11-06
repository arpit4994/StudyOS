
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Target,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  X,
} from "lucide-react";

type Milestone = {
  id: number;
  title: string;
  completed: boolean;
};

type Goal = {
  id: number;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  milestones: Milestone[];
};

const STORAGE_KEY = "study-os-goals";

const defaultGoals: Goal[] = [
  {
    id: 1,
    title: "Class 12 CBSE",
    description: "Achieve academic excellence in Class 12.",
    category: "Academics",
    targetDate: "2027-03-31",
    milestones: [
      { id: 11, title: "Complete syllabus", completed: false },
      { id: 12, title: "Complete first revision", completed: false },
      { id: 13, title: "Complete sample papers", completed: false },
    ],
  },
  {
    id: 2,
    title: "CUET UG 2027",
    description: "Prepare for the CUET entrance examination.",
    category: "Entrance Exam",
    targetDate: "2027-05-31",
    milestones: [
      { id: 21, title: "Complete domain subjects", completed: false },
      { id: 22, title: "Complete mock tests", completed: false },
      { id: 23, title: "Revise important topics", completed: false },
    ],
  },
  {
    id: 3,
    title: "SRCC Admission",
    description: "Work towards admission to SRCC.",
    category: "Long-term",
    targetDate: "2027-08-31",
    milestones: [
      { id: 31, title: "Prepare application", completed: false },
      { id: 32, title: "Meet admission requirements", completed: false },
    ],
  },
];

function loadGoals(): Goal[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultGoals;
  } catch {
    return defaultGoals;
  }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Academics");
  const [newDate, setNewDate] = useState("");
  const [milestoneInputs, setMilestoneInputs] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new Event("study-os-goals-updated"));
  }, [goals]);

  const addGoal = () => {
    if (!newTitle.trim()) return;

    const goal: Goal = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      targetDate: newDate,
      milestones: [],
    };

    setGoals((previous) => [...previous, goal]);
    setNewTitle("");
    setNewDescription("");
    setNewCategory("Academics");
    setNewDate("");
    setShowForm(false);
  };

  const deleteGoal = (id: number) => {
    setGoals((previous) =>
      previous.filter((goal) => goal.id !== id)
    );
  };

  const toggleMilestone = (
    goalId: number,
    milestoneId: number
  ) => {
    setGoals((previous) =>
      previous.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? {
                      ...milestone,
                      completed: !milestone.completed,
                    }
                  : milestone
              ),
            }
          : goal
      )
    );
  };

  const addMilestone = (goalId: number) => {
    const title = milestoneInputs[goalId]?.trim();
    if (!title) return;

    setGoals((previous) =>
      previous.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: [
                ...goal.milestones,
                {
                  id: Date.now(),
                  title,
                  completed: false,
                },
              ],
            }
          : goal
      )
    );

    setMilestoneInputs((previous) => ({
      ...previous,
      [goalId]: "",
    }));
  };

  const totalMilestones = goals.reduce(
    (sum, goal) => sum + goal.milestones.length,
    0
  );

  const completedMilestones = goals.reduce(
    (sum, goal) =>
      sum +
      goal.milestones.filter((milestone) => milestone.completed).length,
    0
  );

  const overallProgress = totalMilestones
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h1>Goals & Roadmap</h1>
          <p>Turn your ambitions into measurable progress.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create goal"}
        </button>
      </div>

      <section className="goals-stats">
        <article className="glass goal-stat">
          <Target size={20} />
          <span>Total Goals</span>
          <strong>{goals.length}</strong>
        </article>

        <article className="glass goal-stat">
          <Flag size={20} />
          <span>Milestones</span>
          <strong>{totalMilestones}</strong>
        </article>

        <article className="glass goal-stat">
          <CheckCircle2 size={20} />
          <span>Completed</span>
          <strong>{completedMilestones}</strong>
        </article>

        <article className="glass goal-stat">
          <Target size={20} />
          <span>Overall Progress</span>
          <strong>{overallProgress}%</strong>
        </article>
      </section>

      {showForm && (
        <section className="glass goal-form-panel">
          <h2>Create a new goal</h2>

          <div className="goal-form">
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Goal title"
            />

            <input
              value={newDescription}
              onChange={(event) =>
                setNewDescription(event.target.value)
              }
              placeholder="Short description"
            />

            <select
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            >
              <option>Academics</option>
              <option>Entrance Exam</option>
              <option>Personal</option>
              <option>Career</option>
              <option>Long-term</option>
            </select>

            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />

            <button className="primary-button" onClick={addGoal}>
              <Plus size={17} />
              Save goal
            </button>
          </div>
        </section>
      )}

      <div className="goals-section-heading">
        <div>
          <h2>Your goals</h2>
          <p>Track every milestone along the way.</p>
        </div>
      </div>

      <div className="goal-cards">
        {goals.length === 0 ? (
          <div className="glass goal-empty">
            <Target size={32} />
            <h3>No goals created yet</h3>
            <p>Create your first goal to get started.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const completed = goal.milestones.filter(
              (milestone) => milestone.completed
            ).length;

            const progress = goal.milestones.length
              ? Math.round(
                  (completed / goal.milestones.length) * 100
                )
              : 0;

            return (
              <article className="glass goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <div className="goal-card-icon">
                    <Target size={20} />
                  </div>

                  <button
                    className="delete-task"
                    onClick={() => deleteGoal(goal.id)}
                    aria-label={`Delete ${goal.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <span className="goal-category">
                  {goal.category}
                </span>

                <h3>{goal.title}</h3>
                <p className="goal-description">
                  {goal.description || "No description added."}
                </p>

                <div className="goal-progress-info">
                  <strong>Progress</strong>
                  <strong>{progress}%</strong>
                </div>

                <div className="goal-progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>

                <div className="goal-deadline">
                  <CalendarDays size={15} />
                  {goal.targetDate
                    ? `Target: ${goal.targetDate}`
                    : "No deadline"}
                </div>

                <div className="milestone-heading">
                  <strong>Milestones</strong>
                  <span>
                    {completed}/{goal.milestones.length}
                  </span>
                </div>

                <div className="milestone-list">
                  {goal.milestones.map((milestone) => (
                    <button
                      className={`milestone-item ${
                        milestone.completed ? "completed" : ""
                      }`}
                      key={milestone.id}
                      onClick={() =>
                        toggleMilestone(goal.id, milestone.id)
                      }
                    >
                      {milestone.completed ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <Circle size={17} />
                      )}

                      <span>{milestone.title}</span>
                    </button>
                  ))}
                </div>

                <div className="milestone-add">
                  <input
                    value={milestoneInputs[goal.id] || ""}
                    onChange={(event) =>
                      setMilestoneInputs((previous) => ({
                        ...previous,
                        [goal.id]: event.target.value,
                      }))
                    }
                    placeholder="Add a milestone..."
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        addMilestone(goal.id);
                      }
                    }}
                  />

                  <button
                    onClick={() => addMilestone(goal.id)}
                    aria-label="Add milestone"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
