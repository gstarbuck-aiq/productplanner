import { useState, useRef, useCallback } from 'react';
import { TimelineSettingsProvider } from './context/TimelineSettingsContext';
import { MilestoneProvider } from './context/MilestoneContext';
import { TaskProvider } from './context/TaskContext';
import { Header } from './components/Header/Header';
import { Timeline } from './components/Timeline/Timeline';
import { TaskForm } from './components/TaskForm/TaskForm';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { exportTimelineAsPNG } from './utils/exportTimeline';
import type { Task } from './types/task';
import './App.css';

function AppContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleOpenAddForm = () => {
    setEditTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = useCallback((task: Task) => {
    setEditTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTask(null);
  };

  const handleExportTimeline = useCallback(async () => {
    if (!timelineRef.current) {
      console.error('Timeline ref not available');
      return;
    }

    try {
      await exportTimelineAsPNG(timelineRef.current);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export timeline. Please try again.');
    }
  }, []);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        handleOpenAddForm();
      },
    },
  ]);

  return (
    <div className="app">
      <Header onAddTask={handleOpenAddForm} onExportTimeline={handleExportTimeline} />
      <main className="main-content" ref={timelineRef}>
        <Timeline onEditTask={handleOpenEditForm} />
      </main>
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editTask={editTask}
      />
    </div>
  );
}

function App() {
  return (
    <TimelineSettingsProvider>
      <MilestoneProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </MilestoneProvider>
    </TimelineSettingsProvider>
  );
}

export default App;
