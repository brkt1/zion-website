import { useEffect, useState } from 'react';
import { FaAward, FaBook, FaCalendarAlt, FaCertificate, FaCheckCircle, FaChevronDown, FaChevronRight, FaClock, FaDownload, FaFileAlt, FaGraduationCap, FaLanguage, FaPlayCircle, FaRocket, FaSignOutAlt, FaSpinner, FaStar, FaTrophy, FaUser, FaVideo, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/layout/Layout';
import CourseTest from '../components/elearning/CourseTest';
import StudentNotes from '../components/elearning/StudentNotes';
import VideoPlayer from '../components/elearning/VideoPlayer';
import { adminApi } from '../services/adminApi';
import { isElearningUser } from '../services/auth';
import { supabase } from '../services/supabase';

interface Lesson {
  id: string;
  date: string;
  topic: string;
  time: string;
  activity: string;
  deliverables: string;
  content?: string; // Main learning content for the lesson
  keyConcepts?: string[];
  videos?: {
    topic: string;
    youtubeId?: string; // YouTube video ID (will be provided by user)
    description?: string;
  }[];
  notes?: string;
  completed: boolean;
}

interface Week {
  weekNumber: number;
  theme: string;
  goal: string;
  lessons: Lesson[];
  completed: boolean;
}

const Elearning = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [viewedLessons, setViewedLessons] = useState<Set<string>>(new Set()); // Track which lessons have been viewed
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Course data structure - mutable to update completion status
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentCourse, setCurrentCourse] = useState<{ id: string; title: string; description?: string } | null>(null);
  const [test, setTest] = useState<any>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTest, setShowTest] = useState(false);
  const [isGraduated, setIsGraduated] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [courseAccessMessage, setCourseAccessMessage] = useState<string | null>(null);
  const [courseSchedule, setCourseSchedule] = useState<{
    start_day: number;
    end_day: number;
    duration_days: number;
    days_remaining: number;
  } | null>(null);

  // Get user's current day and accessible courses
  const getUserCurrentDay = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_current_day', { check_user_id: userId });
      
      if (error) {
        // If function doesn't exist, try fallback
        if (error.code === '42883' || error.message.includes('does not exist')) {
          console.warn('get_user_current_day function not found, using fallback');
          // Fallback: get from user_enrollment table or default to 1
          const { data: enrollment } = await supabase
            .from('user_enrollment')
            .select('enrollment_date, current_day')
            .eq('user_id', userId)
            .single();
          
          if (enrollment) {
            const daysSinceEnrollment = Math.floor(
              (new Date().getTime() - new Date(enrollment.enrollment_date).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
            return Math.max(1, Math.min(daysSinceEnrollment, 49));
          }
          return 1;
        }
        throw error;
      }
      return data || 1;
    } catch (error) {
      console.error('Error getting user current day:', error);
      return 1;
    }
  };

  // Get accessible courses for user
  const getAccessibleCourses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_accessible_courses_for_user', { check_user_id: userId });
      
      if (error) {
        // If function doesn't exist, use fallback
        if (error.code === '42883' || error.message.includes('does not exist')) {
          console.warn('get_accessible_courses_for_user function not found, using fallback');
          // Fallback: get all active courses with schedule
          const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select(`
              id,
              title,
              course_schedule (
                start_day,
                end_day,
                duration_days
              )
            `)
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          
          if (coursesError) throw coursesError;
          
          const userDay = await getUserCurrentDay(userId);
          
          return (courses || []).map((course: any) => {
            const schedule = course.course_schedule?.[0];
            if (!schedule) return null;
            
            return {
              course_id: course.id,
              course_title: course.title,
              start_day: schedule.start_day,
              end_day: schedule.end_day,
              current_day: userDay,
              is_current_course: userDay >= schedule.start_day && userDay <= schedule.end_day,
              days_remaining: Math.max(0, schedule.end_day - userDay),
            };
          }).filter(Boolean);
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error getting accessible courses:', error);
      return [];
    }
  };

  // Check if course is accessible
  const checkCourseAccess = async (courseId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_course_accessible_for_user', { 
          check_course_id: courseId,
          check_user_id: userId 
        });
      
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  };

  // Load course data from database
  const loadCourseData = async () => {
    if (!userId) return;
    
    try {
      // Get user's current day
      const userDay = await getUserCurrentDay(userId);
      setCurrentDay(userDay);

      // Get accessible courses
      const accessibleCourses = await getAccessibleCourses(userId);
      
      if (accessibleCourses.length === 0) {
        console.warn('No accessible courses found');
        setCourseAccessMessage('No courses are currently available. Please contact support.');
        setWeeks([]);
        return;
      }

      // Get the current course (the one that matches user's current day)
      const currentCourseData = accessibleCourses.find((c: any) => c.is_current_course) || accessibleCourses[0];
      
      if (!currentCourseData) {
        console.warn('No current course found');
        setCourseAccessMessage(
          `No course is available for Day ${userDay}. Please contact support if you believe this is an error.`
        );
        setWeeks([]);
        return;
      }

      // Store course schedule info
      setCourseSchedule({
        start_day: currentCourseData.start_day,
        end_day: currentCourseData.end_day,
        duration_days: currentCourseData.end_day - currentCourseData.start_day + 1,
        days_remaining: currentCourseData.days_remaining || 0,
      });

      // Check if course is accessible
      const hasAccess = await checkCourseAccess(currentCourseData.course_id, userId);
      
      if (!hasAccess) {
        // Find previous course to check completion
        const previousCourse = accessibleCourses.find((c: any) => c.end_day < currentCourseData.start_day);
        
        if (previousCourse) {
          // Check if previous course is completed
          const { data: isCompleted } = await supabase
            .rpc('is_course_completed', {
              check_course_id: previousCourse.course_id,
              check_user_id: userId
            });
          
          if (!isCompleted) {
            setCourseAccessMessage(
              `You must complete "${previousCourse.course_title}" before accessing "${currentCourseData.course_title}". ` +
              `You are currently on Day ${userDay} of 49.`
            );
            setWeeks([]);
            return;
          }
        } else {
          setCourseAccessMessage(
            `Course "${currentCourseData.course_title}" is not yet available. ` +
            `You are currently on Day ${userDay} of 49.`
          );
          setWeeks([]);
          return;
        }
      }

      // Clear access message if access is granted
      setCourseAccessMessage(null);

      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', currentCourseData.course_id)
        .single();

      if (courseError) {
        console.error('Error loading course:', courseError);
        setCourseAccessMessage('Error loading course. Please try refreshing the page.');
        setWeeks([]);
        return;
      }
      
      if (!course) {
        console.warn('Course not found');
        setCourseAccessMessage('Course not found. Please contact support.');
        setWeeks([]);
        return;
      }

      setSelectedCourseId(course.id);
      setCurrentCourse({
        id: course.id,
        title: course.title,
        description: course.description || undefined,
      });

      // Load weeks for this course
      const { data: courseWeeks, error: weeksError } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', course.id)
        .order('week_number', { ascending: true });

      if (weeksError) {
        console.error('Error loading course weeks:', weeksError);
        setCourseAccessMessage('Error loading course content. Please try refreshing the page.');
        setWeeks([]);
        return;
      }
      
      if (!courseWeeks || courseWeeks.length === 0) {
        console.warn('No weeks found for course:', course.id);
        setCourseAccessMessage('No course content found. Please contact support.');
        setWeeks([]);
        return;
      }

      // Load lessons for all weeks
      const weekIds = courseWeeks.map(w => w.id);
      const { data: courseLessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .in('week_id', weekIds)
        .order('display_order', { ascending: true })
        .order('lesson_id', { ascending: true });

      if (lessonsError) {
        console.error('Error loading course lessons:', lessonsError);
        setCourseAccessMessage('Error loading course lessons. Please try refreshing the page.');
        setWeeks([]);
        return;
      }

      // Map database structure to component structure
      const mappedWeeks: Week[] = courseWeeks.map(week => {
        const weekLessons = (courseLessons || [])
          .filter(lesson => lesson.week_id === week.id)
          .map(lesson => {
            // Parse videos if it's a string
            let videos = lesson.videos;
            if (typeof videos === 'string') {
              try {
                videos = JSON.parse(videos);
              } catch (e) {
                videos = null;
              }
            }

            return {
              id: lesson.lesson_id,
              date: lesson.date,
              topic: lesson.topic,
              time: lesson.time,
              activity: lesson.activity,
              deliverables: lesson.deliverables,
              content: lesson.content || undefined,
              keyConcepts: lesson.key_concepts || undefined,
              videos: Array.isArray(videos) ? videos : undefined,
              notes: lesson.notes || undefined,
              completed: false, // Will be updated from progress
            };
          });

        return {
          weekNumber: week.week_number,
          theme: week.theme,
          goal: week.goal,
          lessons: weekLessons,
          completed: false, // Will be calculated
        };
      });

      setWeeks(mappedWeeks);

      // Load test for this course
      if (userId) {
        await loadTest(course.id);
      }
    } catch (error: any) {
      console.error('Error loading course data:', error);
      setCourseAccessMessage(
        error?.message || 'An error occurred while loading course data. Please try refreshing the page.'
      );
      setWeeks([]);
      
      // If it's a database function error, provide helpful message
      if (error?.code === '42883' || error?.message?.includes('does not exist')) {
        setCourseAccessMessage(
          'Database functions not set up. Please run the SQL setup scripts in Supabase.'
        );
      }
    }
  };

  // Load test and questions
  const loadTest = async (courseId: string) => {
    try {
      const courseTest = await adminApi.courseTests.getByCourseId(courseId);
      if (courseTest) {
        setTest(courseTest);
        const questions = await adminApi.testQuestions.getByTestId(courseTest.id);
        setTestQuestions(questions);

        // Check if user has passed the test
        if (userId) {
          const latestResult = await adminApi.testResults.getLatestResult(courseTest.id, userId);
          if (latestResult?.passed) {
            setIsGraduated(true);
            setTestResult(latestResult);
          } else {
            // Check if all weeks are completed to show test
            const allCompleted = weeks.length > 0 && weeks.every(week => 
              week.lessons.length > 0 && week.lessons.every(lesson => lesson.completed)
            );
            if (allCompleted) {
              setShowTest(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading test:', error);
    }
  };

  // Check if all weeks are completed
  const allWeeksCompleted = weeks.length > 0 && weeks.every(week => 
    week.lessons.length > 0 && week.lessons.every(lesson => lesson.completed)
  );

  // Handle test completion
  const handleTestComplete = (passed: boolean, score: number) => {
    if (passed) {
      setIsGraduated(true);
      setShowTest(false);
      // Reload test to get the latest result
      if (test && userId) {
        adminApi.testResults.getLatestResult(test.id, userId).then(result => {
          if (result) {
            setTestResult(result);
          }
        });
      }
    } else {
      // If failed, keep test visible for retake
      setShowTest(true);
    }
  };

  // Load progress from database
  const loadProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('elearning_progress')
        .select('lesson_id, completed, viewed')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading progress:', error);
        // If table doesn't exist, return empty map (progress will start fresh)
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Elearning progress table does not exist. Please run the SQL script to create it.');
          return { progressMap: {}, viewedSet: new Set<string>() };
        }
        return { progressMap: {}, viewedSet: new Set<string>() };
      }

      // Create a map of lesson_id -> completed status
      const progressMap: Record<string, boolean> = {};
      const viewedSet = new Set<string>();
      
      if (data) {
        data.forEach((item) => {
          progressMap[item.lesson_id] = item.completed || false;
          if (item.viewed) {
            viewedSet.add(item.lesson_id);
          }
        });
      }

      return { progressMap, viewedSet };
    } catch (error) {
      console.error('Error loading progress:', error);
      return { progressMap: {}, viewedSet: new Set<string>() };
    }
  };

  // Save progress to database
  const saveProgress = async (userId: string, lessonId: string, weekNumber: number, completed: boolean, viewed?: boolean) => {
    try {
      const updateData: any = {
        user_id: userId,
        lesson_id: lessonId,
        week_number: weekNumber,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      // If viewed is provided, update it
      if (viewed !== undefined) {
        updateData.viewed = viewed;
        updateData.viewed_at = viewed ? new Date().toISOString() : null;
      }

      const { data, error } = await supabase
        .from('elearning_progress')
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id'
        })
        .select();

      if (error) {
        console.error('Error saving progress:', error);
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          throw new Error('Database table not found. Please run the SQL script to create the elearning_progress table.');
        }
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/elearning/login');
          return;
        }

        setUserEmail(session.user.email || null);
        setUserId(session.user.id);
        const access = await isElearningUser();
        
        if (!access) {
          navigate('/elearning/login');
          return;
        }

        setHasAccess(true);

        // Load course data from database
        await loadCourseData();

        // Load progress from database
        const { progressMap, viewedSet } = await loadProgress(session.user.id);
        
        // Set viewed lessons
        setViewedLessons(viewedSet);
        
        // Update weeks with completion status from database
        setWeeks(prevWeeks => {
          const updated = prevWeeks.map(week => ({
            ...week,
            lessons: week.lessons.map(lesson => ({
              ...lesson,
              completed: progressMap[lesson.id] || false,
            })),
            completed: week.lessons.every(lesson => progressMap[lesson.id] || false),
          }));

          // Check if all weeks completed and load test
          const allCompleted = updated.length > 0 && updated.every(week => 
            week.lessons.length > 0 && week.lessons.every(lesson => progressMap[lesson.id] || false)
          );
          
          if (allCompleted && selectedCourseId && userId) {
            // Check if course is completed and unlock next course
            (async () => {
              try {
                const { data: isCourseCompleted } = await supabase
                  .rpc('is_course_completed', {
                    check_course_id: selectedCourseId,
                    check_user_id: userId
                  });
                
                if (isCourseCompleted) {
                  // Course is completed, reload course data to potentially unlock next course
                  setTimeout(() => {
                    loadCourseData();
                  }, 1000);
                }
              } catch (error) {
                console.error('Error checking course completion:', error);
              }
            })();
            
            // Load test if not already loaded
            loadTest(selectedCourseId);
          }

          return updated;
        });
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/elearning/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/elearning/login');
  };

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleLesson = async (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    const wasExpanded = newExpanded.has(lessonId);
    
    if (wasExpanded) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
      
      // Mark lesson as viewed when expanded for the first time
      if (!viewedLessons.has(lessonId) && userId) {
        const newViewed = new Set(viewedLessons);
        newViewed.add(lessonId);
        setViewedLessons(newViewed);
        
        // Save viewed status to database
        try {
          // Find the lesson to get week number
          for (const week of weeks) {
            const lesson = week.lessons.find(l => l.id === lessonId);
            if (lesson) {
              await saveProgress(userId, lessonId, week.weekNumber, lesson.completed, true);
              break;
            }
          }
        } catch (error) {
          console.error('Error saving viewed status:', error);
          // Don't show error to user, just log it
        }
      }
    }
    setExpandedLessons(newExpanded);
  };

  const toggleLessonCompletion = async (weekNumber: number, lessonId: string) => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    // Find the current lesson to get its completion status
    const week = weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;

    const lesson = week.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const newCompletedStatus = !lesson.completed;

    // Optimistically update UI
    setWeeks(prevWeeks =>
      prevWeeks.map(w =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              lessons: w.lessons.map(l =>
                l.id === lessonId ? { ...l, completed: newCompletedStatus } : l
              ),
            }
          : w
      )
    );

    // Save to database
    try {
      await saveProgress(userId, lessonId, weekNumber, newCompletedStatus);
      
      // Check if course is now completed after this update
      if (newCompletedStatus && selectedCourseId) {
        (async () => {
          try {
            const { data: isCourseCompleted } = await supabase
              .rpc('is_course_completed', {
                check_course_id: selectedCourseId,
                check_user_id: userId
              });
            
            if (isCourseCompleted) {
              // Course completed! Reload course data to unlock next course
              setTimeout(() => {
                loadCourseData();
              }, 500);
            }
          } catch (error) {
            console.error('Error checking course completion:', error);
          }
        })();
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      // Revert on error
      setWeeks(prevWeeks =>
        prevWeeks.map(w =>
          w.weekNumber === weekNumber
            ? {
                ...w,
                lessons: w.lessons.map(l =>
                  l.id === lessonId ? { ...l, completed: !newCompletedStatus } : l
                ),
              }
            : w
        )
      );
      // Silently fail - progress will be saved on next attempt
    }
  };

  const getSelectedLessonData = () => {
    if (!selectedLesson) return null;
    for (const week of weeks) {
      const lesson = week.lessons.find(l => l.id === selectedLesson);
      if (lesson) return { week, lesson };
    }
    return null;
  };

  const selectedLessonData = getSelectedLessonData();

  // Calculate progress
  // Calculate progress from weeks
  const totalLessons = weeks.reduce((sum, week) => sum + (week.lessons?.length || 0), 0);
  const completedLessons = weeks.reduce(
    (sum, week) => sum + (week.lessons?.filter(l => l.completed).length || 0),
    0
  );
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Calculate overall program progress (across all 5 courses)
  const programProgress = currentDay ? (currentDay / 49) * 100 : 0;

  // Check if course is completed and show celebration
  useEffect(() => {
    if (progress === 100 && !courseCompleted && !loading) {
      setCourseCompleted(true);
      setShowCelebration(true);
      // Hide celebration after 10 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 10000);
    }
  }, [progress, courseCompleted, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading e-learning portal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className={`min-h-screen pt-20 md:pt-24 transition-all duration-1000 ${
        courseCompleted 
          ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50' 
          : 'bg-gray-50'
      }`}>
        {/* Course Completion Celebration Banner */}
        {showCelebration && courseCompleted && (
          <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-center space-x-4">
                  <FaTrophy className="text-3xl animate-bounce" />
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">🎉 Congratulations! 🎉</h2>
                    <p className="text-lg md:text-xl">You've completed this course! Ready for the next challenge?</p>
                  </div>
                  <FaRocket className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Header - Account for fixed nav - YENEGE Branding */}
        <div 
          className="text-white shadow-lg transition-all duration-1000" 
          style={{ 
            background: courseCompleted 
              ? 'linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F59E0B 100%)'
              : 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl flex-shrink-0">
                    <FaGraduationCap className="text-2xl sm:text-3xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-semibold whitespace-nowrap">INTERNSHIP PROGRAM</span>
                      <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs font-semibold flex items-center space-x-1 whitespace-nowrap">
                        <FaStar className="text-yellow-200" />
                        <span>4.8</span>
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                      {currentCourse?.title || 'Event Organizing Internship'}
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base md:text-lg">
                      {currentCourse?.description || 'Master the art of event planning through hands-on experience'}
                    </p>
                  </div>
                </div>
                
                {/* Course Stats - Responsive Grid - YENEGE Branding */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaClock className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Course Duration</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">
                      {courseSchedule ? `${courseSchedule.duration_days} Days` : '7 Weeks'}
                    </p>
                    {courseSchedule && currentDay && (
                      <p className="text-xs text-white/70 mt-1">
                        Days {courseSchedule.start_day}-{courseSchedule.end_day}
                      </p>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaBook className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Lessons</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">{totalLessons || 0} Lessons</p>
                    {courseSchedule && (
                      <p className="text-xs text-white/70 mt-1">
                        {courseSchedule.days_remaining} days remaining
                      </p>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaCalendarAlt className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Program Progress</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">
                      {currentDay ? `Day ${currentDay}/49` : 'Day 1/49'}
                    </p>
                    {currentDay && (
                      <p className="text-xs text-white/70 mt-1">
                        Week {Math.ceil(currentDay / 7)} of 7
                      </p>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaLanguage className="text-white/80 text-sm md:text-base" />
                      <span className="text-xs md:text-sm text-white/90">Language</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold">English</p>
                  </div>
                </div>
              </div>
              
              {/* User Info & Logout - Mobile Responsive */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-3 md:space-y-3 md:gap-0">
                {userEmail && (
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg flex-1 md:flex-none min-w-0">
                    <FaUser className="flex-shrink-0" />
                    <span className="text-xs md:text-sm truncate">{userEmail}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  <FaSignOutAlt />
                  <span className="text-xs md:text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Enhanced Progress Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Your Learning Progress</h2>
                <p className="text-sm md:text-base text-gray-600">Track your journey through the course</p>
              </div>
              {progress === 100 && (
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 md:px-4 py-2 rounded-lg">
                  <FaCertificate className="text-lg md:text-xl" />
                  <span className="font-semibold text-sm md:text-base">Certificate Ready!</span>
              </div>
              )}
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold text-gray-900">{completedLessons} of {totalLessons} lessons</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)'
                    }}
                  >
                    <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #FF6F5E 0%, #C73A26 100%)' }}>
                    <FaBook className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalLessons - completedLessons}</p>
                    <p className="text-sm text-gray-600">Remaining</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Access Message */}
          {courseAccessMessage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:p-6 mb-6 md:mb-8 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaClock className="text-yellow-600 text-xl md:text-2xl" />
                </div>
                <div className="ml-3 md:ml-4">
                  <h3 className="text-lg md:text-xl font-bold text-yellow-800 mb-2">
                    Course Access Information
                  </h3>
                  <p className="text-sm md:text-base text-yellow-700">
                    {courseAccessMessage}
                  </p>
                  {currentDay && (
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <p className="text-xs md:text-sm text-yellow-600">
                        <strong>Progress:</strong> Day {currentDay} of 49 ({Math.round((currentDay / 49) * 100)}% through the program)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Day Display */}
          {currentDay && !courseAccessMessage && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 md:p-6 mb-6 md:mb-8 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                  <div>
                    <h3 className="text-lg font-bold text-blue-800">Current Day: {currentDay} of 49</h3>
                    <p className="text-sm text-blue-600">Week {Math.ceil(currentDay / 7)} of 7</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">{Math.round((currentDay / 49) * 100)}%</div>
                  <div className="text-xs text-blue-600">Complete</div>
                </div>
              </div>
            </div>
          )}

          {/* Course Overview Cards - YENEGE Branding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                  <FaClock className="text-white text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Time Commitment</h3>
                  <p className="text-xs md:text-sm text-gray-600">3-4 hours per day</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Monday to Friday, 9:00 AM - 12:30 PM</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 md:p-3 rounded-lg flex-shrink-0 border border-blue-100">
                  <FaBook className="text-indigo-600 text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Learning Format</h3>
                  <p className="text-xs md:text-sm text-gray-600">Interactive & Practical</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Guided lessons, workshops, and mentorship</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-2 md:p-3 rounded-lg flex-shrink-0 border border-amber-100">
                  <FaAward className="text-orange-600 text-lg md:text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Certificate</h3>
                  <p className="text-xs md:text-sm text-gray-600">Upon completion</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs md:text-sm">Earn a certificate after finishing all modules</p>
            </div>
          </div>

          {/* Course Philosophy - YENEGE Branding */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl p-4 md:p-8 border border-amber-200 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Course Philosophy</h2>
            <p className="text-xl md:text-2xl text-gray-800 mb-3 md:mb-4 font-semibold italic">"Learn, Do, Review."</p>
            <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
              Each week combines foundational knowledge with practical application. We believe in learning by doing, 
              ensuring that every concept is immediately applied to real-world scenarios.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Learn</h3>
                <p className="text-sm md:text-base text-gray-600">Comprehensive lessons covering all aspects of event planning</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Do</h3>
                <p className="text-sm md:text-base text-gray-600">Hands-on workshops and real-world project assignments</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">Review</h3>
                <p className="text-sm md:text-base text-gray-600">Regular feedback sessions and mentorship to refine your skills</p>
              </div>
            </div>
          </div>

          {/* Course Weeks - Coursera Style */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Course Content</h2>
              <div className="text-xs md:text-sm text-gray-600">
                {weeks.length} modules • {totalLessons} lessons
              </div>
            </div>
            {weeks.map((week) => {
              const weekCompleted = week.lessons.filter(l => l.completed).length;
              const weekProgress = week.lessons.length > 0 ? (weekCompleted / week.lessons.length) * 100 : 0;
              const isExpanded = expandedWeeks.has(week.weekNumber);

              return (
                <div key={week.weekNumber} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  {/* Week Header */}
                  <div
                    className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                    onClick={() => toggleWeek(week.weekNumber)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                          {week.weekNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                              {week.theme}
                            </h3>
                            {week.completed && (
                              <FaCheckCircle className="text-green-500 text-lg md:text-xl flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed">{week.goal}</p>
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaBook className="text-blue-500 flex-shrink-0" />
                              <span className="font-medium">{week.lessons.length} lessons</span>
                            </span>
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaClock className="text-indigo-500 flex-shrink-0" />
                              <span className="font-medium">{week.lessons.reduce((sum, l) => {
                                const time = parseFloat(l.time) || 0;
                                return sum + time;
                              }, 0).toFixed(1)} hours</span>
                            </span>
                            <span className="flex items-center space-x-1 md:space-x-2">
                              <FaCheckCircle className={`flex-shrink-0 ${weekCompleted === week.lessons.length ? "text-green-500" : "text-gray-400"}`} />
                              <span className="font-medium">{weekCompleted}/{week.lessons.length} completed</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                            <div
                              className="h-2 md:h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1 md:pr-2"
                              style={{ 
                                width: `${weekProgress}%`,
                                background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)'
                              }}
                            >
                              {weekProgress > 15 && (
                                <span className="text-xs font-bold text-white">{Math.round(weekProgress)}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {isExpanded ? (
                            <FaChevronDown className="text-gray-400 text-lg md:text-xl" />
                          ) : (
                            <FaChevronRight className="text-gray-400 text-lg md:text-xl" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Week Lessons - Coursera Style */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {week.lessons.map((lesson, lessonIndex) => {
                        const isLessonExpanded = expandedLessons.has(lesson.id);
                        return (
                          <div key={lesson.id} className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
                            <div
                              className="p-3 md:p-5 cursor-pointer"
                              onClick={() => {
                                toggleLesson(lesson.id);
                                setSelectedLesson(lesson.id);
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                                      lesson.completed 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {lesson.completed ? <FaCheckCircle className="text-xs md:text-sm" /> : lessonIndex + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">{lesson.date}</span>
                                      <span className="flex items-center space-x-1 text-xs text-gray-500">
                                        <FaClock className="text-indigo-500 flex-shrink-0" />
                                        <span className="font-medium">{lesson.time}</span>
                                      </span>
                                      {lesson.videos && lesson.videos.length > 0 && (
                                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                                          <FaVideo className="text-red-500 flex-shrink-0" />
                                          <span className="font-medium">{lesson.videos.length} video{lesson.videos.length > 1 ? 's' : ''}</span>
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 hover:text-blue-600 transition-colors leading-tight">{lesson.topic}</h4>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{lesson.activity}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                                  {/* Only show Mark Complete button if lesson has been viewed or is already completed */}
                                  {(viewedLessons.has(lesson.id) || lesson.completed) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLessonCompletion(week.weekNumber, lesson.id);
                                      }}
                                      className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                                        lesson.completed
                                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                      }`}
                                    >
                                      {lesson.completed ? (
                                        <span className="flex items-center space-x-1 md:space-x-2">
                                          <FaCheckCircle className="text-xs" />
                                          <span className="hidden sm:inline">Done</span>
                                        </span>
                                      ) : (
                                        <span className="flex items-center space-x-1 md:space-x-2">
                                          <FaCheckCircle className="text-xs" />
                                          <span className="hidden sm:inline">Mark Complete</span>
                                        </span>
                                      )}
                                    </button>
                                  )}
                                  {!viewedLessons.has(lesson.id) && !lesson.completed && (
                                    <span className="px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 whitespace-nowrap">
                                      <span className="hidden sm:inline">View Lesson</span>
                                      <span className="sm:hidden">View</span>
                                    </span>
                                  )}
                                  <div className="text-gray-400 flex-shrink-0">
                                    {isLessonExpanded ? (
                                      <FaChevronDown className="text-sm md:text-base" />
                                    ) : (
                                      <FaChevronRight className="text-sm md:text-base" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Lesson Details - Enhanced */}
                            {isLessonExpanded && (
                              <div className="px-3 md:px-5 pb-4 md:pb-6 pl-12 md:pl-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
                                <div className="space-y-4 md:space-y-6 pt-4 md:pt-6">
                                  {/* Activity & Deliverables - YENEGE Branding */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <FaPlayCircle className="text-indigo-600" />
                                        <span>Activity</span>
                                      </h5>
                                      <p className="text-gray-700 text-sm leading-relaxed">{lesson.activity}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <FaFileAlt className="text-orange-600" />
                                        <span>Deliverables</span>
                                      </h5>
                                      <p className="text-gray-700 text-sm leading-relaxed">{lesson.deliverables}</p>
                                    </div>
                                  </div>

                                  {/* Lesson Content - Enhanced - YENEGE Branding */}
                                  {lesson.content && (
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                      <div className="flex items-center space-x-3 mb-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-100">
                                          <FaBook className="text-indigo-600" />
                                        </div>
                                        <h5 className="font-bold text-gray-900 text-lg">Lesson Content</h5>
                                      </div>
                                      <div 
                                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ 
                                          __html: lesson.content
                                            .split('\n')
                                            .map(line => {
                                              // Convert markdown-style headers
                                              if (line.startsWith('### ')) {
                                                return `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">${line.substring(4)}</h3>`;
                                              }
                                              if (line.startsWith('## ')) {
                                                return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-indigo-200">${line.substring(3)}</h2>`;
                                              }
                                              if (line.startsWith('# ')) {
                                                return `<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${line.substring(2)}</h1>`;
                                              }
                                              // Convert bold
                                              line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
                                              // Convert numbered lists
                                              if (/^\d+\.\s/.test(line)) {
                                                return `<li class="ml-6 mb-2">${line.replace(/^\d+\.\s/, '')}</li>`;
                                              }
                                              // Convert bullet points
                                              if (line.startsWith('- ')) {
                                                return `<li class="ml-6 mb-2 list-disc">${line.substring(2)}</li>`;
                                              }
                                              // Regular paragraphs
                                              if (line.trim()) {
                                                return `<p class="mb-4 text-gray-700 leading-relaxed">${line}</p>`;
                                              }
                                              return line;
                                            })
                                            .join('\n')
                                            .replace(/(<li.*?<\/li>)/g, '<ul class="list-disc space-y-2 mb-4 text-gray-700">$1</ul>')
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Key Concepts - Enhanced - YENEGE Branding */}
                                  {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                      <h5 className="font-bold text-gray-900 mb-4 flex items-center space-x-2 text-lg">
                                        <FaAward className="text-indigo-600" />
                                        <span>Key Concepts</span>
                                      </h5>
                                      <div className="flex flex-wrap gap-3">
                                        {lesson.keyConcepts.map((concept, idx) => (
                                          <span
                                            key={idx}
                                            className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-semibold shadow-sm border border-indigo-200 hover:shadow-md transition-shadow"
                                          >
                                            {concept}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {lesson.videos && lesson.videos.length > 0 && (
                                    <div className="mt-6">
                                      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
                                        <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
                                          <FaYoutube className="text-red-600 text-xl" />
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-gray-900 text-lg">Video Lessons</h5>
                                          <p className="text-xs text-gray-500">Watch and learn from expert instructors</p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 gap-6">
                                        {lesson.videos.map((video, idx) => (
                                          <div 
                                            key={idx} 
                                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                          >
                                            <div className="p-5">
                                              <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                  <div className="flex items-center space-x-2 mb-2">
                                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                                                      {idx + 1}
                                                    </span>
                                                    <h6 className="font-bold text-gray-900 text-base leading-tight">{video.topic}</h6>
                                                  </div>
                                                  {video.description && (
                                                    <p className="text-sm text-gray-600 ml-8 leading-relaxed">{video.description}</p>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {video.youtubeId ? (
                                                userId ? (
                                                  <VideoPlayer
                                                    youtubeId={video.youtubeId}
                                                    videoTopic={video.topic}
                                                    lessonId={lesson.id}
                                                    videoIndex={idx}
                                                    userId={userId}
                                                  />
                                                ) : (
                                                  <div className="mt-4 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                      <iframe
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                                        title={video.topic}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                      />
                                                    </div>
                                                  </div>
                                                )
                                              ) : (
                                                <div className="mt-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                                                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                                                    <FaVideo className="text-yellow-600 text-2xl" />
                                                  </div>
                                                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                                                    Video Coming Soon
                                                  </p>
                                                  <p className="text-xs text-yellow-700 mb-2">
                                                    Topic: <span className="font-medium">{video.topic}</span>
                                                  </p>
                                                  <p className="text-xs text-yellow-600">
                                                    This video will be available soon
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Important Notes */}
                                  {lesson.notes && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-5 shadow-sm">
                                      <h5 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                                        <span className="text-xl">💡</span>
                                        <span>Important Notes</span>
                                      </h5>
                                      <p className="text-gray-700 leading-relaxed">{lesson.notes}</p>
                                    </div>
                                  )}

                                  {/* Student Notes Component */}
                                  {userId && (
                                    <StudentNotes
                                      lessonId={lesson.id}
                                      userId={userId}
                                    />
                                  )}

                                  {/* Mark Complete Button at End of Lesson */}
                                  {(viewedLessons.has(lesson.id) || lesson.completed) && (
                                    <div className="pt-4 border-t border-gray-200">
                                      <button
                                        onClick={() => {
                                          toggleLessonCompletion(week.weekNumber, lesson.id);
                                        }}
                                        className={`w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg text-sm md:text-base font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                                          lesson.completed
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                        }`}
                                      >
                                        {lesson.completed ? (
                                          <>
                                            <FaCheckCircle className="text-lg" />
                                            <span>Lesson Completed ✓</span>
                                          </>
                                        ) : (
                                          <>
                                            <FaCheckCircle className="text-lg" />
                                            <span>Mark Lesson as Complete</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Certificate Section with Celebration Colors */}
          {progress === 100 && (
            <div className={`mt-6 md:mt-8 rounded-xl shadow-lg p-4 md:p-8 border-2 transition-all duration-1000 ${
              courseCompleted
                ? 'bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 border-purple-300 animate-pulse'
                : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
                  <div className={`p-3 md:p-4 rounded-xl flex-shrink-0 transition-all duration-1000 ${
                    courseCompleted
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 animate-bounce'
                      : 'bg-green-500'
                  }`}>
                    <FaCertificate className="text-white text-2xl md:text-4xl" />
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-1 md:mb-2 transition-all duration-1000 ${
                      courseCompleted ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {courseCompleted ? '🎉 Amazing Achievement! 🎉' : 'Congratulations! 🎉'}
                    </h2>
                    <p className={`text-base md:text-lg mb-1 transition-all duration-1000 ${
                      courseCompleted ? 'text-purple-800' : 'text-gray-700'
                    }`}>
                      You've completed the {currentCourse?.title || 'Event Organizing Internship'} course!
                    </p>
                    {courseCompleted && (
                      <p className="text-sm md:text-base text-purple-700 font-semibold mb-2">
                        🚀 You're ready for the next challenge! Keep learning and growing!
                      </p>
                    )}
                    <p className={`text-xs md:text-sm transition-all duration-1000 ${
                      courseCompleted ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      Your certificate is ready for download.
                    </p>
                  </div>
                </div>
                <button className={`w-full md:w-auto text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 duration-1000 ${
                  courseCompleted
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 animate-pulse'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                }`}>
                  <FaDownload />
                  <span className="text-sm md:text-base">Download Certificate</span>
                </button>
              </div>
            </div>
          )}

          {/* Calendar Overview - Enhanced */}
          <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Course Schedule Overview</h2>
              <div className="text-xs md:text-sm text-gray-600 flex items-center space-x-2">
                <FaCalendarAlt className="text-orange-500" />
                <span>{weeks.length} weeks • {totalLessons} lessons</span>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Week</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider hidden sm:table-cell">Theme</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider hidden md:table-cell">Key Focus</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Lessons</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weeks.map((week) => {
                      const weekCompleted = week.lessons.filter(l => l.completed).length;
                      const isWeekComplete = weekCompleted === week.lessons.length;
                      return (
                        <tr key={week.weekNumber} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs md:text-sm" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
                              {week.weekNumber}
                            </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 text-xs md:text-sm">Week {week.weekNumber}</span>
                                <span className="text-xs text-gray-500 sm:hidden">{week.theme}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 font-medium text-gray-900 text-xs md:text-sm hidden sm:table-cell">{week.theme}</td>
                          <td className="px-3 md:px-4 py-3 md:py-4 text-gray-700 text-xs md:text-sm hidden md:table-cell">{week.goal}</td>
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                            <span className="text-gray-600 font-medium text-xs md:text-sm">{week.lessons.length} lessons</span>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                            {isWeekComplete ? (
                              <span className="inline-flex items-center space-x-1 px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-semibold">
                                <FaCheckCircle className="text-xs" />
                                <span>Complete</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2 md:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs md:text-sm font-semibold">
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Test Section - Show after all weeks completed */}
          {allWeeksCompleted && test && testQuestions.length > 0 && (showTest || isGraduated) && (
            <div className="mt-6 md:mt-8">
              {isGraduated ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg p-6 md:p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-3xl text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      🎓 Congratulations! You Have Graduated!
                    </h2>
                    <p className="text-lg text-gray-700 mb-4">
                      You have successfully completed the course and passed the final test.
                    </p>
                    {testResult && (
                      <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                        <p className="text-sm text-gray-600">Final Test Score</p>
                        <p className="text-3xl font-bold text-green-600">{testResult.score}%</p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <FaDownload /> Download Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Final Test
                    </h2>
                    <p className="text-gray-600">
                      You have completed all weeks! Now take the final test to graduate.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Passing score: {test.passing_score}% | Max attempts: {test.max_attempts}
                    </p>
                  </div>
                  {userId && (
                    <CourseTest
                      test={test}
                      questions={testQuestions}
                      userId={userId}
                      onComplete={handleTestComplete}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Elearning;
