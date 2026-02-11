import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, FileText, Calendar, Download, Upload as UploadIcon, X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { getAllLectures, deleteLecture, searchLectures, exportLectures, importLectures } from '../api/client';
import type { Lecture } from '../utils/db';

export function MyLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; lectureId: string; lectureTitle: string }>({ 
    open: false, 
    lectureId: '', 
    lectureTitle: '' 
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLectures();
      setLectures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const lecture = lectures.find(l => l.id === id);
    if (lecture) {
      setDeleteModal({ open: true, lectureId: id, lectureTitle: lecture.title });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.lectureId) return;
    try {
      setIsDeleting(true);
      await deleteLecture(deleteModal.lectureId);
      setLectures(lectures.filter(l => l.id !== deleteModal.lectureId));
      setDeleteModal({ open: false, lectureId: '', lectureTitle: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lecture');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      fetchLectures();
      return;
    }
    try {
      const results = await searchLectures(term);
      setLectures(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportLectures();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lectureiq-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importLectures(text);
      await fetchLectures();
      alert('Lectures imported successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="font-serif text-5xl font-bold text-brand-navy mb-3">My Lectures</h1>
            <p className="text-slate-700 text-lg font-light">Manage and study your lecture materials</p>
          </div>
          
          {/* Export/Import Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-200"
              title="Export all lectures as JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Export</span>
            </button>
            <label
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-300 bg-white text-brand-navy hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              title="Import lectures from JSON"
            >
              <UploadIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search lectures by title..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
          />
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" title="Error" message={error} />}

        {/* Empty State */}
        {lectures.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-brand-navy mb-2">
              {searchTerm ? 'No lectures found' : 'No lectures yet'}
            </h3>
            <p className="text-slate-700 mb-8 text-lg font-light">
              {searchTerm
                ? 'Try a different search term'
                : 'Upload your first lecture to start building study materials'}
            </p>
            {!searchTerm && (
              <Link to="/">
                <button className="px-6 py-3 bg-brand-navy text-white font-semibold rounded transition-all duration-200 hover:shadow-lg active:scale-95">
                  Upload a Lecture
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Lectures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-slate-50 rounded border border-slate-200 p-6 hover:shadow-md transition-all duration-200 hover:bg-white"
            >
              {/* Title */}
              <h3 className="text-lg font-bold text-brand-navy mb-3 line-clamp-2">
                {lecture.title}
              </h3>

              {/* Metadata */}
              <div className="space-y-2 mb-5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
                </div>
                {lecture.flashcards && lecture.flashcards.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-brand-navy">{lecture.flashcards.length} flashcards</span>
                  </div>
                )}
                {lecture.quiz && lecture.quiz.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-emerald/10 text-brand-emerald">
                      {lecture.quiz.length} practice questions
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-5">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded ${
                  lecture.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : lecture.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Link to={`/lectures/${lecture.id}`} className="flex-1">
                  <button className="w-full px-4 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded transition-all duration-200 hover:shadow-md active:scale-95">
                    View Study Pack
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(lecture.id)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded border border-red-200 transition-all duration-200 font-medium text-sm flex items-center gap-2"
                  title="Delete this lecture"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        {lectures.length > 0 && (
          <div className="mt-16 p-8 bg-brand-navy text-white rounded-lg">
            <h3 className="font-serif text-2xl font-bold mb-6">Your Learning Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="font-serif text-4xl font-bold text-brand-emerald">{lectures.length}</div>
                <div className="text-sm text-slate-300 mt-2">Lectures Uploaded</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-4xl font-bold text-brand-emerald">
                  {lectures.filter(l => l.status === 'completed').length}
                </div>
                <div className="text-sm text-slate-300 mt-2">Processed</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-4xl font-bold text-brand-emerald">
                  {lectures.reduce((sum, l) => sum + (l.flashcards?.length || 0), 0)}
                </div>
                <div className="text-sm text-slate-300 mt-2">Flashcards</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-4xl font-bold text-brand-emerald">
                  {lectures.reduce((sum, l) => sum + (l.quiz?.length || 0), 0)}
                </div>
                <div className="text-sm text-slate-300 mt-2">Questions</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in scale-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 px-6 py-4 border-b border-red-200 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-brand-navy">Delete Lecture?</h3>
                  <p className="text-xs text-slate-600 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ open: false, lectureId: '', lectureTitle: '' })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-slate-700 mb-2">You're about to permanently delete:</p>
              <p className="break-words font-serif text-brand-navy font-semibold text-sm bg-slate-50 p-3 rounded border border-slate-200 mb-4">
                "{deleteModal.lectureTitle}"
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                All associated notes, flashcards, and quiz questions will be deleted. This action is permanent and cannot be recovered.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, lectureId: '', lectureTitle: '' })}
                disabled={isDeleting}
                className="px-5 py-2 rounded border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors disabled:opacity-50"
              >
                Keep It
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Lecture
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
