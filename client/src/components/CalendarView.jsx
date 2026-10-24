import React, { useState } from 'react';

export default function CalendarView({ events, tasks, onAddEvent, onDeleteEvent, onToggleTask }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(selectedDate);
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('11:00');
  const [newLoc, setNewLoc] = useState('Google Meet');
  const [newCat, setNewCat] = useState('Meeting');

  // Days list for horizontal picker (upcoming 10 days)
  const days = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum };
  });

  const dayEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const dayTasks = tasks.filter(t => t.dueDate === selectedDate);

  // Conflict detection
  const conflictingIds = new Set();
  for (let i = 0; i < dayEvents.length; i++) {
    for (let j = i + 1; j < dayEvents.length; j++) {
      const e1 = dayEvents[i];
      const e2 = dayEvents[j];
      if (e1.startTime < e2.endTime && e2.startTime < e1.endTime) {
        conflictingIds.add(e1.id);
        conflictingIds.add(e2.id);
      }
    }
  }

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      location: newLoc,
      category: newCat
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Calendar & Schedule</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Timeline management with smart conflict detection</p>
        </div>
        <button
          onClick={() => {
            setNewDate(selectedDate);
            setShowAddModal(true);
          }}
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
          + Schedule Event
        </button>
      </div>

      {/* Horizontal Day Picker */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto'
      }}>
        {days.map(({ dateStr, dayName, dayNum }) => {
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              style={{
                background: isSelected ? 'linear-gradient(135deg, var(--cyan), var(--indigo))' : 'var(--bg-input)',
                border: isSelected ? 'none' : '1px solid var(--border)',
                borderRadius: '14px',
                padding: '12px 18px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '64px',
                boxShadow: isSelected ? '0 4px 14px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', opacity: isSelected ? 0.9 : 0.6 }}>
                {dayName}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '800' }}>
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conflict Warning Banner */}
      {conflictingIds.size > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fca5a5'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>Schedule Conflict Detected!</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Overlapping events found on {selectedDate}. Adjust meeting times to prevent conflicts.</div>
          </div>
        </div>
      )}

      {/* Day Agenda Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Events on {selectedDate}</h3>
        {dayEvents.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '36px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
            <div>No events scheduled for this date.</div>
          </div>
        ) : (
          dayEvents.map(event => {
            const hasConflict = conflictingIds.has(event.id);
            return (
              <div
                key={event.id}
                style={{
                  background: hasConflict ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
                  border: hasConflict ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* Time badge */}
                <div style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  minWidth: '90px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--cyan)' }}>{event.startTime}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{event.endTime}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>{event.title}</span>
                    {hasConflict && (
                      <span style={{ background: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        CONFLICT
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>📍 {event.location || 'Online'}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--cyan)' }}>{event.category}</span>
                  </div>
                  {event.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {event.description}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteEvent(event.id)}
                  title="Remove event"
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '16px', padding: '8px' }}
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Linked Tasks Due on this date */}
      {dayTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Tasks Due on this Date ({dayTasks.length})</h3>
          {dayTasks.map(task => (
            <div
              key={task.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => onToggleTask(task.id)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--cyan)' }}
              />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--text-muted)' : '#fff' }}>
                {task.title}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
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
            onSubmit={handleCreateEvent}
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
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Schedule Event</h3>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Event Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Team Sync"
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Start Time</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>End Time</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Location or Video Link</label>
              <input
                type="text"
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                placeholder="e.g., Google Meet / Room 302"
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
              />
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
                Confirm Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
