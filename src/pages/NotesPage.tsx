
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Pencil,
  X,
  BookOpen,
  FileText,
} from "lucide-react";

type Note = {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "study-os-notes";

function loadNotes(): Note[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const categories = [
    "All",
    "General",
    "Accountancy",
    "Business Studies",
    "Economics",
    "Applied Mathematics",
    "English",
    "CUET",
  ];

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ||
        note.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  function openNewNote() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategory("General");
    setShowEditor(true);
  }

  function openEditNote(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setShowEditor(true);
  }

  function saveNote(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    const updatedAt = new Date().toISOString();

    if (editingId !== null) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                category,
                updatedAt,
              }
            : note
        )
      );
    } else {
      setNotes((prev) => [
        {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          category,
          pinned: false,
          updatedAt,
        },
        ...prev,
      ]);
    }

    setShowEditor(false);
  }

  function deleteNote(id: number) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  function togglePin(id: number) {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, pinned: !note.pinned }
          : note
      )
    );
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div>
          <p className="eyebrow">YOUR KNOWLEDGE LIBRARY</p>
          <h1>Notes</h1>
          <p className="welcome-subtitle">
            Capture ideas, save important concepts and revise smarter.
          </p>
        </div>

        <button className="primary-button" onClick={openNewNote}>
          <Plus size={17} /> Create Note
        </button>
      </div>

      <section className="notes-stats">
        <article className="glass stat-card">
          <div className="stat-top">
            <span>Total Notes</span>
            <FileText size={19} />
          </div>
          <h2>{notes.length}</h2>
          <p>Your saved knowledge</p>
        </article>

        <article className="glass stat-card">
          <div className="stat-top">
            <span>Pinned Notes</span>
            <Pin size={19} />
          </div>
          <h2>{notes.filter((note) => note.pinned).length}</h2>
          <p>Quick access notes</p>
        </article>

        <article className="glass stat-card">
          <div className="stat-top">
            <span>Categories</span>
            <BookOpen size={19} />
          </div>
          <h2>
            {new Set(notes.map((note) => note.category)).size}
          </h2>
          <p>Subjects and topics</p>
        </article>
      </section>

      <section className="glass panel notes-library">
        <div className="notes-toolbar">
          <label className="notes-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
            />
          </label>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="notes-filter"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={25} />
            </div>
            <h4>
              {notes.length === 0
                ? "Your notebook is empty"
                : "No matching notes"}
            </h4>
            <p>
              Create your first note to start building your knowledge library.
            </p>
            <button
              className="secondary-button"
              onClick={openNewNote}
            >
              <Plus size={16} /> Create a note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <span className="note-category">
                    {note.category}
                  </span>

                  <button
                    className={`note-icon-button ${
                      note.pinned ? "pinned" : ""
                    }`}
                    onClick={() => togglePin(note.id)}
                    aria-label="Toggle pin"
                  >
                    <Pin size={16} />
                  </button>
                </div>

                <h3>{note.title}</h3>

                <p className="note-preview">{note.content}</p>

                <div className="note-card-footer">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>

                  <div>
                    <button
                      className="note-icon-button"
                      onClick={() => openEditNote(note)}
                      aria-label="Edit note"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="note-icon-button"
                      onClick={() => deleteNote(note.id)}
                      aria-label="Delete note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showEditor && (
        <div className="note-modal-backdrop">
          <form className="glass note-modal" onSubmit={saveNote}>
            <div className="note-modal-heading">
              <div>
                <h3>{editingId !== null ? "Edit Note" : "Create Note"}</h3>
                <p>Write down what you want to remember.</p>
              </div>

              <button
                type="button"
                className="note-icon-button"
                onClick={() => setShowEditor(false)}
                aria-label="Close editor"
              >
                <X size={19} />
              </button>
            </div>

            <label>
              Note Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Important Accounting Formulas"
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories
                  .filter((item) => item !== "All")
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Note Content
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here..."
              />
            </label>

            <button type="submit" className="primary-button">
              {editingId !== null ? "Update Note" : "Save Note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
