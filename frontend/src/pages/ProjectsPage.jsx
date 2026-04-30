import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Users, Trash2, CheckCircle2, ListTodo } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ title: '', description: '' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}" and all its tasks?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      setProjects((p) => p.filter((proj) => proj._id !== id));
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-surface-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban size={40} className="mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400 font-medium">No projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <div key={project._id} className="glass-card-hover p-5 flex flex-col animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${project._id}`} className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate hover:text-brand-400 transition-colors">{project.title}</h3>
                </Link>
                {isAdmin && (
                  <button onClick={() => handleDelete(project._id, project.title)} className="p-1.5 text-surface-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="text-sm text-surface-400 line-clamp-2 mb-4 flex-1">{project.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-surface-700/40">
                <div className="flex items-center gap-3 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><Users size={13} />{project.members?.length || 0}</span>
                  <span className="flex items-center gap-1"><ListTodo size={13} />{project.taskCount || 0}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={13} />{project.completedCount || 0}</span>
                </div>
                <Link to={`/projects/${project._id}`} className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input className="input-field" placeholder="Project name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
