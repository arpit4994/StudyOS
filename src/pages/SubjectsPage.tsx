
import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";

type Chapter = {
  id: number;
  title: string;
  completed: boolean;
};

type Subject = {
  id: number;
  name: string;
  chapters: Chapter[];
};

const STORAGE_KEY = "study-os-subjects";

const defaultSubjects: Subject[] = [
  { id: 1, name: "Accountancy", chapters: [] },
  { id: 2, name: "Business Studies", chapters: [] },
  { id: 3, name: "Economics", chapters: [] },
  { id: 4, name: "Applied Mathematics", chapters: [] },
  { id: 5, name: "English", chapters: [] },
];

function loadSubjects(): Subject[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultSubjects;
  } catch {
    return defaultSubjects;
  }
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [newSubject, setNewSubject] = useState("");
  const [chapterInputs, setChapterInputs] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    window.dispatchEvent(new Event("study-os-subjects-updated"));
  }, [subjects]);

  const totalChapters = subjects.reduce(
    (total, subject) => total + subject.chapters.length, 0
  );

  const completedChapters = subjects.reduce(
    (total, subject) =>
      total + subject.chapters.filter((chapter) => chapter.completed).length,
    0
  );

  const overallProgress = totalChapters
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  const addSubject = () => {
    const name = newSubject.trim();
    if (!name) return;

    if (subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) {
      alert("This subject already exists.");
      return;
    }

    setSubjects((prev) => [
      ...prev,
      { id: Date.now(), name, chapters: [] },
    ]);
    setNewSubject("");
  };

  const deleteSubject = (id: number) => {
    if (!window.confirm("Delete this subject and all its chapters?")) return;
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  const addChapter = (subjectId: number) => {
    const title = chapterInputs[subjectId]?.trim();
    if (!title) return;

    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              chapters: [
                ...subject.chapters,
                { id: Date.now(), title, completed: false },
              ],
            }
          : subject
      )
    );

    setChapterInputs((prev) => ({ ...prev, [subjectId]: "" }));
  };

  const toggleChapter = (subjectId: number, chapterId: number) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              chapters: subject.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? { ...chapter, completed: !chapter.completed }
                  : chapter
              ),
            }
          : subject
      )
    );
  };

  const deleteChapter = (subjectId: number, chapterId: number) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              chapters: subject.chapters.filter(
                (chapter) => chapter.id !== chapterId
              ),
            }
          : subject
      )
    );
  };

  const toggleExpanded = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-content subjects-page">
      <div className="subjects-header">
        <div>
          <span className="section-eyebrow">ACADEMIC MANAGEMENT</span>
          <h1>Subjects & Chapters</h1>
          <p>Organise your syllabus and track your learning progress.</p>
        </div>
      </div>

      <div className="subjects-overview">
        <div className="subject-stat">
          <span>Total Subjects</span>
          <strong>{subjects.length}</strong>
        </div>
        <div className="subject-stat">
          <span>Total Chapters</span>
          <strong>{totalChapters}</strong>
        </div>
        <div className="subject-stat">
          <span>Completed</span>
          <strong>{completedChapters}</strong>
        </div>
        <div className="subject-stat">
          <span>Syllabus Progress</span>
          <strong>{overallProgress}%</strong>
        </div>
      </div>

      <div className="subjects-progress-panel">
        <div className="subjects-progress-heading">
          <div>
            <h3>Overall Syllabus Progress</h3>
            <p>{completedChapters} of {totalChapters} chapters completed</p>
          </div>
          <strong>{overallProgress}%</strong>
        </div>
        <div className="subjects-progress-track">
          <div style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      <div className="subjects-list-header">
        <div>
          <h2>Your Subjects</h2>
          <p>Manage your subjects and their chapters.</p>
        </div>
        <div className="add-subject-control">
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
            placeholder="New subject name"
          />
          <button onClick={addSubject}>
            <Plus size={17} /> Add Subject
          </button>
        </div>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject) => {
          const completed = subject.chapters.filter((c) => c.completed).length;
          const total = subject.chapters.length;
          const progress = total ? Math.round((completed / total) * 100) : 0;
          const isExpanded = expanded.includes(subject.id);

          return (
            <div className="subject-card" key={subject.id}>
              <div className="subject-card-header">
                <button
                  className="subject-expand-button"
                  onClick={() => toggleExpanded(subject.id)}
                >
                  <div className="subject-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="subject-title-area">
                    <h3>{subject.name}</h3>
                    <span>{completed}/{total} chapters completed</span>
                  </div>
                  {isExpanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                </button>
                <button
                  className="subject-delete-button"
                  onClick={() => deleteSubject(subject.id)}
                  title="Delete subject"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="subject-progress-row">
                <div className="subject-progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>

              {isExpanded && (
                <div className="subject-chapters">
                  {subject.chapters.length === 0 ? (
                    <p className="empty-chapters">No chapters added yet.</p>
                  ) : (
                    subject.chapters.map((chapter) => (
                      <div className="subject-chapter" key={chapter.id}>
                        <button
                          className="chapter-toggle"
                          onClick={() => toggleChapter(subject.id, chapter.id)}
                        >
                          {chapter.completed ? (
                            <CheckCircle2 size={18} className="chapter-completed-icon" />
                          ) : (
                            <Circle size={18} />
                          )}
                          <span className={chapter.completed ? "completed" : ""}>
                            {chapter.title}
                          </span>
                        </button>
                        <button
                          className="chapter-delete-button"
                          onClick={() => deleteChapter(subject.id, chapter.id)}
                          title="Delete chapter"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}

                  <div className="add-chapter-control">
                    <input
                      value={chapterInputs[subject.id] || ""}
                      onChange={(e) =>
                        setChapterInputs((prev) => ({
                          ...prev,
                          [subject.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addChapter(subject.id)
                      }
                      placeholder="Enter chapter name"
                    />
                    <button onClick={() => addChapter(subject.id)}>
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
