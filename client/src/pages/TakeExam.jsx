import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [compileOutputs, setCompileOutputs] = useState({});
  const [compileLoading, setCompileLoading] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchExam = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/${id}`);
        console.log('Fetched exam:', response.data);
        console.log('Exam questions:', response.data.questions);
        setExam(response.data);
        setRemainingSeconds(response.data.duration * 60);
      } catch (error) {
        console.error('Exam load failed:', error);
      } finally {
        setExamLoading(false);
      }
    };

    fetchExam();
  }, [user, id, navigate, loading]);

  useEffect(() => {
    if (remainingSeconds <= 0 || !exam || result) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, exam, result]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleLanguageChange = (questionId, language) => {
    setSelectedLanguages((prev) => ({ ...prev, [questionId]: language }));
  };

  const submitExam = async () => {
    if (!exam) return;
    setSubmitLoading(true);

    const payload = {
      answers: exam.questions.map((question) => ({
        questionId: question._id,
        selectedAnswer: answers[question._id] || '',
        selectedLanguage: question.questionType === 'Coding' ? selectedLanguages[question._id] || question.supportedLanguages[0] : null,
      })),
      timeTaken: exam.duration * 60 - remainingSeconds,
    };

    try {
      const response = await axios.post(`http://localhost:5000/api/exams/${id}/submit`, payload);
      setResult(response.data);
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const executeCode = async (question, runOnly = false) => {
    const questionId = question._id;
    const language = selectedLanguages[questionId] || question.supportedLanguages[0];
    const code = answers[questionId] || '';

    if (!code.trim()) {
      alert('Please enter your code before compiling or running.');
      return;
    }

    setCompileLoading((prev) => ({ ...prev, [questionId]: true }));

    try {
      const response = await axios.post('http://localhost:5000/api/exams/compile', {
        language,
        code,
        input: question.input || '',
        runOnly,
      });

      setCompileOutputs((prev) => ({
        ...prev,
        [questionId]: {
          compileOutput: response.data.compileOutput || '',
          runtimeOutput: response.data.runtimeOutput || '',
          success: response.data.success,
          runOnly,
        },
      }));
    } catch (error) {
      setCompileOutputs((prev) => ({
        ...prev,
        [questionId]: {
          compileOutput: error.response?.data?.message || 'Compile failed.',
          runtimeOutput: '',
          success: false,
          runOnly,
        },
      }));
    } finally {
      setCompileLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (loading || examLoading) {
    return <div className="text-center py-12">Loading exam...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">Please login to take this exam.</div>;
  }

  if (!exam) {
    return <div className="text-center py-12">Exam not found.</div>;
  }

  if (!exam.questions || exam.questions.length === 0) {
    return <div className="text-center py-12">This exam has no questions yet.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{exam.description}</p>
        </div>
        <div className="rounded-lg bg-blue-600 px-4 py-3 text-white shadow">
          Timer: {formatTime(remainingSeconds)}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="grid gap-4 md:grid-cols-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
          <div>Duration: {exam.duration} minutes</div>
          <div>Total Marks: {exam.totalMarks}</div>
          <div>Passing Score: {exam.passingScore}%</div>
        </div>

        {result ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <h2 className="text-2xl font-semibold mb-2">Exam Submitted</h2>
            <p className="mb-2">Score: {result.totalMarksObtained} / {exam.totalMarks}</p>
            <p className="mb-2">Percentage: {result.percentage.toFixed(1)}%</p>
            <p className="font-semibold">Status: {result.status}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {exam.questions.map((question, index) => (
              <div key={question._id} className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
                <div className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {index + 1}. {question.questionText}
                </div>
                {question.questionType === 'Short Answer' ? (
                  <textarea
                    value={answers[question._id] || ''}
                    onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    placeholder="Write your answer here"
                  />
                ) : question.questionType === 'Coding' ? (
                  <div className="space-y-4">
                    {question.input && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sample Input:</h4>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.input}</pre>
                      </div>
                    )}
                    {question.expectedOutput && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expected Output:</h4>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.expectedOutput}</pre>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Programming Language:</label>
                      <select
                        value={selectedLanguages[question._id] || question.supportedLanguages[0]}
                        onChange={(event) => handleLanguageChange(question._id, event.target.value)}
                        className="rounded border border-gray-300 px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      >
                        {question.supportedLanguages.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => executeCode(question, false)}
                            disabled={compileLoading[question._id]}
                            className="rounded bg-amber-500 px-5 py-2 text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {compileLoading[question._id] ? 'Processing...' : 'Compile & Run'}
                          </button>
                          <button
                            type="button"
                            onClick={() => executeCode(question, true)}
                            disabled={compileLoading[question._id]}
                            className="rounded bg-sky-600 px-5 py-2 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {compileLoading[question._id] ? 'Processing...' : 'Run Only'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Compile before submitting, or use Run Only for a quick execution pass.
                        </p>
                      </div>
                      <textarea
                        value={answers[question._id] || ''}
                        onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                        rows={12}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white font-mono text-sm"
                        placeholder={`Write your ${selectedLanguages[question._id] || question.supportedLanguages[0]} code solution here...`}
                      />
                      {compileOutputs[question._id] && (
                        <div className="space-y-4 rounded-2xl border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-gray-900 dark:text-white">Code Execution Results</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{compileOutputs[question._id].runOnly ? 'Run Only' : 'Compile & Run'} completed</div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${compileOutputs[question._id].success ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                              {compileOutputs[question._id].success ? 'Success' : 'Error'}
                            </span>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                            <div className="mb-2 font-semibold">Compile Output</div>
                            <pre className="whitespace-pre-wrap ">{compileOutputs[question._id].compileOutput || 'No compile output.'}</pre>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                            <div className="mb-2 font-semibold">Runtime Output</div>
                            <pre className="whitespace-pre-wrap ">{compileOutputs[question._id].runtimeOutput || 'No runtime output.'}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {question.options?.map((option) => (
                      <label key={option} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                        <input
                          type="radio"
                          name={question._id}
                          value={option}
                          checked={answers[question._id] === option}
                          onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={submitExam}
                disabled={submitLoading || remainingSeconds === 0}
                className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? 'Submitting...' : 'Submit Exam'}
              </button>
              {remainingSeconds === 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">Time is up. Please submit your answers now.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
