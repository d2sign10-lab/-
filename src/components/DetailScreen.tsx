import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  MoreVertical,
  Send,
  UserCheck,
  PackageCheck,
  MapPin,
  Calendar,
  Archive,
  Phone,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  ZoomIn,
} from 'lucide-react';
import { useLostFound } from '../context/LostFoundContext';
import { CommentItem } from '../types/lostFound';
import { formatKoreanDateTime, formatRelativeTime } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface DetailScreenProps {
  postId: string;
  autoFocusComment?: boolean;
  onPostDeleted: () => void;
}

export const DetailScreen: React.FC<DetailScreenProps> = ({
  postId,
  autoFocusComment = false,
  onPostDeleted,
}) => {
  const {
    posts,
    activePostComments,
    isLoadingComments,
    setActivePostId,
    deviceId,
    userProfile,
    setPostStatus,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
  } = useLostFound();

  const post = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);

  useEffect(() => {
    setActivePostId(postId);
    return () => setActivePostId(null);
  }, [postId, setActivePostId]);

  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    targetAuthor: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const commentsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoFocusComment && commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      mainInputRef.current?.focus();
    }
  }, [autoFocusComment]);

  if (!post) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          존재하지 않거나 삭제된 게시글입니다.
        </p>
      </div>
    );
  }

  const topLevelComments = activePostComments.filter((c) => c.parentId === null);
  const getReplies = (parentId: string) =>
    activePostComments.filter((c) => c.parentId === parentId);

  const { datePart, timePart } = formatKoreanDateTime(post.dateTime);
  const isReturned = post.status === 'returned';
  const isAuthor =
    (post.authorDeviceId && post.authorDeviceId === deviceId) ||
    post.authorName === userProfile.studentName;

  const handleSubmitMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText('');
    await addComment(post.id, text, null);
  };

  const handleQuickChip = (text: string) => {
    setCommentText(text);
    mainInputRef.current?.focus();
  };

  const handleOpenReply = (parentId: string, targetAuthor: string, mentionPrefix = false) => {
    setReplyTarget({ parentId, targetAuthor });
    setReplyText(mentionPrefix ? `@${targetAuthor} ` : '');
    setOpenMenuId(null);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;
    const targetParent = replyTarget.parentId;
    const text = replyText;
    setReplyTarget(null);
    setReplyText('');
    await addComment(post.id, text, targetParent);
  };

  const handleStartEdit = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;
    const nextText = editingText;
    setEditingCommentId(null);
    setEditingText('');
    await updateComment(post.id, commentId, nextText);
  };

  const renderCommentMenu = (comment: CommentItem) => {
    const isMenuOpen = openMenuId === comment.id;
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenuId(isMenuOpen ? null : comment.id)}
          aria-label="댓글 더보기 메뉴"
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-9 z-20 w-28 rounded-xl bg-white border border-slate-200 shadow-lg py-1 overflow-hidden">
            <button
              type="button"
              onClick={() => handleStartEdit(comment)}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              수정하기
            </button>
            <button
              type="button"
              onClick={() => {
                deleteComment(post.id, comment.id);
                setOpenMenuId(null);
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제하기
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-36">
      <div className="p-4 space-y-3.5">
        {/* 1. 상단 게시글 요약 헤더 카드 */}
        <section className="rounded-2xl border border-[#BFCFE8] bg-white p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-13 h-13 rounded-xl bg-[#EAF2FF] border border-[#D3E3FC] flex items-center justify-center shrink-0">
              <CategoryIcon category={post.category} className="w-7 h-7 text-[#2B4080]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#2B4080]">
                {post.type === 'lost' ? '분실물 게시글' : '습득물 게시글'} · {post.category}
              </span>
              <h2 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                {post.title}
              </h2>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 flex items-center gap-1 ${
              isReturned
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : post.type === 'lost'
                ? 'bg-[#FFF7D6] text-[#8A5A00] border-[#E7C96B]'
                : 'bg-[#EAF2FF] text-[#2B4080] border-[#B6CEF6]'
            }`}
          >
            {isReturned ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {post.type === 'lost' ? '찾기 완료' : '전달 완료'}
              </>
            ) : post.type === 'lost' ? (
              '분실중'
            ) : (
              '보관중'
            )}
          </span>
        </section>

        {/* 2. 상세 본문 & 첨부 사진 & 메타데이터 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
          {/* 작성자 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{post.authorName}</p>
                <p className="text-[11px] text-slate-400">
                  {formatRelativeTime(post.createdAt)} 등록
                </p>
              </div>
            </div>

            {isAuthor && (
              <button
                type="button"
                onClick={async () => {
                  await deletePost(post.id);
                  onPostDeleted();
                }}
                className="min-h-[34px] px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                글 삭제
              </button>
            )}
          </div>

          {/* 첨부 사진 */}
          {post.imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={post.imageUrl}
                alt={post.title}
                referrerPolicy="no-referrer"
                onClick={() => setIsImageZoomed(true)}
                className="w-full max-h-[260px] object-cover cursor-zoom-in"
              />
              <button
                type="button"
                onClick={() => setIsImageZoomed(true)}
                aria-label="사진 크게 보기"
                className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/65 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-xs cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                크게 보기
              </button>
            </div>
          )}

          {/* 물품 설명 */}
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>

          {/* 상세 위치/날짜/보관위치/연락처 */}
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#2B4080] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 mr-2">
                  {post.type === 'found' ? '발견 위치' : '분실 추정 위치'}
                </span>
                <span className="font-bold text-slate-900">{post.location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#2B4080] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 mr-2">
                  {post.type === 'found' ? '발견 일시' : '분실 일시'}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {datePart} {timePart}
                </span>
              </div>
            </div>

            {post.storageLocation && (
              <div className="flex items-start gap-2">
                <Archive className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-500 mr-2">현재 보관위치</span>
                  <span className="font-bold text-emerald-800">{post.storageLocation}</span>
                </div>
              </div>
            )}

            {post.contact && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#2B4080] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-500 mr-2">연락처</span>
                  <span className="font-bold text-slate-900">{post.contact}</span>
                </div>
              </div>
            )}
          </div>

          {/* 상태 선택 버튼 (분실중/찾기 완료 또는 보관중/전달 완료) */}
          <div className="pt-1 space-y-2">
            <p className="text-xs font-bold text-slate-600">진행 상태 선택</p>
            {post.type === 'lost' ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPostStatus(post.id, 'searching')}
                  aria-pressed={post.status === 'searching'}
                  className={`min-h-[44px] px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    post.status === 'searching'
                      ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  분실중
                </button>

                <button
                  type="button"
                  onClick={() => setPostStatus(post.id, 'returned')}
                  aria-pressed={post.status === 'returned'}
                  className={`min-h-[44px] px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    post.status === 'returned'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  찾기 완료
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPostStatus(post.id, 'stored')}
                  aria-pressed={post.status === 'stored'}
                  className={`min-h-[44px] px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    post.status === 'stored'
                      ? 'bg-[#2B4080] text-white border-[#2B4080] shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  보관중
                </button>

                <button
                  type="button"
                  onClick={() => setPostStatus(post.id, 'returned')}
                  aria-pressed={post.status === 'returned'}
                  className={`min-h-[44px] px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                    post.status === 'returned'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  전달 완료
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. 댓글 및 대댓글 영역 */}
        <section
          ref={commentsSectionRef}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-900">
              댓글{' '}
              <span className="text-[#2B4080] tabular-nums">
                {isLoadingComments ? (post.commentCount ?? 0) : activePostComments.length}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              작성 프로필: {userProfile.studentName}
            </span>
          </div>

          {isLoadingComments && activePostComments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              댓글을 불러오는 중입니다...
            </div>
          ) : topLevelComments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              아직 댓글이 없습니다. 첫 댓글로 주인 찾기 소통을 시작해 보세요!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topLevelComments.map((comment) => {
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="p-4 space-y-3">
                    {/* 최상위 댓글 */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {comment.author}
                            </span>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                              {formatRelativeTime(comment.createdAt)}
                              {comment.updatedAt ? ' (수정됨)' : ''}
                            </span>
                          </div>
                          {renderCommentMenu(comment)}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 h-9 px-3 rounded-lg border border-[#2B4080] text-xs focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(comment.id)}
                              className="h-9 px-3 rounded-lg bg-[#2B4080] text-white text-xs font-bold cursor-pointer"
                            >
                              저장
                            </button>
                          </div>
                        ) : (
                          <p className="text-[13px] text-slate-800 leading-relaxed mt-0.5 break-words">
                            {comment.content}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenReply(comment.id, comment.author, false)}
                          className="mt-1.5 text-xs font-semibold text-slate-500 hover:text-[#2B4080] cursor-pointer"
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>

                    {/* 계층형(L자 연결선) 대댓글 목록 */}
                    {replies.map((reply) => (
                      <div key={reply.id} className="pl-3 flex items-stretch gap-2">
                        {/* L자 연결선 */}
                        <div className="w-4 flex flex-col items-center shrink-0">
                          <div className="w-3.5 h-5 border-l-2 border-b-2 border-[#CBD8F0] rounded-bl-md" />
                        </div>

                        <div className="flex-1 rounded-xl bg-[#F4F7FB] border border-[#E5ECF7] p-3">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#DCE6F7] flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-[#2B4080]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {reply.author}
                                  </span>
                                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                    {formatRelativeTime(reply.createdAt)}
                                    {reply.updatedAt ? ' (수정됨)' : ''}
                                  </span>
                                </div>
                                {renderCommentMenu(reply)}
                              </div>

                              {editingCommentId === reply.id ? (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="flex-1 h-9 px-3 rounded-lg border border-[#2B4080] text-xs bg-white focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setEditingCommentId(null)}
                                    className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 cursor-pointer"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(reply.id)}
                                    className="h-9 px-3 rounded-lg bg-[#2B4080] text-white text-xs font-bold cursor-pointer"
                                  >
                                    저장
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[13px] text-slate-800 leading-relaxed mt-0.5 break-words">
                                  {reply.content}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenReply(comment.id, reply.author, true)}
                                className="mt-1 text-xs font-semibold text-slate-500 hover:text-[#2B4080] cursor-pointer"
                              >
                                답글 달기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 인라인 대댓글 입력창 */}
                    {replyTarget && replyTarget.parentId === comment.id && (
                      <div className="pl-3 flex items-stretch gap-2">
                        <div className="w-4 flex flex-col items-center shrink-0">
                          <div className="w-3.5 h-6 border-l-2 border-b-2 border-[#CBD8F0] rounded-bl-md" />
                        </div>

                        <form
                          onSubmit={handleSubmitReply}
                          className="flex-1 rounded-xl bg-[#F4F7FB] border border-[#D4E2F9] p-2.5 flex items-center gap-1.5"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`@${replyTarget.targetAuthor}에게 답글...`}
                            autoFocus
                            className="flex-1 min-w-0 h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTarget(null);
                              setReplyText('');
                            }}
                            className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="h-9 px-3 rounded-lg bg-[#2B4080] text-white text-xs font-bold hover:bg-[#1F2F61] cursor-pointer shrink-0"
                          >
                            등록
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 4. 하단 고정 댓글 입력 바 & 원클릭 퀵 댓글 칩 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 pt-2.5 pb-3 z-30 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        {/* 원클릭 퀵 댓글 칩 2개 */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleQuickChip('물건 주인입니다! ')}
            className="min-h-[34px] px-3 py-1 rounded-full bg-[#EAF2FF] border border-[#BED4FA] text-[#2B4080] text-xs font-bold flex items-center gap-1.5 hover:bg-[#dce9ff] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <UserCheck className="w-3.5 h-3.5" />
            물건 주인입니다
          </button>

          <button
            type="button"
            onClick={() => handleQuickChip('물건 습득했습니다! ')}
            className="min-h-[34px] px-3 py-1 rounded-full bg-[#E9F7EC] border border-[#BCE4C6] text-[#1D743B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#d9f1de] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            물건 습득했습니다
          </button>
        </div>

        {/* 댓글 입력창 + 등록 버튼 */}
        <form onSubmit={handleSubmitMainComment} className="flex items-center gap-2">
          <input
            ref={mainInputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            aria-label="댓글 입력"
            className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2B4080]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="h-11 px-4 rounded-xl bg-[#2B4080] text-white text-sm font-bold flex items-center gap-1.5 hover:bg-[#1F2F61] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            등록
          </button>
        </form>
      </div>

      {/* 이미지 확대 라이트박스 모달 */}
      {isImageZoomed && post.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            type="button"
            aria-label="이미지 닫기"
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={post.imageUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
