import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/**
 * Shadow component (not yet wired into routes):
 * - Fetches GET /api/lessons/:id/content
 * - Renders aiSummary + MCQ quiz
 * - Submits POST /api/lessons/:id/submit-quiz with user's answers
 *
 * Expects mock/JWT token to be present in localStorage as `token` (matches existing auth approach).
 */

// PUBLIC_INTERFACE
function QuizView({ lessonId, apiBaseUrl }) {
  /** Quiz view for a specific lesson id. */
  const baseURL = apiBaseUrl || process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const token = useMemo(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSubmitResult(null);

      try {
        const resp = await axios.get(`${baseURL}/lessons/${lessonId}/content`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (cancelled) return;

        setAiSummary(resp.data?.aiSummary ?? null);
        setQuiz(resp.data?.aiQuizJson ?? null);

        // initialize answers map
        if (Array.isArray(resp.data?.aiQuizJson)) {
          const initial = {};
          resp.data.aiQuizJson.forEach((_, idx) => {
            initial[idx] = null;
          });
          setAnswers(initial);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load lesson quiz');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (lessonId) {
      load();
    } else {
      setLoading(false);
      setError('lessonId is required');
    }

    return () => {
      cancelled = true;
    };
  }, [baseURL, lessonId, token]);

  const onSelect = (qIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const onSubmit = async () => {
    setError(null);
    setSubmitResult(null);

    try {
      const resp = await axios.post(
        `${baseURL}/lessons/${lessonId}/submit-quiz`,
        { answers },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setSubmitResult(resp.data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <section style={{ padding: 16 }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Lesson Quiz</h2>
        <div>Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: 16 }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Lesson Quiz</h2>
        <div style={{ color: '#DC2626' }}>{error}</div>
      </section>
    );
  }

  return (
    <section style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Lesson Quiz</h2>

      {aiSummary ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: 16,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            marginBottom: 16,
          }}
        >
          <h3 style={{ marginTop: 0 }}>AI Summary</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{aiSummary}</div>
        </div>
      ) : (
        <div style={{ marginBottom: 16, color: '#6B7280' }}>
          No AI summary available yet for this lesson.
        </div>
      )}

      {!Array.isArray(quiz) || quiz.length === 0 ? (
        <div style={{ color: '#6B7280' }}>No AI quiz available yet for this lesson.</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {quiz.map((q, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                {idx + 1}. {q.questionText}
              </div>

              <div role="radiogroup" aria-label={`Question ${idx + 1}`}>
                {Array.isArray(q.options) ? (
                  q.options.map((opt, oidx) => {
                    const inputId = `q${idx}-o${oidx}`;
                    const checked = Number(answers[idx]) === oidx;

                    return (
                      <div key={inputId} style={{ marginBottom: 8 }}>
                        <label htmlFor={inputId} style={{ cursor: 'pointer' }}>
                          <input
                            id={inputId}
                            type="radio"
                            name={`q${idx}`}
                            value={oidx}
                            checked={checked}
                            onChange={() => onSelect(idx, oidx)}
                            style={{ marginRight: 8 }}
                          />
                          {opt}
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#6B7280' }}>Invalid quiz data.</div>
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            style={{
              background: '#1E3A8A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Submit Quiz
          </button>
        </form>
      )}

      {submitResult ? (
        <div
          style={{
            marginTop: 16,
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.25)',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Result</div>
          <div>
            Score: {submitResult.correctCount}/{submitResult.total} ({submitResult.percentage}%)
          </div>
          <div>
            Updated readinessScore: {submitResult.readinessScore} (quiz count: {submitResult.readinessScoreQuizCount})
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default QuizView;
