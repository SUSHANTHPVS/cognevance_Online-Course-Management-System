import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const fallbackCourseImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

const getCourseThumbnail = (thumbnail) => {
  if (!thumbnail) return fallbackCourseImage;

  try {
    const imageUrl = new URL(thumbnail);
    if (['localhost', '127.0.0.1'].includes(imageUrl.hostname) && axios.defaults.baseURL) {
      const backendUrl = new URL(axios.defaults.baseURL);
      imageUrl.protocol = backendUrl.protocol;
      imageUrl.host = backendUrl.host;
    }
    return imageUrl.href;
  } catch {
    return fallbackCourseImage;
  }
};

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/courses/user/enrolled');
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`);
      fetchEnrolledCourses();
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  const displayCourses = activeTab === 'enrolled' ? enrolledCourses : courses;

  // Filter courses based on search term and level
  const filteredCourses = displayCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
        {user?.role === 'admin' && (
          <Link
            to="/admin/courses/create"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
          >
            Add New Course
          </Link>
        )}
      </div>
      {user && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'enrolled'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                My Courses
              </button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="course-search"
                  name="courseSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  autoComplete="off"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src={getCourseThumbnail(course.thumbnail)}
              alt={course.title}
              className="w-full h-48 object-cover"
              onError={(event) => {
                if (event.currentTarget.src !== fallbackCourseImage) {
                  event.currentTarget.src = fallbackCourseImage;
                }
              }}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Instructor: {course.instructor?.name || 'Unknown'}</span>
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {course.level}
                </span>
                {user && !isEnrolled(course._id) && activeTab === 'all' && (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Enroll
                  </button>
                )}
                {isEnrolled(course._id) && (
                  <span className="text-green-600 font-semibold">Enrolled</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {activeTab === 'enrolled'
              ? 'You haven\'t enrolled in any courses yet.'
              : 'No courses match your search.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;