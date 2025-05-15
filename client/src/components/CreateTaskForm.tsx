import React, { useState } from 'react';
import { createTask, CreatedTask } from '../api';

export function CreateTaskForm({
  token,
  courseId,
  onCreated,
}: {
  token: string;
  courseId: string;
  onCreated: (task: CreatedTask) => void;
}) {
  const [form, setForm] = useState({ name: '', textContent: '' });
  const [time, setTime] = useState({ hours: '', minutes: '', seconds: '' });
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime({ ...time, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;

    const existing = files ? Array.from(files) : [];
    const all = [...existing, ...Array.from(newFiles)];

    const uniqueFiles = Array.from(new Map(all.map(f => [f.name, f])).values());

    const dt = new DataTransfer();
    uniqueFiles.forEach(f => dt.items.add(f));
    setFiles(dt.files);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (!files) return;
    const fileArray = Array.from(files);
    fileArray.splice(indexToRemove, 1);

    const dt = new DataTransfer();
    fileArray.forEach(file => dt.items.add(file));
    setFiles(dt.files);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('textContent', form.textContent);

      const h = parseInt(time.hours) || 0;
      const m = parseInt(time.minutes) || 0;
      const s = parseInt(time.seconds) || 0;
      const totalSeconds = h * 3600 + m * 60 + s;
      if (totalSeconds > 0) {
        formData.append('timeToComplete', totalSeconds.toString());
      }

      if (files) {
        Array.from(files).forEach(file => {
          formData.append('file', file);
        });
      }

      const createdTask = await createTask(token, courseId, formData);

      setForm({ name: '', textContent: '' });
      setTime({ hours: '', minutes: '', seconds: '' });
      setFiles(null);

      onCreated(createdTask);
    } catch (err) {
      setError('Не вдалось створити завдання');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h4 style={styles.title}>Створити завдання</h4>
      {error && <div style={styles.error}>{error}</div>}

      <input
        name="name"
        placeholder="Назва завдання"
        value={form.name}
        onChange={handleChange}
        required
        style={styles.input}
      />

      <textarea
        name="textContent"
        placeholder="Опис завдання"
        value={form.textContent}
        onChange={handleChange}
        required
        style={styles.textarea}
      />

      <div style={styles.timeGroup}>
        <label style={styles.label}>Час на виконання:</label>
        <input
          name="hours"
          type="number"
          min="0"
          step="1"
          placeholder="hh"
          value={time.hours}
          onChange={handleTimeChange}
          style={styles.timeInput}
        /> h
        <input
          name="minutes"
          type="number"
          min="0"
          max="59"
          step="1"
          placeholder="mm"
          value={time.minutes}
          onChange={handleTimeChange}
          style={styles.timeInput}
        /> m
        <input
          name="seconds"
          type="number"
          min="0"
          max="59"
          step="1"
          placeholder="ss"
          value={time.seconds}
          onChange={handleTimeChange}
          style={styles.timeInput}
        /> s
      </div>

      <label style={styles.label}>Прикріпити файли:</label>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ marginBottom: 16 }}
      />

      {files && files.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Вибрані файли:</strong>
          <ul style={{ paddingLeft: 20 }}>
            {Array.from(files).map((file, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    marginLeft: 12,
                    background: 'transparent',
                    color: 'red',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}


      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    marginTop: 50,
    marginBottom: 50,
    padding: 24,
    border: '1px solid #ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    maxWidth: 600,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  textarea: {
    display: 'block',
    width: '100%',
    minHeight: 100,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  timeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeInput: {
    width: 60,
    padding: 4,
    borderRadius: 4,
    border: '1px solid #ccc',
    marginLeft: 8,
  },
  label: {
    fontWeight: 'bold',
    display: 'block',
    marginBottom: 4,
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
};
