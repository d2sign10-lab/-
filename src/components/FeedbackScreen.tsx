import React, { useState } from 'react';
import { AlertCircle, CheckSquare, Lightbulb, Send, Square, User, UserX } from 'lucide-react';
import { useLostFound } from '../context/LostFoundContext';
import { FEEDBACK_CATEGORIES, FeedbackCategory } from '../types/lostFound';
import { formatRelativeTime } from '../utils/formatters';

export const FeedbackScreen: React.FC = () => {
  const { feedbacks, userProfile, addFeedback } = useLostFound();
  const [category, setCategory] = useState<FeedbackCategory>('개선 요청');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) {
      setErrorMessage('요청 제목을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('오류 내용이나 개선·추가 요청 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFeedback({
        category,
        title,
        content,
        isAnonymous,
      });

      setTitle('');
      setContent('');
      setErrorMessage('');
    } catch {
      setErrorMessage('요청 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-10 space-y-5">
      {/* 상단 안내 배너 */}
      <section className="rounded-2xl bg-[#EAF2FF] border border-[#D4E4FC] px-4 py-4 space-y-1">
        <div className="flex items-center gap-2 text-[#2B4080]">
          <Lightbulb className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-extrabold tracking-tight">개선사항 요청</h2>
        </div>
        <p className="text-xs text-[#2B4080]/80 leading-relaxed">
          서비스 이용 중 발견한 오류, 추가되었으면 하는 기능, 불편한 점을 자유롭게 작성해
          주세요.
        </p>
      </section>

      {/* 작성 폼 (댓글/답글 기능 없이 작성 기능만 제공) */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#CBD8F0] bg-white p-4 shadow-xs space-y-3.5"
      >
        {/* 요청 유형 선택 */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-slate-700">요청 유형</p>
          <div className="grid grid-cols-4 gap-1.5">
            {FEEDBACK_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`min-h-[38px] px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080]'
                      : 'bg-[#FFF7D6]/70 text-slate-600 border-[#E9DFAF] hover:bg-[#FFF7D6]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 제목 입력 */}
        <div>
          <label htmlFor="feedback-title" className="sr-only">
            제목
          </label>
          <input
            id="feedback-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="제목 작성 * (예: 검색 필터 오류, 기능 추가 제안)"
            maxLength={50}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2B4080]"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label htmlFor="feedback-content" className="sr-only">
            개선 내용
          </label>
          <textarea
            id="feedback-content"
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="오류 상황이나 개선·추가 요청 내용을 자세히 적어주세요 *"
            maxLength={1000}
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2B4080] resize-none"
          />
        </div>

        {/* 익명 선택 토글 */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous((prev) => !prev)}
            className="min-h-[40px] px-2.5 -ml-1 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {isAnonymous ? (
              <CheckSquare className="w-5 h-5 text-[#2B4080] shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <span>익명으로 작성하기</span>
          </button>

          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            {isAnonymous ? (
              <>
                <UserX className="w-3.5 h-3.5 text-slate-400" />
                표시: 익명
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#2B4080]" />
                표시: {userProfile.studentName.trim() || '익명 학생 (학번·이름 미입력)'}
              </>
            )}
          </span>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 flex items-center gap-2 text-xs font-semibold text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-[#2B4080] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#1F2F61] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? '등록 중...' : '요청 등록하기'}
        </button>
      </form>

      {/* 등록된 개선사항 목록 (읽기 전용 - 댓글/답글 기능 없음) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">
            접수된 요청 <span className="text-[#2B4080] tabular-nums">{feedbacks.length}건</span>
          </h3>
          <span className="text-[11px] text-slate-400">찾아드림 프로젝트팀 확인</span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            아직 등록된 개선사항 요청이 없습니다.
          </div>
        ) : (
          <div className="space-y-2.5">
            {feedbacks.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      item.category === '오류 신고'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.category === '기능 추가'
                        ? 'bg-[#EAF2FF] text-[#2B4080] border border-[#C6DAFC]'
                        : 'bg-[#FFF7D6] text-[#8A5A00] border border-[#EEDB8B]'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  {item.isAnonymous ? (
                    <UserX className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#2B4080]" />
                  )}
                  <span>{item.authorName}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
