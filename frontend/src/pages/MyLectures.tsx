import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, FileText, Calendar, Download, Upload as UploadIcon } from 'lucide-react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { getAllLectures, deleteLecture, searchLectures, exportLectures, importLectures } from '../api/client';
import type { Lecture } from '../utils/db';

export function MyLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const data = await getAllLectures();
      setLectures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      await deleteLecture(id);
      setLectures(lectures.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lecture');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Lectures</h1>
            <p className="text-slate-600">View and manage your uploaded lectures</p>
          </div>
          
          {/* Export/Import Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Export all lectures as JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Import lectures from JSON">
              <UploadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
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
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Error Alert */}
        {error && <Alert type="error">{error}</Alert>}

        {/* Empty State */}
        {lectures.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No lectures found' : 'No lectures yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : 'Upload your first lecture to get started'}
            </p>
            {!searchTerm && (
              <Link to="/">
                <Button>Upload a Lecture</Button>
              </Link>
            )}
          </div>
        )}

        {/* Lectures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200"
            >
              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2">
                {lecture.title}
              </h3>

              {/* Metadata */}
              <div className="space-y-2 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
                </div>
                {lecture.flashcards && lecture.flashcards.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{lecture.flashcards.length} flashcards</span>
                  </div>
                )}
                {lecture.quiz && lecture.quiz.length > 0 && (
                  <div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {lecture.quiz.length} questions
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  lecture.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : lecture.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {lecture.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link to={`/lectures/${lecture.id}`} className="flex-1">
                  <Button variant="secondary" fullWidth>
                    View
                  </Button>
                </Link>
                <button
                  onClick={() => handleDelete(lecture.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Delete lecture"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        {lectures.length > 0 && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">{lectures.length}</div>
                <div className="text-sm text-slate-600 mt-1">Total Lectures</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {lectures.filter(l => l.status === 'completed').length}
                </div>
                <div className="text-sm text-slate-600 mt-1">Completed</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {lectures.reduce((sum, l) => sum + (l.flashcards?.length || 0), 0)}
                </div>
                <div className="text-sm text-slate-600 mt-1">Total Flashcards</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
