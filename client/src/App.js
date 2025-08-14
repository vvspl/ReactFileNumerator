'use client';

import { useState, useRef } from 'react';
import './App.css';

const translations = {
  en: {
    title: 'File Manager',
    subtitle: 'Select files, add numbering and save with new names',
    fileManagement: '📁 File Management',
    openFiles: '+ Open Files',
    addNumbering: 'Add Numbering',
    removeNumbering: 'Remove Numbering',
    clearList: '× Clear List',
    numberingFormat: 'Numbering Format:',
    format1: '1_, 2_, 3_...',
    format2: '1. , 2. , 3. ...',
    saveDirectory: '💾 Save Directory',
    directoryPlaceholder: 'Enter folder path (e.g.: C:\\Users\\Username\\Documents\\MyFiles)',
    selectFolder: '📁 Select Folder',
    filesCount: '📋 {count} files',
    saving: '💾 Saving...',
    save: '💾 Save',
    noFiles: 'No files',
    noFilesHint: "Click 'Open Files' to select files from your computer",
    moveUp: 'Move up',
    moveDown: 'Move down',
    delete: 'Delete',
    fileTooLarge: '{name} is too large (maximum 100MB)',
    selectDirectoryError: 'Please select a directory for saving',
    noFilesToSave: 'No files to save',
    directoryError: 'Folder selection error: {error}',
    partialSuccess:
      'Partially successful: {success} files saved, {failed} failed. Errors: {errors}',
    saveSuccess: 'Successfully saved {count} files to selected folder!',
    browserNotSupported:
      "Your browser doesn't support direct file saving. Use Chrome or Edge for full functionality.",
    saveError: 'Save error: {error}',
    language: '🌐 Language',
  },
  ru: {
    title: 'Менеджер файлов',
    subtitle: 'Выберите файлы, добавьте нумерацию и сохраните с новыми именами',
    fileManagement: '📁 Управление файлами',
    openFiles: '+ Открыть файлы',
    addNumbering: 'Добавить нумерацию',
    removeNumbering: 'Убрать нумерацию',
    clearList: '× Очистить список',
    numberingFormat: 'Формат нумерации:',
    format1: '1_, 2_, 3_...',
    format2: '1. , 2. , 3. ...',
    saveDirectory: '💾 Директория для сохранения',
    directoryPlaceholder:
      'Введите путь к папке (например: C:\\Users\\Username\\Documents\\MyFiles)',
    selectFolder: '📁 Выбрать папку',
    filesCount: '📋 {count} файлов',
    saving: '💾 Сохранение...',
    save: '💾 Сохранить',
    noFiles: 'Нет файлов',
    noFilesHint: 'Нажмите "Открыть файлы" чтобы выбрать файлы с вашего компьютера',
    moveUp: 'Переместить вверх',
    moveDown: 'Переместить вниз',
    delete: 'Удалить',
    fileTooLarge: '{name} слишком большой (максимум 100MB)',
    selectDirectoryError: 'Пожалуйста, выберите директорию для сохранения',
    noFilesToSave: 'Нет файлов для сохранения',
    directoryError: 'Ошибка выбора папки: {error}',
    partialSuccess:
      'Частично успешно: {success} файлов сохранено, {failed} не удалось. Ошибки: {errors}',
    saveSuccess: 'Успешно сохранено {count} файлов в выбранную папку!',
    browserNotSupported:
      'Ваш браузер не поддерживает прямое сохранение файлов. Используйте Chrome или Edge для полной функциональности.',
    saveError: 'Ошибка при сохранении: {error}',
    language: '🌐 Язык',
  },
  uk: {
    title: 'Менеджер файлів',
    subtitle: 'Виберіть файли, додайте нумерацію та збережіть з новими іменами',
    fileManagement: '📁 Управління файлами',
    openFiles: '+ Відкрити файли',
    addNumbering: 'Додати нумерацію',
    removeNumbering: 'Прибрати нумерацію',
    clearList: '× Очистити список',
    numberingFormat: 'Формат нумерації:',
    format1: '1_, 2_, 3_...',
    format2: '1. , 2. , 3. ...',
    saveDirectory: '💾 Директорія для збереження',
    directoryPlaceholder:
      'Введіть шлях до папки (наприклад: C:\\Users\\Username\\Documents\\MyFiles)',
    selectFolder: '📁 Вибрати папку',
    filesCount: '📋 {count} файлів',
    saving: '💾 Збереження...',
    save: '💾 Зберегти',
    noFiles: 'Немає файлів',
    noFilesHint: 'Натисніть "Відкрити файли" щоб вибрати файли з вашого комп\'ютера',
    moveUp: 'Перемістити вгору',
    moveDown: 'Перемістити вниз',
    delete: 'Видалити',
    fileTooLarge: '{name} занадто великий (максимум 100MB)',
    selectDirectoryError: 'Будь ласка, виберіть директорію для збереження',
    noFilesToSave: 'Немає файлів для збереження',
    directoryError: 'Помилка вибору папки: {error}',
    partialSuccess:
      'Частково успішно: {success} файлів збережено, {failed} не вдалося. Помилки: {errors}',
    saveSuccess: 'Успішно збережено {count} файлів у вибрану папку!',
    browserNotSupported:
      'Ваш браузер не підтримує пряме збереження файлів. Використовуйте Chrome або Edge для повної функціональності.',
    saveError: 'Помилка при збереженні: {error}',
    language: '🌐 Мова',
  },
};

function App() {
  const [files, setFiles] = useState([]);
  const [numbering, setNumbering] = useState(false);
  const [numberingFormat, setNumberingFormat] = useState('1'); // "1", "1."
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [movingFileId, setMovingFileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const directoryInputRef = useRef(null);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('fileManagerLanguage') || 'ru';
  });

  const t = (key, params = {}) => {
    let text = translations[language][key] || key;

    // Replace parameters in text
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  };

  const handleLanguageChange = newLanguage => {
    setLanguage(newLanguage);
    localStorage.setItem('fileManagerLanguage', newLanguage);
  };

  const handleFileSelect = event => {
    const selectedFiles = Array.from(event.target.files);

    // Validate files
    const maxSize = 100 * 1024 * 1024; // 100MB
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(t('fileTooLarge', { name: file.name }));
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

        // Since we can't get full path due to security, show a more descriptive name
        const displayPath = `📁 ${handle.name}`;

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

  const removeExistingNumbering = fileName => {
    // Remove various numbering patterns from the beginning of filename
    const patterns = [
      /^\d+\.\s+/, // "1. ", "2. ", etc.
      /^\d+_/, // "1_", "2_", etc.
      /^\d{2,3}_/, // "01_", "001_", etc.
      /^[A-Z]_/, // "A_", "B_", etc.
    ];

    let cleanName = fileName;
    for (const pattern of patterns) {
      cleanName = cleanName.replace(pattern, '');
    }

    return cleanName;
  };

  const getFileName = (file, index) => {
    // If numbering is off, return clean name (remove any existing numbering)
    if (!numbering) {
      return removeExistingNumbering(file.name);
    }

    let number;
    switch (numberingFormat) {
      case '1.':
        number = `${index + 1}. `;
        break;
      default: // "1"
        number = `${index + 1}_`;
    }

    // Clean the original filename from any existing numbering
    const cleanName = removeExistingNumbering(file.name);
    const nameParts = cleanName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');

    return `${number}${baseName}.${extension}`;
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
      setError(t('selectDirectoryError'));
      return;
    }

    if (files.length === 0) {
      setError(t('noFilesToSave'));
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
            t('partialSuccess', {
              success: successCount,
              failed: failCount,
              errors: errors.join(', '),
            }),
          );
        } else {
          alert(t('saveSuccess', { count: successCount }));
          clearAllFiles();
          setSelectedDirectory('');
          setDirectoryHandle(null);
        }
      } else {
        setError(t('browserNotSupported'));
      }
    } catch (error) {
      console.error('Save error:', error);
      setError(t('saveError', { error: error.message }));
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
        <div className="language-selector">
          <label>{t('language')}:</label>
          <select value={language} onChange={e => handleLanguageChange(e.target.value)}>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
          </select>
        </div>

        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="controls">
          <h2>{t('fileManagement')}</h2>
          <div className="button-group">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              {t('openFiles')}
            </button>
            <button
              className={`btn ${numbering ? 'btn-success' : 'btn-secondary'}`}
              onClick={toggleNumbering}
            >
              # {numbering ? t('removeNumbering') : t('addNumbering')}
            </button>
            <button
              className="btn btn-danger"
              onClick={clearAllFiles}
              disabled={files.length === 0}
            >
              {t('clearList')}
            </button>
          </div>

          {numbering && (
            <div className="numbering-options">
              <label>{t('numberingFormat')}</label>
              <select value={numberingFormat} onChange={e => setNumberingFormat(e.target.value)}>
                <option value="1">{t('format1')}</option>
                <option value="1.">{t('format2')}</option>
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
          <h3>{t('saveDirectory')}</h3>
          <div className="directory-controls">
            <input
              type="text"
              className="directory-input"
              placeholder={t('directoryPlaceholder')}
              value={selectedDirectory}
              onChange={handleDirectoryChange}
              readOnly={directoryHandle !== null}
            />
            <button className="btn btn-secondary directory-btn" onClick={handleDirectoryPicker}>
              {t('selectFolder')}
            </button>
          </div>
        </div>

        <div className="file-list">
          <div className="file-list-header">
            <h3>{t('filesCount', { count: files.length })}</h3>
            {files.length > 0 && (
              <button
                className="btn btn-success"
                onClick={saveFiles}
                disabled={(!selectedDirectory && !directoryHandle) || loading}
              >
                {loading ? t('saving') : t('save')}
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <p>{t('noFiles')}</p>
              <p>{t('noFilesHint')}</p>
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                {t('openFiles')}
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
                      title={t('moveUp')}
                    >
                      ↑
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => moveFileDown(file.id)}
                      disabled={index === files.length - 1}
                      title={t('moveDown')}
                    >
                      ↓
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => removeFile(file.id)}
                      title={t('delete')}
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
