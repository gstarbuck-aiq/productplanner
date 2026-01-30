import { useState } from 'react';
import { TimelineSettingsProvider } from './context/TimelineSettingsContext';
import { TaskProvider } from './context/TaskContext';
import { Header } from './components/Header/Header';
import { Timeline } from './components/Timeline/Timeline';
import { TaskForm } from './components/TaskForm/TaskForm';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Task } from './types/task';
import './App.css';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleOpenAddForm = () => {
    setEditTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTask(null);
  };

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
    <TimelineSettingsProvider>
      <TaskProvider>
        <div className="app">
          <Header onAddTask={handleOpenAddForm} />
          <main className="main-content">
            <Timeline onEditTask={handleOpenEditForm} />
          </main>
          <TaskForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            editTask={editTask}
          />
        </div>
      </TaskProvider>
    </TimelineSettingsProvider>
  );
}

export default App;
