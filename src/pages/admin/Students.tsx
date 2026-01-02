import { useEffect, useState } from 'react';
import {
    FaBook,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaEnvelope,
    FaEye,
    FaGraduationCap,
    FaIdCard,
    FaPhone,
    FaSpinner,
    FaTable,
    FaUser,
    FaUserCircle,
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'internship' | 'volunteer';
  position?: string;
  experience?: string;
  motivation: string;
  availability?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  learningProgress: any;
  accountInfo: any;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'has_account' | 'no_account'>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.applications.getAllAcceptedStudents();
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      setError(error?.message || 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const filteredStudents = students.filter((student) => {
    if (filter === 'has_account') {
      return student.learningProgress?.hasAccount || student.accountInfo?.has_account;
    }
    if (filter === 'no_account') {
      return !student.learningProgress?.hasAccount && !student.accountInfo?.has_account;
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="Students">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Students">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FaGraduationCap className="mr-3 text-blue-600" />
            Students
          </h1>
          <p className="text-gray-600">View all accepted students and their course progress</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button
              onClick={loadStudents}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Account Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'has_account' | 'no_account')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                <option value="has_account">Has Account</option>
                <option value="no_account">No Account Yet</option>
              </select>
            </div>
            <div className="flex-1"></div>
            <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{filteredStudents.length}</p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Accepted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const hasAccount = student.learningProgress?.hasAccount || student.accountInfo?.has_account;
                    const progress = student.learningProgress?.stats || {
                      totalLessons: 0,
                      completedLessons: 0,
                      viewedLessons: 0,
                      completionPercentage: 0,
                      viewPercentage: 0,
                    };

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              {student.position && (
                                <div className="text-sm text-gray-500">{student.position}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          {student.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="mr-1 text-xs" />
                              {student.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAccount ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasAccount ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700">Progress</span>
                                <span className="text-xs font-bold text-indigo-600">{progress.completionPercentage}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    progress.completionPercentage === 100
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                  }`}
                                  style={{ width: `${progress.completionPercentage}%` }}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{progress.totalLessons}</div>
                                  <div className="text-gray-500">Total</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-green-600">{progress.completedLessons}</div>
                                  <div className="text-gray-500">Done</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-blue-600">{progress.viewedLessons}</div>
                                  <div className="text-gray-500">Viewed</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <span className="text-sm text-gray-400 flex items-center justify-center">
                                <FaSpinner className="mr-1 animate-spin" />
                                Not started
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(student.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View full details"
                          >
                            <FaEye className="mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Details Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaUserCircle className="mr-3 text-blue-600" />
                    Student Full Information
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedStudent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <FaUser className="mr-2 text-gray-400" />
                        {selectedStudent.name}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Email Address</label>
                      <div className="flex items-center text-gray-900 font-medium break-all">
                        <FaEnvelope className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="break-all">{selectedStudent.email}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Phone Number</label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <FaPhone className="mr-2 text-gray-400" />
                        {selectedStudent.phone || 'N/A'}
                      </div>
                    </div>
                    {selectedStudent.position && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Position/Interest</label>
                        <p className="text-gray-900 font-medium">{selectedStudent.position}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaIdCard className="mr-2 text-purple-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Account Status</label>
                      <div className="flex items-center mt-1">
                        {selectedStudent.learningProgress?.hasAccount || selectedStudent.accountInfo?.has_account ? (
                          <>
                            <FaCheckCircle className="text-green-500 mr-2" />
                            <span className="text-green-700 font-medium">Account Created</span>
                          </>
                        ) : (
                          <>
                            <FaSpinner className="text-yellow-500 mr-2" />
                            <span className="text-yellow-700 font-medium">No Account Yet</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedStudent.accountInfo?.user_id && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">User ID</label>
                        <p className="text-gray-900 font-mono text-xs break-all">{selectedStudent.accountInfo.user_id}</p>
                      </div>
                    )}
                    {selectedStudent.accountInfo?.account_created_at && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Account Created</label>
                        <div className="flex items-center text-gray-900 font-medium">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(selectedStudent.accountInfo.account_created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Progress Section */}
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaGraduationCap className="mr-2 text-indigo-600" />
                    Course Progress
                  </h3>
                  {selectedStudent.learningProgress?.hasAccount ? (
                    <div className="space-y-4">
                      {/* Progress Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Lessons</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {selectedStudent.learningProgress?.stats?.totalLessons || 0}
                              </p>
                            </div>
                            <FaBook className="text-3xl text-blue-500 opacity-50" />
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Completed</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {selectedStudent.learningProgress?.stats?.completedLessons || 0}
                              </p>
                            </div>
                            <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Viewed</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {selectedStudent.learningProgress?.stats?.viewedLessons || 0}
                              </p>
                            </div>
                            <FaEye className="text-3xl text-purple-500 opacity-50" />
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Completion</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {selectedStudent.learningProgress?.stats?.completionPercentage || 0}%
                              </p>
                            </div>
                            <FaGraduationCap className="text-3xl text-indigo-500 opacity-50" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full flex items-center justify-center"
                          style={{
                            width: `${selectedStudent.learningProgress?.stats?.completionPercentage || 0}%`,
                          }}
                        >
                          {selectedStudent.learningProgress?.stats?.completionPercentage > 10 && (
                            <span className="text-xs font-semibold text-white">
                              {selectedStudent.learningProgress?.stats?.completionPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedStudent.learningProgress?.stats?.completionPercentage <= 10 && (
                        <p className="text-sm text-gray-600 text-center">
                          {selectedStudent.learningProgress?.stats?.completionPercentage || 0}% Complete
                        </p>
                      )}

                      {/* Progress Details by Week */}
                      {selectedStudent.learningProgress?.progress &&
                        selectedStudent.learningProgress.progress.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <FaBook className="mr-2 text-indigo-600" />
                              Detailed Progress by Week
                            </h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {Array.from(
                                new Set(
                                  selectedStudent.learningProgress.progress.map((p: any) => p.week_number)
                                )
                              )
                                .sort((a: any, b: any) => a - b)
                                .map((weekNum: any) => {
                                  const weekProgress = selectedStudent.learningProgress.progress.filter(
                                    (p: any) => p.week_number === weekNum
                                  );
                                  const weekCompleted = weekProgress.filter((p: any) => p.completed).length;
                                  const weekViewed = weekProgress.filter((p: any) => p.viewed).length;
                                  const weekTotal = weekProgress.length;
                                  const weekPercentage =
                                    weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

                                  return (
                                    <div
                                      key={weekNum}
                                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <div>
                                          <span className="text-base font-semibold text-gray-900">Week {weekNum}</span>
                                          <span className="ml-2 text-sm text-gray-500">
                                            ({weekProgress.length} lessons)
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">{weekPercentage}%</div>
                                            <div className="text-xs text-gray-500">Complete</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Week Progress Bar */}
                                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                                        <div
                                          className={`h-full transition-all duration-300 rounded-full ${
                                            weekPercentage === 100
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                          }`}
                                          style={{ width: `${weekPercentage}%` }}
                                        >
                                          {weekPercentage > 15 && (
                                            <span className="text-xs font-semibold text-white ml-2 flex items-center h-full">
                                              {weekPercentage}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Week Statistics */}
                                      <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                                          <div className="text-lg font-bold text-blue-600">{weekTotal}</div>
                                          <div className="text-xs text-gray-600">Total</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                                          <div className="text-lg font-bold text-green-600">{weekCompleted}</div>
                                          <div className="text-xs text-gray-600">Completed</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-200">
                                          <div className="text-lg font-bold text-purple-600">{weekViewed}</div>
                                          <div className="text-xs text-gray-600">Viewed</div>
                                        </div>
                                      </div>

                                      {/* Individual Lesson Progress */}
                                      <div className="border-t border-gray-200 pt-3">
                                        <details className="cursor-pointer">
                                          <summary className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                                            View Lesson Details ({weekProgress.length} lessons)
                                          </summary>
                                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                            {weekProgress
                                              .sort((a: any, b: any) => a.lesson_id.localeCompare(b.lesson_id))
                                              .map((lesson: any, index: number) => (
                                                <div
                                                  key={index}
                                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                                    lesson.completed
                                                      ? 'bg-green-50 border border-green-200'
                                                      : lesson.viewed
                                                      ? 'bg-blue-50 border border-blue-200'
                                                      : 'bg-gray-50 border border-gray-200'
                                                  }`}
                                                >
                                                  <div className="flex items-center flex-1 min-w-0">
                                                    <div className="flex-shrink-0 mr-3">
                                                      {lesson.completed ? (
                                                        <FaCheckCircle className="text-green-600 text-lg" />
                                                      ) : lesson.viewed ? (
                                                        <FaEye className="text-blue-600 text-lg" />
                                                      ) : (
                                                        <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                                                      )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="text-sm font-semibold text-gray-900 mb-1">
                                                        Lesson {lesson.lesson_id}
                                                      </div>
                                                      <div className="space-y-1">
                                                        {lesson.completed_at && (
                                                          <div className="text-xs text-gray-600 flex items-center">
                                                            <FaCheckCircle className="mr-1 text-green-600" />
                                                            Completed: {formatDate(lesson.completed_at)}
                                                          </div>
                                                        )}
                                                        {lesson.viewed_at && (
                                                          <div className="text-xs text-gray-600 flex items-center">
                                                            <FaEye className="mr-1 text-blue-600" />
                                                            Viewed: {formatDate(lesson.viewed_at)}
                                                          </div>
                                                        )}
                                                        {lesson.created_at && (
                                                          <div className="text-xs text-gray-500 flex items-center">
                                                            <FaClock className="mr-1" />
                                                            Created: {formatDate(lesson.created_at)}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex-shrink-0 ml-3 flex flex-col items-end gap-1">
                                                    {lesson.completed && (
                                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                                        Completed
                                                      </span>
                                                    )}
                                                    {!lesson.completed && lesson.viewed && (
                                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                                        Viewed
                                                      </span>
                                                    )}
                                                    {!lesson.completed && !lesson.viewed && (
                                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        Not Started
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                          </div>
                                        </details>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        
                        {/* Complete Lesson Table View */}
                        {selectedStudent.learningProgress?.progress &&
                          selectedStudent.learningProgress.progress.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FaTable className="mr-2 text-indigo-600" />
                                Complete Progress Table
                              </h4>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Week
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Lesson ID
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Status
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Viewed
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Completed At
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Viewed At
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {selectedStudent.learningProgress.progress
                                        .sort((a: any, b: any) => {
                                          if (a.week_number !== b.week_number) {
                                            return a.week_number - b.week_number;
                                          }
                                          return a.lesson_id.localeCompare(b.lesson_id);
                                        })
                                        .map((lesson: any, index: number) => (
                                          <tr
                                            key={index}
                                            className={`hover:bg-gray-50 ${
                                              lesson.completed ? 'bg-green-50/30' : lesson.viewed ? 'bg-blue-50/30' : ''
                                            }`}
                                          >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm font-medium text-gray-900">Week {lesson.week_number}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className="text-sm text-gray-900 font-mono">{lesson.lesson_id}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                              {lesson.completed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                  <FaCheckCircle className="mr-1" />
                                                  Completed
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                  Not Completed
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                              {lesson.viewed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                  <FaEye className="mr-1" />
                                                  Yes
                                                </span>
                                              ) : (
                                                <span className="text-xs text-gray-400">No</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              {lesson.completed_at ? (
                                                <div className="text-sm text-gray-900">
                                                  <div className="flex items-center">
                                                    <FaCalendarAlt className="mr-1 text-gray-400 text-xs" />
                                                    {formatDate(lesson.completed_at)}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              {lesson.viewed_at ? (
                                                <div className="text-sm text-gray-900">
                                                  <div className="flex items-center">
                                                    <FaEye className="mr-1 text-gray-400 text-xs" />
                                                    {formatDate(lesson.viewed_at)}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>
                                      Total: <strong className="text-gray-900">{selectedStudent.learningProgress.progress.length}</strong> lesson entries
                                    </span>
                                    <span>
                                      Completed: <strong className="text-green-600">
                                        {selectedStudent.learningProgress.progress.filter((p: any) => p.completed).length}
                                      </strong> | Viewed: <strong className="text-blue-600">
                                        {selectedStudent.learningProgress.progress.filter((p: any) => p.viewed).length}
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        <FaGraduationCap className="inline mr-2" />
                        This student hasn't created an account yet or hasn't started the learning program.
                      </p>
                    </div>
                  )}
                </div>

                {/* Application Details Section */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                  <div className="space-y-4">
                    {selectedStudent.experience && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience & Background
                        </label>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {selectedStudent.experience}
                        </p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivation & Interest
                      </label>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedStudent.motivation}
                      </p>
                    </div>
                    {selectedStudent.notes && (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {selectedStudent.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Students;

