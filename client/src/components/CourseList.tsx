import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourses, getFolders, createFolder, moveCourseToFolder, deleteFolder as apiDeleteFolder } from '../api';
import { CreateCourseForm } from './CreateCourseForm';
import { FolderList } from './FolderList';
import { CourseItem } from './CourseItem';

interface UserOption { id: string; label: string; }

type Course = any;

function buildQuery(filters: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}


export function CourseList({
  token,
  onSelectCourse,
  isTeacher,
  userId,
}: {
  token: string;
  onSelectCourse: (id: string) => void;
  isTeacher?: boolean;
  userId: string;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderPopup, setShowFolderPopup] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [folderCourses, setFolderCourses] = useState<any[]>([]);
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({
    ownerId: '', name: '', teacherId: '', category: '', subCategory: ''
  });

  const [ownerLabel, setOwnerLabel] = useState('');
  const [teacherLabel, setTeacherLabel] = useState('');

  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);
  const [categoryLabel, setCategoryLabel] = useState('');
  const [subCategoryLabel, setSubCategoryLabel] = useState('');


  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  const navigate = useNavigate();
  const { courseId, folderId } = useParams();

  const fetchFolders = useCallback(() => {
    getFolders(token)
      .then(foldersFromApi => {
        setFolders(foldersFromApi);
      })
      .catch(() => setFolders([]));
  }, [token]);


  const getCourseIdsInFolders = (foldersList: any[]) => {
    const ids = new Set<string>();
    foldersList.forEach(folder => {
      if (Array.isArray(folder.childCourses)) {
        folder.childCourses.forEach((c: any) => {
          if (typeof c === 'object' && c.id) ids.add(c.id);
          else if (typeof c === 'string') ids.add(c);
        });
      }
    });
    return ids;
  };

  const fetchCourses = useCallback(() => {
    const query = buildQuery(filters);
    const url = `http://localhost:3000/course${query ? '?' + query : ''}`;
    console.log(url);
    Promise.all([getCourses(token, url), getFolders(token)]).then(([data, foldersFromApi]) => {
      setFolders(foldersFromApi);
      const courseIdsInFolders = getCourseIdsInFolders(foldersFromApi);

      const allStudentCourses = Array.isArray(data.studentCourses) ? data.studentCourses : [];
      const allTeacherCourses = [
        ...(Array.isArray(data.ownerCourses) ? data.ownerCourses : []),
        ...(Array.isArray(data.teacherCourses) ? data.teacherCourses : []),
      ];

      const uniqueStudentCourses = Array.from(
        new Map(allStudentCourses.map((c: any) => [c.id, c])).values()
      ).filter((c: any) => !courseIdsInFolders.has(c.id));
      const uniqueTeacherCourses = Array.from(
        new Map(allTeacherCourses.map((c: any) => [c.id, c])).values()
      ).filter((c: any) => !courseIdsInFolders.has(c.id));

      const map = new Map<string, string>();
      [...uniqueStudentCourses, ...uniqueTeacherCourses].forEach(c => {
        map.set(c.owner.id, `${c.owner.lastName} ${c.owner.firstName}`);
        (c.teachers || []).forEach((t: any) => map.set(t.id, `${t.lastName} ${t.firstName}`));
      });
      setUserOptions(Array.from(map.entries()).map(([id, label]) => ({ id, label })));

      setStudentCourses(uniqueStudentCourses);
      setTeacherCourses(uniqueTeacherCourses);

      const all = [...uniqueStudentCourses, ...uniqueTeacherCourses];
      const cats = Array.from(new Set(all.map(c => c.categoryName))).filter(Boolean);
      const subcats = Array.from(new Set(all.map(c => c.subCategoryName))).filter(Boolean);
      setCategoryOptions(cats);
      setSubCategoryOptions(subcats);


      setCourses([]);
      setError(null);
    }).catch(() => setError('Failed to load courses'));
  }, [token, filters]);

  useEffect(() => {
    fetchCourses();
  }, [token, filters]);

  const applyFilters = () => {
    const owner = userOptions.find(u => u.label === ownerLabel)?.id || '';
    const teacher = userOptions.find(u => u.label === teacherLabel)?.id || '';
    const newFilters = {
      ownerId: owner,
      name: filters.name,
      teacherId: teacher,
      category: categoryLabel,
      subCategory: subCategoryLabel,
    };
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({ ownerId: '', name: '', teacherId: '', category: '', subCategory: '' });
    setOwnerLabel('');
    setTeacherLabel('');
    setCategoryLabel('');
    setSubCategoryLabel('');
  };

  const addFilter = (key: string, value: string) => setFilters(f => ({ ...f, [key]: value }));

  const handleViewFolder = useCallback((folder: any) => {

    navigate(`/folders/${folder.id}`);
  }, [navigate]);

  const handleMoveCourse = async (courseId: string, folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await moveCourseToFolder(token, folderId, courseId);
      setShowFolderPopup(null);

      setFolders(prev => prev.map(f => {
        if (f.id === folderId) {
          const childCourses = Array.isArray(f.childCourses) ? [...f.childCourses] : [];
          if (!childCourses.some((c: any) => (typeof c === 'object' ? c.id : c) === courseId)) {
            childCourses.push(courseId);
          }
          return { ...f, childCourses };
        }
        return f;
      }));
      setStudentCourses(prev => prev.filter(c => c.id !== courseId));
      setTeacherCourses(prev => prev.filter(c => c.id !== courseId));
      setSelectedFolder(null);
    } catch {
      setFolderError('Failed to move course');
    } finally {
      setMoving(false);
    }
  };


  const handleCreateAndMove = async (courseId: string) => {
    if (!newFolderName.trim()) {
      setFolderError('Folder name required');
      return;
    }

    setMoving(true);
    setFolderError(null);
    try {
      const folder = await createFolder(token, newFolderName.trim(), userId, [courseId]);
      setShowFolderPopup(null);
      setNewFolderName('');
      setFolders(prev => [...prev, folder]);
      setStudentCourses(prev => prev.filter(c => c.id !== courseId));
      setTeacherCourses(prev => prev.filter(c => c.id !== courseId));
    } catch {
      setFolderError('Failed to create folder or move course');
    } finally {
      setMoving(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    setMoving(true);
    setFolderError(null);
    try {
      await apiDeleteFolder(token, folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setSelectedFolder(null);
    } catch {
      setFolderError('Failed to delete folder');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div>
      <h2>Курси</h2>
      {isTeacher && <CreateCourseForm token={token} onCreated={fetchCourses} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <FolderList
        folders={folders}
        onViewFolder={handleViewFolder}
        onDeleteFolder={deleteFolder}
        moving={moving}
      />

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Фільтри:
      </h2>
      <div
        style={{
          maxWidth: '64rem',
          margin: '0 1rem',
          padding: '1rem',
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Власник */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              Власник
            </label>
            <input
              list="owners"
              value={ownerLabel}
              onChange={e => setOwnerLabel(e.target.value)}
              style={{
                width: '93%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
            <datalist id="owners">
              {userOptions.map(u => <option key={u.id} value={u.label} />)}
            </datalist>
          </div>

          {/* Викладач */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              Викладач
            </label>
            <input
              list="teachers"
              value={teacherLabel}
              onChange={e => setTeacherLabel(e.target.value)}
              style={{
                width: '93%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
            <datalist id="teachers">
              {userOptions.map(u => <option key={u.id} value={u.label} />)}
            </datalist>
          </div>

          {/* Категорія */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              Категорія
            </label>
            <input
              list="categories"
              value={categoryLabel}
              onChange={e => setCategoryLabel(e.target.value)}
              style={{
                width: '93%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
            <datalist id="categories">
              {categoryOptions.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>

          {/* Підкатегорія */}
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              Підкатегорія
            </label>
            <input
              list="subCategories"
              value={subCategoryLabel}
              onChange={e => setSubCategoryLabel(e.target.value)}
              style={{
                width: '93%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
            />
            <datalist id="subCategories">
              {subCategoryOptions.map(sub => <option key={sub} value={sub} />)}
            </datalist>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button
              onClick={applyFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              🔍 Застосувати
            </button>
            <button
              onClick={resetFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            >
              ✖ Скинути
            </button>
          </div>
        </div>
      </div>


      {/* <div style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {Object.entries(filters).map(([key, value]) => (
          <div key={key}>
            <label style={{ marginRight: 4 }}>{key}:</label>
            <input
              type="text"
              value={value}
              onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
              style={{ padding: '4px 8px' }}
            />
          </div>
        ))}
        <button onClick={fetchCourses} style={{ padding: '4px 12px' }}>
          Використати фільтри
        </button>
      </div> */}

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Мої курси як студент:
        </h2>

        {studentCourses.length === 0 && <div>Курсів не знайдено.</div>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
            marginBottom: 24,
          }}
        >
          {studentCourses.map(course => (
            <div
              key={course.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div style={{ padding: '1rem', flexGrow: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {course.name}
                </div>

                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                    onClick={() =>
                      setOwnerLabel(`${course.owner.lastName} ${course.owner.firstName}`)
                    }
                  >
                    Власник: {course.owner.lastName} {course.owner.firstName}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                    onClick={() =>
                      setTeacherLabel(
                        `${course.teachers[0].lastName} ${course.teachers[0].firstName}`
                      )
                    }
                  >
                    Викладач: {course.teachers[0].lastName} {course.teachers[0].firstName}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                    onClick={() => setCategoryLabel(course.categoryName)}
                  >
                    Категорія: {course.categoryName}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                    onClick={() => setSubCategoryLabel(course.subCategoryName)}
                  >
                    Підкатегорія: {course.subCategoryName}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Переглянути
                </button>

                <button
                  onClick={() => {
                    setShowFolderPopup(course.id);
                    setFolderError(null);
                    setNewFolderName('');
                    fetchFolders();
                  }}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Перемістити у папку
                </button>

                {isTeacher && <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(course.id);
                    setCopiedCourseId(course.id);
                    setTimeout(() => setCopiedCourseId(null), 1500);
                  }}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Поділитися ID
                </button>}

                {copiedCourseId === course.id && (
                  <div style={{ color: 'green', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    ID скопійовано!
                  </div>
                )}

                {showFolderPopup === course.id && (
                  <CourseItem
                    course={course}
                    onSelectCourse={onSelectCourse}
                    folders={folders}
                    token={token}
                    userId={userId}
                    onMoveCourse={handleMoveCourse}
                    onCreateAndMove={handleCreateAndMove}
                    moving={moving}
                    folderError={folderError}
                    setFolderError={setFolderError}
                    setNewFolderName={setNewFolderName}
                    newFolderName={newFolderName}
                    showFolderPopup={showFolderPopup}
                    setShowFolderPopup={setShowFolderPopup}
                    fetchFolders={fetchFolders}
                    addFilter={addFilter}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Мої курси як викладач:
        </h2>

        {teacherCourses.length === 0 && <div>Курсів не знайдено.</div>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 12,
          }}
        >
          {teacherCourses.map(course => (
            <div
              key={course.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div style={{ padding: '1rem', flexGrow: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {course.name}
                </div>

                {/* Власник */}
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setOwnerLabel(`${course.owner.lastName} ${course.owner.firstName}`)
                    }
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                  >
                    Власник: {course.owner.lastName} {course.owner.firstName}
                  </span>
                </div>

                {/* Викладач */}
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setTeacherLabel(
                        `${course.teachers[0].lastName} ${course.teachers[0].firstName}`
                      )
                    }
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                  >
                    Викладач: {course.teachers[0].lastName} {course.teachers[0].firstName}
                  </span>
                </div>

                {/* Категорія */}
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCategoryLabel(course.categoryName)}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                  >
                    Категорія: {course.categoryName}
                  </span>
                </div>

                {/* Підкатегорія */}
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSubCategoryLabel(course.subCategoryName)}
                    onMouseOver={e => (e.currentTarget.style.fontWeight = '700')}
                    onMouseOut={e => (e.currentTarget.style.fontWeight = '400')}
                  >
                    Підкатегорія: {course.subCategoryName}
                  </span>
                </div>
              </div>

              {/* Кнопки внизу картки */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Переглянути
                </button>

                <button
                  onClick={() => {
                    setShowFolderPopup(course.id);
                    setFolderError(null);
                    setNewFolderName('');
                    fetchFolders();
                  }}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Перемістити у папку
                </button>

                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(course.id);
                    setCopiedCourseId(course.id);
                    setTimeout(() => setCopiedCourseId(null), 1500);
                  }}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    fontWeight: 500,
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Поділитися ID
                </button>

                {copiedCourseId === course.id && (
                  <div style={{ color: 'green', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    ID скопійовано!
                  </div>
                )}

                {showFolderPopup === course.id && (
                  <CourseItem
                    course={course}
                    onSelectCourse={onSelectCourse}
                    folders={folders}
                    token={token}
                    userId={userId}
                    onMoveCourse={handleMoveCourse}
                    onCreateAndMove={handleCreateAndMove}
                    moving={moving}
                    folderError={folderError}
                    setFolderError={setFolderError}
                    setNewFolderName={setNewFolderName}
                    newFolderName={newFolderName}
                    showFolderPopup={showFolderPopup}
                    setShowFolderPopup={setShowFolderPopup}
                    fetchFolders={fetchFolders}
                    addFilter={addFilter}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 16 },
  error: { color: 'red' },
  filterRow: { display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' },
  filterField: { display: 'flex', flexDirection: 'column' },
  filterInput: { padding: '4px 8px', minWidth: 120 },
  buttonPrimary: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  buttonSecondary: { padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 8px' },
  badges: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  badge: { background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' }
};
