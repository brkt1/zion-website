import { useEffect, useState } from 'react';
import {
  FaBook,
  FaChevronDown,
  FaChevronRight,
  FaEdit,
  FaGraduationCap,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';

interface Course {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface CourseWeek {
  id: string;
  course_id: string;
  week_number: number;
  theme: string;
  goal: string;
  display_order: number;
}

interface CourseLesson {
  id: string;
  week_id: string;
  lesson_id: string;
  date: string;
  topic: string;
  time: string;
  activity: string;
  deliverables: string;
  content?: string;
  key_concepts?: string[];
  videos?: Array<{ topic: string; youtubeId?: string; description?: string }>;
  notes?: string;
  display_order: number;
}

const Courses = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingWeek, setEditingWeek] = useState<CourseWeek | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    display_order: 0,
  });

  const [weekFormData, setWeekFormData] = useState({
    course_id: '',
    week_number: 1,
    theme: '',
    goal: '',
    display_order: 0,
  });

  const [lessonFormData, setLessonFormData] = useState({
    week_id: '',
    lesson_id: '',
    date: '',
    topic: '',
    time: '',
    activity: '',
    deliverables: '',
    content: '',
    key_concepts: [] as string[],
    videos: [] as Array<{ topic: string; youtubeId?: string; description?: string }>,
    notes: '',
    display_order: 0,
  });

  const [newKeyConcept, setNewKeyConcept] = useState('');
  const [newVideo, setNewVideo] = useState({ topic: '', youtubeId: '', description: '' });

  const [testFormData, setTestFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    passing_score: 75,
    time_limit: null as number | null,
    max_attempts: 3,
    is_active: true,
    display_order: 0,
  });

  const [questionFormData, setQuestionFormData] = useState({
    test_id: '',
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer',
    options: [] as Array<{ text: string; is_correct: boolean }>,
    correct_answer: '',
    points: 1,
    display_order: 0,
  });

  const [newOption, setNewOption] = useState({ text: '', is_correct: false });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/login';
        return;
      }
      loadCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await adminApi.courses.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      alert('Error loading courses: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeks = async (courseId: string) => {
    try {
      setLoadingWeeks(true);
      const data = await adminApi.courseWeeks.getByCourseId(courseId);
      setWeeks(data);
    } catch (error) {
      console.error('Error loading weeks:', error);
      alert('Error loading weeks: ' + (error as Error).message);
    } finally {
      setLoadingWeeks(false);
    }
  };

  const loadLessons = async (weekId: string) => {
    try {
      setLoadingLessons(true);
      const data = await adminApi.courseLessons.getByWeekId(weekId);
      console.log('Loaded lessons for week:', weekId, data);
      // Merge with existing lessons instead of replacing
      setLessons(prevLessons => {
        const existing = prevLessons.filter(l => l.week_id !== weekId);
        return [...existing, ...(data || [])];
      });
    } catch (error) {
      console.error('Error loading lessons:', error);
      alert('Error loading lessons: ' + (error as Error).message);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await adminApi.courses.update(editingCourse.id, courseFormData);
      } else {
        await adminApi.courses.create(courseFormData);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      resetCourseForm();
      loadCourses();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleWeekSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWeek) {
        await adminApi.courseWeeks.update(editingWeek.id, weekFormData);
      } else {
        await adminApi.courseWeeks.create(weekFormData);
      }
      setShowWeekModal(false);
      setEditingWeek(null);
      resetWeekForm();
      if (selectedCourseId) {
        loadWeeks(selectedCourseId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await adminApi.courseLessons.update(editingLesson.id, lessonFormData);
      } else {
        await adminApi.courseLessons.create(lessonFormData);
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      resetLessonForm();
      if (selectedCourseId) {
        await loadAllLessonsForCourse(selectedCourseId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description || '',
      is_active: course.is_active,
      display_order: course.display_order,
    });
    setShowCourseModal(true);
  };

  const handleEditWeek = (week: CourseWeek) => {
    setEditingWeek(week);
    setWeekFormData({
      course_id: week.course_id,
      week_number: week.week_number,
      theme: week.theme,
      goal: week.goal,
      display_order: week.display_order,
    });
    setShowWeekModal(true);
  };

  const handleEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      week_id: lesson.week_id,
      lesson_id: lesson.lesson_id,
      date: lesson.date,
      topic: lesson.topic,
      time: lesson.time,
      activity: lesson.activity,
      deliverables: lesson.deliverables,
      content: lesson.content || '',
      key_concepts: lesson.key_concepts || [],
      videos: Array.isArray(lesson.videos) ? lesson.videos : [],
      notes: lesson.notes || '',
      display_order: lesson.display_order,
    });
    setShowLessonModal(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will delete all weeks and lessons.')) return;
    try {
      await adminApi.courses.delete(id);
      loadCourses();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteWeek = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this week? This will delete all lessons in this week.')) return;
    try {
      await adminApi.courseWeeks.delete(id);
      if (selectedCourseId) {
        loadWeeks(selectedCourseId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await adminApi.courseLessons.delete(id);
      if (selectedCourseId) {
        await loadAllLessonsForCourse(selectedCourseId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
  };

  const resetWeekForm = () => {
    setWeekFormData({
      course_id: selectedCourseId || '',
      week_number: 1,
      theme: '',
      goal: '',
      display_order: 0,
    });
  };

  const resetLessonForm = () => {
    setLessonFormData({
      week_id: '',
      lesson_id: '',
      date: '',
      topic: '',
      time: '',
      activity: '',
      deliverables: '',
      content: '',
      key_concepts: [],
      videos: [],
      notes: '',
      display_order: 0,
    });
    setNewKeyConcept('');
    setNewVideo({ topic: '', youtubeId: '', description: '' });
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert null to undefined for time_limit to match API types
      const testData = {
        ...testFormData,
        time_limit: testFormData.time_limit ?? undefined,
      };
      if (editingTest) {
        await adminApi.courseTests.update(editingTest.id, testData);
      } else {
        await adminApi.courseTests.create(testData);
      }
      setShowTestModal(false);
      setEditingTest(null);
      resetTestForm();
      if (selectedCourseId) {
        await loadTest(selectedCourseId);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await adminApi.testQuestions.update(editingQuestion.id, questionFormData);
      } else {
        await adminApi.testQuestions.create(questionFormData);
      }
      setShowQuestionModal(false);
      setEditingQuestion(null);
      resetQuestionForm();
      if (test) {
        await loadTest(test.course_id);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetTestForm = () => {
    setTestFormData({
      course_id: selectedCourseId || '',
      title: '',
      description: '',
      passing_score: 75,
      time_limit: null,
      max_attempts: 3,
      is_active: true,
      display_order: 0,
    });
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      test_id: '',
      question_text: '',
      question_type: 'multiple_choice',
      options: [],
      correct_answer: '',
      points: 1,
      display_order: 0,
    });
    setNewOption({ text: '', is_correct: false });
  };

  const addOption = () => {
    if (newOption.text.trim()) {
      setQuestionFormData({
        ...questionFormData,
        options: [...(questionFormData.options || []), { ...newOption }],
      });
      setNewOption({ text: '', is_correct: false });
    }
  };

  const removeOption = (index: number) => {
    setQuestionFormData({
      ...questionFormData,
      options: questionFormData.options?.filter((_, i) => i !== index) || [],
    });
  };

  const toggleWeek = async (weekId: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
      // If lessons aren't loaded yet, try loading for this week as fallback
      if (lessons.length === 0) {
        console.log('No lessons loaded, loading for week:', weekId);
        await loadLessons(weekId);
      }
    }
    setExpandedWeeks(newExpanded);
  };

  const selectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setLessons([]); // Clear previous lessons
    setExpandedWeeks(new Set()); // Clear expanded weeks
    await loadWeeks(courseId);
    await loadAllLessonsForCourse(courseId);
    await loadTest(courseId);
  };

  const loadAllLessonsForCourse = async (courseId: string) => {
    try {
      setLoadingLessons(true);
      const data = await adminApi.courseLessons.getByCourseId(courseId);
      console.log('Loaded lessons for course:', courseId, data);
      setLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      alert('Error loading lessons: ' + (error as Error).message);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadTest = async (courseId: string) => {
    try {
      const courseTest = await adminApi.courseTests.getByCourseId(courseId);
      if (courseTest) {
        setTest(courseTest);
        const questions = await adminApi.testQuestions.getByTestId(courseTest.id);
        setTestQuestions(questions);
      } else {
        setTest(null);
        setTestQuestions([]);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      setTest(null);
      setTestQuestions([]);
    }
  };

  const addKeyConcept = () => {
    if (newKeyConcept.trim()) {
      setLessonFormData({
        ...lessonFormData,
        key_concepts: [...(lessonFormData.key_concepts || []), newKeyConcept.trim()],
      });
      setNewKeyConcept('');
    }
  };

  const removeKeyConcept = (index: number) => {
    setLessonFormData({
      ...lessonFormData,
      key_concepts: lessonFormData.key_concepts?.filter((_, i) => i !== index) || [],
    });
  };

  const addVideo = () => {
    if (newVideo.topic.trim()) {
      setLessonFormData({
        ...lessonFormData,
        videos: [...(lessonFormData.videos || []), { ...newVideo }],
      });
      setNewVideo({ topic: '', youtubeId: '', description: '' });
    }
  };

  const removeVideo = (index: number) => {
    setLessonFormData({
      ...lessonFormData,
      videos: lessonFormData.videos?.filter((_, i) => i !== index) || [],
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Course Management">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Course Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">Manage your e-learning courses, weeks, and lessons</p>
          </div>
          <button
            onClick={() => {
              resetCourseForm();
              setEditingCourse(null);
              setShowCourseModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus /> Add Course
          </button>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <FaBook className="mx-auto mb-4 text-gray-300 text-6xl" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first course.</p>
              <button
                onClick={() => {
                  resetCourseForm();
                  setEditingCourse(null);
                  setShowCourseModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Course
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {courses.map((course) => (
                <div key={course.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => selectCourse(course.id)}
                          className="text-left flex-1"
                        >
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          {course.description && (
                            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${course.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {course.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {course.display_order}</span>
                          </div>
                        </button>
                      </div>
                      {selectedCourseId === course.id && (
                        <div className="mt-4 ml-4 border-l-2 border-indigo-200 pl-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">Weeks</h4>
                            <button
                              onClick={() => {
                                resetWeekForm();
                                setWeekFormData({ ...weekFormData, course_id: course.id });
                                setEditingWeek(null);
                                setShowWeekModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              <FaPlus className="text-xs" /> Add Week
                            </button>
                          </div>
                          {loadingWeeks ? (
                            <div className="flex justify-center py-4">
                              <FaSpinner className="animate-spin text-indigo-600" />
                            </div>
                          ) : weeks.length === 0 ? (
                            <p className="text-sm text-gray-500">No weeks yet. Add a week to get started.</p>
                          ) : (
                            <div className="space-y-2">
                              {weeks.map((week) => (
                                <div key={week.id} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleWeek(week.id)}
                                          className="flex items-center gap-2 text-left flex-1"
                                        >
                                          {expandedWeeks.has(week.id) ? (
                                            <FaChevronDown className="text-gray-400" />
                                          ) : (
                                            <FaChevronRight className="text-gray-400" />
                                          )}
                                          <span className="font-semibold text-gray-900">
                                            Week {week.week_number}: {week.theme}
                                          </span>
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1 ml-6">{week.goal}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditWeek(week)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteWeek(week.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </div>
                                  {expandedWeeks.has(week.id) && (
                                    <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-medium text-gray-900">Lessons</h5>
                                        <button
                                          onClick={() => {
                                            resetLessonForm();
                                            setLessonFormData({ ...lessonFormData, week_id: week.id });
                                            setEditingLesson(null);
                                            setShowLessonModal(true);
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                        >
                                          <FaPlus className="text-xs" /> Add Lesson
                                        </button>
                                      </div>
                                      {(() => {
                                        const weekLessons = lessons.filter(l => l.week_id === week.id);
                                        if (expandedWeeks.has(week.id)) {
                                          console.log(`Week ${week.id} (${week.theme}): ${weekLessons.length} lessons out of ${lessons.length} total`, {
                                            weekId: week.id,
                                            weekTheme: week.theme,
                                            totalLessons: lessons.length,
                                            weekLessons: weekLessons.length,
                                            allLessonWeekIds: lessons.map(l => l.week_id)
                                          });
                                        }
                                        return weekLessons.length === 0 ? (
                                          <p className="text-xs text-gray-500">No lessons yet.</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {weekLessons.map((lesson) => (
                                            <div key={lesson.id} className="border border-gray-100 rounded p-2 bg-gray-50">
                                              <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                  <span className="font-medium text-sm text-gray-900">
                                                    {lesson.lesson_id}: {lesson.topic}
                                                  </span>
                                                  <p className="text-xs text-gray-600 mt-1">
                                                    {lesson.date} • {lesson.time}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <button
                                                    onClick={() => handleEditLesson(lesson)}
                                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                                  >
                                                    <FaEdit className="text-xs" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                  >
                                                    <FaTrash className="text-xs" />
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Test Section */}
                      {selectedCourseId === course.id && (
                        <div className="mt-6 ml-4 border-l-2 border-purple-200 pl-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <FaGraduationCap className="text-purple-600" />
                              Final Test
                            </h4>
                            {!test ? (
                              <button
                                onClick={() => {
                                  resetTestForm();
                                  setTestFormData({ ...testFormData, course_id: course.id });
                                  setEditingTest(null);
                                  setShowTestModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                              >
                                <FaPlus className="text-xs" /> Create Test
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTest(test);
                                    setTestFormData({
                                      course_id: test.course_id,
                                      title: test.title,
                                      description: test.description || '',
                                      passing_score: test.passing_score,
                                      time_limit: test.time_limit,
                                      max_attempts: test.max_attempts,
                                      is_active: test.is_active,
                                      display_order: test.display_order,
                                    });
                                    setShowTestModal(true);
                                  }}
                                  className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to delete this test? This will delete all questions.')) return;
                                    try {
                                      await adminApi.courseTests.delete(test.id);
                                      await loadTest(course.id);
                                    } catch (error: any) {
                                      alert('Error: ' + error.message);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                          {test ? (
                            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 mb-1">{test.title}</h5>
                                {test.description && (
                                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                  <span>Passing Score: {test.passing_score}%</span>
                                  {test.time_limit && <span>Time Limit: {test.time_limit} min</span>}
                                  <span>Max Attempts: {test.max_attempts}</span>
                                  <span className={`px-2 py-1 rounded ${test.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {test.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h6 className="font-medium text-gray-900">Questions ({testQuestions.length})</h6>
                                  <button
                                    onClick={() => {
                                      resetQuestionForm();
                                      setQuestionFormData({ ...questionFormData, test_id: test.id });
                                      setEditingQuestion(null);
                                      setShowQuestionModal(true);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    <FaPlus className="text-xs" /> Add Question
                                  </button>
                                </div>
                                {testQuestions.length === 0 ? (
                                  <p className="text-xs text-gray-500">No questions yet. Add questions to create the test.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {testQuestions.map((question, idx) => (
                                      <div key={question.id} className="border border-purple-100 rounded p-2 bg-white">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <span className="font-medium text-sm text-gray-900">
                                              Q{idx + 1}: {question.question_text}
                                            </span>
                                            <p className="text-xs text-gray-600 mt-1">
                                              Type: {question.question_type} • Points: {question.points}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => {
                                                setEditingQuestion(question);
                                                let options = question.options;
                                                if (typeof options === 'string') {
                                                  try {
                                                    options = JSON.parse(options);
                                                  } catch (e) {
                                                    options = [];
                                                  }
                                                }
                                                setQuestionFormData({
                                                  test_id: question.test_id,
                                                  question_text: question.question_text,
                                                  question_type: question.question_type,
                                                  options: Array.isArray(options) ? options : [],
                                                  correct_answer: question.correct_answer || '',
                                                  points: question.points,
                                                  display_order: question.display_order,
                                                });
                                                setShowQuestionModal(true);
                                              }}
                                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                            >
                                              <FaEdit className="text-xs" />
                                            </button>
                                            <button
                                              onClick={async () => {
                                                if (!window.confirm('Are you sure you want to delete this question?')) return;
                                                try {
                                                  await adminApi.testQuestions.delete(question.id);
                                                  await loadTest(course.id);
                                                } catch (error: any) {
                                                  alert('Error: ' + error.message);
                                                }
                                              }}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                              <FaTrash className="text-xs" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No test created yet. Create a test for students to take after completing all weeks.</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Create Course'}
              </h2>
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  resetCourseForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={courseFormData.display_order}
                    onChange={(e) => setCourseFormData({ ...courseFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={courseFormData.is_active}
                    onChange={(e) => setCourseFormData({ ...courseFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseModal(false);
                    setEditingCourse(null);
                    resetCourseForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Week Modal */}
      {showWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingWeek ? 'Edit Week' : 'Create Week'}
              </h2>
              <button
                onClick={() => {
                  setShowWeekModal(false);
                  setEditingWeek(null);
                  resetWeekForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleWeekSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Number *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={weekFormData.week_number}
                  onChange={(e) => setWeekFormData({ ...weekFormData, week_number: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme *</label>
                <input
                  type="text"
                  required
                  value={weekFormData.theme}
                  onChange={(e) => setWeekFormData({ ...weekFormData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
                <textarea
                  required
                  value={weekFormData.goal}
                  onChange={(e) => setWeekFormData({ ...weekFormData, goal: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={weekFormData.display_order}
                  onChange={(e) => setWeekFormData({ ...weekFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowWeekModal(false);
                    setEditingWeek(null);
                    resetWeekForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingWeek ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </h2>
              <button
                onClick={() => {
                  setShowLessonModal(false);
                  setEditingLesson(null);
                  resetLessonForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleLessonSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson ID * (e.g., 1-1)</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.lesson_id}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, lesson_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.date}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, date: e.target.value })}
                    placeholder="Mon, Month 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                <input
                  type="text"
                  required
                  value={lessonFormData.topic}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={lessonFormData.time}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, time: e.target.value })}
                    placeholder="3 hrs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={lessonFormData.display_order}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity *</label>
                <textarea
                  required
                  value={lessonFormData.activity}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, activity: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables *</label>
                <textarea
                  required
                  value={lessonFormData.deliverables}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, deliverables: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
                <textarea
                  value={lessonFormData.content}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder="Enter lesson content in Markdown format..."
                />
                <p className="text-xs text-gray-500 mt-1">Supports Markdown formatting (headers, lists, links, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Concepts</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyConcept}
                    onChange={(e) => setNewKeyConcept(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyConcept();
                      }
                    }}
                    placeholder="Enter a key concept"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addKeyConcept}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lessonFormData.key_concepts?.map((concept, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {concept}
                      <button
                        type="button"
                        onClick={() => removeKeyConcept(index)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Videos</label>
                <div className="border border-gray-200 rounded-lg p-3 space-y-3 mb-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newVideo.topic}
                      onChange={(e) => setNewVideo({ ...newVideo, topic: e.target.value })}
                      placeholder="Video topic"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newVideo.youtubeId}
                      onChange={(e) => setNewVideo({ ...newVideo, youtubeId: e.target.value })}
                      placeholder="YouTube ID"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newVideo.description}
                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        placeholder="Description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={addVideo}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {lessonFormData.videos?.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{video.topic}</p>
                        {video.youtubeId && <p className="text-xs text-gray-600">YouTube ID: {video.youtubeId}</p>}
                        {video.description && <p className="text-xs text-gray-500">{video.description}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={lessonFormData.notes}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonModal(false);
                    setEditingLesson(null);
                    resetLessonForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTest ? 'Edit Test' : 'Create Test'}
              </h2>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setEditingTest(null);
                  resetTestForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleTestSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={testFormData.title}
                  onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={testFormData.description}
                  onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={testFormData.passing_score}
                    onChange={(e) => setTestFormData({ ...testFormData, passing_score: parseInt(e.target.value) || 75 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min="1"
                    value={testFormData.max_attempts}
                    onChange={(e) => setTestFormData({ ...testFormData, max_attempts: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes, optional)</label>
                <input
                  type="number"
                  min="1"
                  value={testFormData.time_limit || ''}
                  onChange={(e) => setTestFormData({ ...testFormData, time_limit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Leave empty for no time limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={testFormData.display_order}
                    onChange={(e) => setTestFormData({ ...testFormData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="test_is_active"
                    checked={testFormData.is_active}
                    onChange={(e) => setTestFormData({ ...testFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="test_is_active" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setEditingTest(null);
                    resetTestForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingTest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Create Question'}
              </h2>
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setEditingQuestion(null);
                  resetQuestionForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                <textarea
                  required
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type *</label>
                  <select
                    required
                    value={questionFormData.question_type}
                    onChange={(e) => {
                      const newType = e.target.value as 'multiple_choice' | 'true_false' | 'short_answer';
                      setQuestionFormData({
                        ...questionFormData,
                        question_type: newType,
                        options: newType === 'multiple_choice' ? questionFormData.options : [],
                        correct_answer: newType !== 'multiple_choice' ? questionFormData.correct_answer : '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {questionFormData.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  <div className="space-y-2 mb-2">
                    {questionFormData.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={option.is_correct}
                          onChange={() => {
                            const newOptions = questionFormData.options?.map((opt, i) => ({
                              ...opt,
                              is_correct: i === idx,
                            }));
                            setQuestionFormData({ ...questionFormData, options: newOptions || [] });
                          }}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="flex-1 text-gray-900">{option.text}</span>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption.text}
                      onChange={(e) => setNewOption({ ...newOption, text: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                      placeholder="Enter option text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click the radio button to mark the correct answer</p>
                </div>
              )}

              {(questionFormData.question_type === 'true_false' || questionFormData.question_type === 'short_answer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                  {questionFormData.question_type === 'true_false' ? (
                    <select
                      required
                      value={questionFormData.correct_answer}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select answer</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={questionFormData.correct_answer}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: e.target.value })}
                      placeholder="Enter correct answer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={questionFormData.display_order}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                    resetQuestionForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Courses;

