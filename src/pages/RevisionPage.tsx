
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

type Chapter = {
  id: string;
  title: string;
  completed: boolean;
};

type Subject = {
  id: string;
  name: string;
  chapters: Chapter[];
};

type RevisionStage = {
  day: number;
  completed: boolean;
  dueDate: string;
};

type RevisionItem = {
  id: string;
  subject: string;
  chapter: string;
  stages: RevisionStage[];
};

const SUBJECTS_KEY = "study-os-subjects";
const REVISION_KEY = "study-os-revisions";

const revisionDays = [1, 3, 7, 15];

function getDateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function createStages(): RevisionStage[] {
  return revisionDays.map((day) => ({
    day,
    completed: false,
    dueDate: getDateAfterDays(day),
  }));
}

export default function RevisionPage() {
  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(REVISION_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const loadSubjects = () => {
      try {
        setSubjects(
          JSON.parse(localStorage.getItem(SUBJECTS_KEY) || "[]")
        );
      } catch {
        setSubjects([]);
      }
    };

    loadSubjects();
    window.addEventListener("study-os-subjects-updated", loadSubjects);
    window.addEventListener("storage", loadSubjects);

    return () => {
      window.removeEventListener("study-os-subjects-updated", loadSubjects);
      window.removeEventListener("storage", loadSubjects);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(REVISION_KEY, JSON.stringify(revisions));
  }, [revisions]);

  const syncCompletedChapters = () => {
    const existingIds = new Set(revisions.map((item) => item.id));

    const newItems: RevisionItem[] = subjects.flatMap((subject) =>
      subject.chapters
        .filter((chapter) => chapter.completed)
        .filter((chapter) => !existingIds.has(chapter.id))
        .map((chapter) => ({
          id: chapter.id,
          subject: subject.name,
          chapter: chapter.title,
          stages: createStages(),
        }))
    );

    if (newItems.length > 0) {
      setRevisions((previous) => [...previous, ...newItems]);
    }
  };

  const toggleRevision = (itemId: string, day: number) => {
    setRevisions((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              stages: item.stages.map((stage) =>
                stage.day === day
                  ? { ...stage, completed: !stage.completed }
                  : stage
              ),
            }
          : item
      )
    );
  };

  const totalStages = revisions.reduce(
    (total, item) => total + item.stages.length,
    0
  );

  const completedStages = revisions.reduce(
    (total, item) =>
      total + item.stages.filter((stage) => stage.completed).length,
    0
  );

  const today = new Date().toISOString().split("T")[0];

  const pendingStages = revisions.reduce(
    (total, item) =>
      total +
      item.stages.filter(
        (stage) => !stage.completed && stage.dueDate <= today
      ).length,
    0
  );

  return (
    <div className="revision-page">
      <div className="revision-heading">
        <div>
          <h1>Revision Centre</h1>
          <p>Build consistency with spaced revision.</p>
        </div>

        <button className="revision-sync-btn" onClick={syncCompletedChapters}>
          <RefreshCw size={16} />
          Sync Chapters
        </button>
      </div>

      <div className="revision-stats">
        <div className="revision-stat">
          <BookOpen size={20} />
          <span>Chapters</span>
          <strong>{revisions.length}</strong>
        </div>

        <div className="revision-stat">
          <CheckCircle2 size={20} />
          <span>Revisions completed</span>
          <strong>{completedStages}/{totalStages}</strong>
        </div>

        <div className="revision-stat">
          <Clock size={20} />
          <span>Due today or overdue</span>
          <strong>{pendingStages}</strong>
        </div>
      </div>

      <div className="revision-progress-card">
        <div className="revision-progress-heading">
          <h3>Overall Revision Progress</h3>
          <strong>
            {totalStages
              ? Math.round((completedStages / totalStages) * 100)
              : 0}%
          </strong>
        </div>

        <div className="revision-progress-track">
          <div
            className="revision-progress-fill"
            style={{
              width: `${
                totalStages
                  ? (completedStages / totalStages) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      <div className="revision-list">
        <div className="revision-list-heading">
          <h2>Your Revision Schedule</h2>
          <span>{revisions.length} chapters</span>
        </div>

        {revisions.length === 0 ? (
          <div className="revision-empty">
            <BookOpen size={32} />
            <h3>No chapters added yet</h3>
            <p>
              Complete chapters in Subjects & Chapters, then click Sync
              Chapters.
            </p>
          </div>
        ) : (
          revisions.map((item) => (
            <div className="revision-card" key={item.id}>
              <div className="revision-card-heading">
                <div>
                  <span>{item.subject}</span>
                  <h3>{item.chapter}</h3>
                </div>

                <span className="revision-count">
                  {item.stages.filter((stage) => stage.completed).length}/4
                </span>
              </div>

              <div className="revision-stages">
                {item.stages.map((stage) => {
                  const isOverdue =
                    !stage.completed && stage.dueDate < today;
                  const isDueToday =
                    !stage.completed && stage.dueDate === today;

                  return (
                    <button
                      key={stage.day}
                      className={`revision-stage ${
                        stage.completed ? "stage-completed" : ""
                      } ${isOverdue ? "stage-overdue" : ""}`}
                      onClick={() => toggleRevision(item.id, stage.day)}
                    >
                      {stage.completed ? (
                        <CheckCircle2 size={19} />
                      ) : (
                        <Clock size={19} />
                      )}

                      <span>Day {stage.day}</span>

                      <small>
                        {stage.completed
                          ? "Completed"
                          : isOverdue
                          ? "Overdue"
                          : isDueToday
                          ? "Due today"
                          : new Date(
                              stage.dueDate + "T00:00:00"
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
