'use client';

import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [numbering, setNumbering] = useState(false);
  const [numberingFormat, setNumberingFormat] = useState('01'); // "01", "001", "1", "A"
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [movingFileId, setMovingFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const directoryInputRef = useRef(null);

  const handleFileSelect = event => {
    const selectedFiles = Array.from(event.target.files);

    // Validate files
    const maxSize = 100 * 1024 * 1024; // 100MB
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} слишком большой (максимум 100MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(''), 5000);
    }

    const newFiles = validFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      extension: file.name.split('.').pop().toLowerCase(),
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Reset input
    event.target.value = '';
  };

  const handleDirectoryChange = event => {
    const path = event.target.value.trim();
    setSelectedDirectory(path);
    if (path) {
      setError('');
    }
  };

  const handleDirectorySelect = event => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      // Extract directory path from file path
      const fullPath = file.webkitRelativePath || file.name;
      let directoryPath = '';

      if (file.webkitRelativePath) {
        // If webkitRelativePath exists, extract directory
        const pathParts = file.webkitRelativePath.split('/');
        pathParts.pop(); // Remove filename
        directoryPath = pathParts.join('/');
      } else {
        // For regular file selection, we can't get the full path due to security
        // So we'll use a placeholder and let user edit it
        directoryPath = 'Выбрана папка (отредактируйте путь при необходимости)';
      }

      setSelectedDirectory(directoryPath);
      setError('');
    }
    // Reset input
    event.target.value = '';
  };

  const handleDirectoryPicker = async () => {
    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        const handle = await window.showDirectoryPicker();
        setDirectoryHandle(handle);
        // Try to get a more descriptive path, fallback to name
        const displayPath = handle.name || 'Выбранная папка';
        setSelectedDirectory(displayPath);
        setError('');
      } else {
        // Fallback: use file input to get directory path
        directoryInputRef.current?.click();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(`Ошибка выбора папки: ${error.message}`);
      }
    }
  };

  const toggleNumbering = () => {
    setNumbering(!numbering);
  };

  const getFileName = (file, index) => {
    if (!numbering) return file.name;

    let number;
    switch (numberingFormat) {
      case '001':
        number = String(index + 1).padStart(3, '0');
        break;
      case '1':
        number = String(index + 1);
        break;
      case 'A':
        number = String.fromCharCode(65 + (index % 26)); // A, B, C...
        break;
      default: // "01"
        number = String(index + 1).padStart(2, '0');
    }

    const nameParts = file.name.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');

    return `${number}_${baseName}.${extension}`;
  };

  const moveFileUp = id => {
    setMovingFileId(id);
    setTimeout(() => setMovingFileId(null), 300);

    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index > 0) {
        const newFiles = [...prev];
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
        return newFiles;
      }
      return prev;
    });
  };

  const moveFileDown = id => {
    setMovingFileId(id);
    setTimeout(() => setMovingFileId(null), 300);

    setFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index < prev.length - 1) {
        const newFiles = [...prev];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        return newFiles;
      }
      return prev;
    });
  };

  const removeFile = id => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError('');
    setDirectoryHandle(null);
  };

  const saveFiles = async () => {
    if (!selectedDirectory && !directoryHandle) {
      setError('Пожалуйста, выберите директорию для сохранения');
      return;
    }

    if (files.length === 0) {
      setError('Нет файлов для сохранения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (directoryHandle && 'showDirectoryPicker' in window) {
        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          const newFileName = getFileName(file, index);

          try {
            // Create a new file in the selected directory
            const fileHandle = await directoryHandle.getFileHandle(newFileName, { create: true });
            const writable = await fileHandle.createWritable();

            // Write the file content
            await writable.write(file.file);
            await writable.close();

            successCount++;
          } catch (fileError) {
            console.error(`Error saving ${newFileName}:`, fileError);
            failCount++;
            errors.push(`${newFileName}: ${fileError.message}`);
          }
        }

        if (failCount > 0) {
          setError(
            `Частично успешно: ${successCount} файлов сохранено, ${failCount} не удалось. Ошибки: ${errors.join(
              ', ',
            )}`,
          );
        } else {
          alert(`Успешно сохранено ${successCount} файлов в выбранную папку!`);
          clearAllFiles();
          setSelectedDirectory('');
          setDirectoryHandle(null);
        }
      } else {
        setError(
          'Ваш браузер не поддерживает прямое сохранение файлов. Используйте Chrome или Edge для полной функциональности.',
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(`Ошибка при сохранении: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Менеджер файлов</h1>
        <p className="subtitle">Выберите файлы, добавьте нумерацию и сохраните с новыми именами</p>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="controls">
          <h2>📁 Управление файлами</h2>
          <div className="button-group">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              + Открыть файлы
            </button>
            <button
              className={`btn ${numbering ? 'btn-success' : 'btn-secondary'}`}
              onClick={toggleNumbering}
            >
              # {numbering ? 'Убрать нумерацию' : 'Добавить нумерацию'}
            </button>
            <button
              className="btn btn-danger"
              onClick={clearAllFiles}
              disabled={files.length === 0}
            >
              × Очистить список
            </button>
          </div>

          {numbering && (
            <div className="numbering-options">
              <label>Формат нумерации:</label>
              <select value={numberingFormat} onChange={e => setNumberingFormat(e.target.value)}>
                <option value="01">01, 02, 03...</option>
                <option value="001">001, 002, 003...</option>
                <option value="1">1, 2, 3...</option>
                <option value="A">A, B, C...</option>
              </select>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <input
            ref={directoryInputRef}
            type="file"
            onChange={handleDirectorySelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="directory-selector">
          <h3>💾 Директория для сохранения</h3>
          <div className="directory-controls">
            <input
              type="text"
              className="directory-input"
              placeholder="Введите путь к папке (например: C:\Users\Username\Documents\MyFiles)"
              value={selectedDirectory}
              onChange={handleDirectoryChange}
              readOnly={directoryHandle !== null}
            />
            <button className="btn btn-secondary directory-btn" onClick={handleDirectoryPicker}>
              📁 Выбрать папку
            </button>
            <div className="directory-hint">
              {'showDirectoryPicker' in window
                ? "Нажмите 'Выбрать папку' для выбора директории. Браузер покажет окно подтверждения - это нормально для безопасности."
                : "Введите путь к папке вручную или нажмите 'Выбрать папку' и выберите любой файл из нужной директории"}
            </div>
          </div>
        </div>

        <div className="file-list">
          <div className="file-list-header">
            <h3>📋 {files.length} файлов</h3>
            {files.length > 0 && (
              <button
                className="btn btn-success"
                onClick={saveFiles}
                disabled={(!selectedDirectory && !directoryHandle) || loading}
              >
                {loading ? '💾 Сохранение...' : '💾 Сохранить'}
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <p>Нет файлов</p>
              <p>Нажмите "Открыть файлы" чтобы выбрать файлы с вашего компьютера</p>
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                + Открыть файлы
              </button>
            </div>
          ) : (
            <div className="files">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className={`file-item ${movingFileId === file.id ? 'moving' : ''}`}
                >
                  <div className="file-info">
                    <div className="file-name">{getFileName(file, index)}</div>
                    <div className="file-details">
                      {formatFileSize(file.size)} • {file.type || file.extension || 'unknown'}
                    </div>
                  </div>
                  <div className="file-controls">
                    <button
                      className="btn-icon"
                      onClick={() => moveFileUp(file.id)}
                      disabled={index === 0}
                      title="Переместить вверх"
                    >
                      ↑
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => moveFileDown(file.id)}
                      disabled={index === files.length - 1}
                      title="Переместить вниз"
                    >
                      ↓
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => removeFile(file.id)}
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
