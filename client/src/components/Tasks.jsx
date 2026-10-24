import React, { useState } from 'react';

export default function Tasks({ tasks, onToggleTask, onDeleteTask, onAddTask }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // Pending, Completed, All
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState('Medium');
  const [newCategory, setNewCategory] = useState('Work');

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter === 'All' ? true : statusFilter === 'Pending' ? !t.isCompleted : t.isCompleted;
    const matchesCat = categoryFilter === 'All' ? true : t.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !search ? true : t.title.toLowerCase().includes(search.toLowerCase()) || (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesCat && matchesSearch;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      dueDate: newDate,
      priority: newPriority,
      category: newCategory
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & New Task Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Tasks & To-Dos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Organize, filter, and track daily action items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(135deg, var(--cyan), var(--indigo))',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
          }}
        >
          + New Task
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#fff',
            fontSize: '14px',
            minWidth: '240px',
            outline: 'none'
          }}
        />

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['Pending', 'Completed', 'All'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? 'var(--cyan)' : 'var(--bg-input)',
                color: statusFilter === s ? '#0f172a' : 'var(--text-muted)',
                fontWeight: statusFilter === s ? '700' : '500',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Work', 'Personal', 'Study', 'Health'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              style={{
                background: categoryFilter === c ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                color: categoryFilter === c ? 'var(--cyan)' : 'var(--text-muted)',
                fontWeight: categoryFilter === c ? '700' : '500',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>No tasks found in this view</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>Tap '+ New Task' or ask Daypilot in chat to add one.</div>
          </div>
        ) : (
          filteredTasks.map(task => {
            const priorityColor = task.priority === 'Urgent' ? 'var(--danger)' : task.priority === 'High' ? 'var(--warning)' : 'var(--cyan)';
            return (
              <div
                key={task.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => onToggleTask(task.id)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--cyan)' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: task.isCompleted ? 'var(--text-muted)' : '#fff',
                    textDecoration: task.isCompleted ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', marginTop: '6px', alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${priorityColor}`,
                      color: priorityColor,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: '700'
                    }}>
                      {task.priority}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{task.category}</span>
                    {task.dueDate && (
                      <>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>Due: {task.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  title="Delete task"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '8px'
                  }}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <form
            onSubmit={handleCreateTask}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Create New Task</h3>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Task Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Finish proposal review"
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Additional notes or context..."
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Due Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#fff',
                  outline: 'none'
                }}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'var(--cyan)', border: 'none', color: '#0f172a', fontWeight: '700', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
