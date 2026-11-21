import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  MessageCircle,
  Share2,
  Plus,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';
import { useLostFound } from '../context/LostFoundContext';
import {
  FILTER_CATEGORIES,
  FilterCategory,
  PostItem,
  PostType,
} from '../types/lostFound';
import { formatKoreanDateTime, formatRelativeTime } from '../utils/formatters';
import { ItemThumbnail } from './CategoryIcon';

interface MainFeedScreenProps {
  onSelectPost: (postId: string, focusComment?: boolean) => void;
  onGoToCreate: () => void;
  onGoToList: () => void;
}

export const MainFeedScreen: React.FC<MainFeedScreenProps> = ({
  onSelectPost,
  onGoToCreate,
  onGoToList,
}) => {
  const { posts, stats, showToast, isLoadingPosts } = useLostFound();
  const [typeFilter, setTypeFilter] = useState<'all' | PostType>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (post.status === 'returned') return false;
      if (typeFilter !== 'all' && post.type !== typeFilter) return false;
      if (categoryFilter !== '전체' && post.category !== categoryFilter) return false;
      if (q) {
        const hay = [
          post.title,
          post.description,
          post.location,
          post.category,
          post.authorName,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, typeFilter, categoryFilter, searchQuery]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `도안고 교내 분실물 플랫폼 '찾아드림' (현재 전체 ${stats.total}건 등록 중)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '찾아드림', text: shareText, url: shareUrl });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('찾아드림 서비스 링크가 클립보드에 복사되었습니다!');
    } catch {
      showToast('링크가 복사되었습니다. 친구들에게 공유해 보세요!');
    }
  };

  const handleQuickCommentNav = () => {
    const target = filteredPosts[0] || posts[0];
    if (target) {
      onSelectPost(target.id, true);
    } else {
      onGoToCreate();
    }
  };

  const getStatusText = (post: PostItem) => {
    if (post.status === 'returned') {
      return post.type === 'lost' ? '찾기 완료' : '전달 완료';
    }
    return post.type === 'lost' ? '분실중' : '보관중';
  };

  return (
    <div className="relative pb-36">
      <div className="px-4 pt-4 space-y-3.5">
        {/* 1. 실시간 현황판 (Status Dashboard) */}
        <section
          aria-label="실시간 분실물 현황판"
          className="rounded-2xl border-2 border-[#2B4080] bg-white shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-3 divide-x-2 divide-[#2B4080]/80 py-3">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#EAF2FF]/50 transition-colors cursor-pointer"
            >
              <span className="text-[22px] font-extrabold text-slate-900 tabular-nums leading-tight">
                {stats.total}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 whitespace-nowrap">
                전체 등록
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('lost')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#EAF2FF]/50 transition-colors cursor-pointer"
            >
              <span className="text-[22px] font-extrabold text-[#2B4080] tabular-nums leading-tight">
                {stats.searchingLost}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 whitespace-nowrap">
                찾는 중 (분실)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('found')}
              className="flex flex-col items-center justify-center px-2 py-1 hover:bg-[#EAF2FF]/50 transition-colors cursor-pointer"
            >
              <span className="text-[22px] font-extrabold text-emerald-700 tabular-nums leading-tight">
                {stats.storedFound}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 whitespace-nowrap">
                습득 보관중
              </span>
            </button>
          </div>
        </section>

        {/* 2. 유형 필터 탭 (전체 / 분실물 / 습득물) */}
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { key: 'all', label: '전체' },
              { key: 'lost', label: '분실물' },
              { key: 'found', label: '습득물' },
            ] as const
          ).map((tab) => {
            const isActive = typeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key)}
                className={`min-h-[44px] rounded-xl font-bold text-sm transition-all cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-xs'
                    : 'bg-[#FFF7D6] text-slate-700 border-[#E9DFAF] hover:bg-[#FCEFB8]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. 카테고리 선택 드롭다운 & 실시간 검색란 */}
        <div className="space-y-2.5">
          <div className="relative">
            <select
              aria-label="카테고리 선택"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
              className="w-full h-11 appearance-none rounded-xl bg-[#2B4080] text-white font-bold text-sm text-center px-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FCD757] shadow-xs"
            >
              {FILTER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-slate-900 font-medium">
                  {cat === '전체' ? '카테고리 선택 (전체)' : `카테고리: ${cat}`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-white pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="찾는 물건을 검색해보세요!"
              aria-label="찾는 물건 검색"
              className="w-full h-11 pl-4 pr-11 rounded-xl bg-white border-2 border-[#2B4080]/75 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="검색어 지우기"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-5 h-5 text-[#2B4080]/70 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* 목록형 찾기 완료 페이지 바로가기 */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            진행 중 게시글 {filteredPosts.length}건
          </span>

          <button
            type="button"
            onClick={onGoToList}
            className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold text-[#2B4080] bg-[#EAF2FF] hover:bg-[#dce9ff] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            찾기 완료 · 공지사항
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. 게시글 카드 피드 */}
        {isLoadingPosts && posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-600">
              실시간 게시글을 불러오는 중입니다...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              조건에 맞는 게시글이 아직 없습니다.
            </p>
            <p className="text-xs text-slate-500">
              검색어나 카테고리 필터를 초기화하거나 새 글을 등록해 보세요.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('all');
                  setCategoryFilter('전체');
                  setSearchQuery('');
                }}
                className="min-h-[40px] px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                필터 초기화
              </button>
              <button
                type="button"
                onClick={onGoToCreate}
                className="min-h-[40px] px-4 rounded-xl bg-[#2B4080] text-white text-xs font-bold hover:bg-[#1F2F61] cursor-pointer"
              >
                새 글 등록하기
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredPosts.map((post) => {
              const { datePart } = formatKoreanDateTime(post.dateTime);
              const isReturned = post.status === 'returned';
              return (
                <article
                  key={post.id}
                  onClick={() => onSelectPost(post.id)}
                  className="rounded-2xl border border-[#CBD8F0] bg-white shadow-xs overflow-hidden hover:border-[#2B4080] transition-colors cursor-pointer"
                >
                  {/* 카드 상단 바: 분실물/습득물 명시 */}
                  <div className="bg-[#EAF2FF] px-4 py-2 flex items-center justify-between border-b border-[#D6E4FB]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold ${
                          post.type === 'found'
                            ? 'bg-white text-[#2B4080] border border-[#BFD5FA]'
                            : 'bg-[#FFF7D6] text-[#8A5A00] border border-[#F2DB82]'
                        }`}
                      >
                        {post.type === 'found' ? '습득물' : '분실물'}
                      </span>
                      <span className="text-[11px] font-semibold text-[#2B4080]/80">
                        {post.category}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isReturned
                          ? 'bg-emerald-600 text-white'
                          : post.type === 'lost'
                          ? 'bg-[#FFF7D6] text-[#8A5A00] border border-[#E7C96B]'
                          : 'bg-white text-[#2B4080] border border-[#BFD5FA]'
                      }`}
                    >
                      {isReturned && <CheckCircle2 className="w-3 h-3" />}
                      {getStatusText(post)}
                    </span>
                  </div>

                  {/* 작성자 및 본문 */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {post.authorName}
                          </p>
                          <p className="text-[11px] text-slate-400 tabular-nums">
                            {formatRelativeTime(post.createdAt)} · {datePart}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 tabular-nums shrink-0">
                        <MessageCircle className="w-3.5 h-3.5 text-[#2B4080]" />
                        {post.commentCount ?? post.comments.length}
                      </span>
                    </div>

                    {/* 사진 첨부 + 글 내용 2열 배치 */}
                    <div className="flex gap-3.5 items-start">
                      <ItemThumbnail
                        imageUrl={post.imageUrl}
                        category={post.category}
                        alt={post.title}
                        className="w-[116px] h-[126px] rounded-xl"
                        iconClassName="w-9 h-9 text-[#2B4080]"
                      />

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {post.description}
                        </p>

                        <div className="pt-1 space-y-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#2B4080] shrink-0" />
                            <span className="truncate">{post.location}</span>
                          </div>
                          {post.storageLocation && (
                            <div className="flex items-center gap-1 truncate">
                              <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span className="truncate">보관: {post.storageLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. 우측 하단 플로팅 액션 버튼 (FAB) 3종 - 세로 배치 & 하단 배지 회피 */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pointer-events-none z-20 flex justify-end">
        <div className="flex flex-col items-center gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleQuickCommentNav}
            aria-label="댓글 및 문의 바로가기"
            title="댓글/문의 바로가기"
            className="w-12 h-12 rounded-full bg-[#2B4080]/92 text-white shadow-lg border border-white/20 flex items-center justify-center hover:bg-[#1F2F61] active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="공유하기"
            title="공유하기"
            className="w-12 h-12 rounded-full bg-[#2B4080]/92 text-white shadow-lg border border-white/20 flex items-center justify-center hover:bg-[#1F2F61] active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onGoToCreate}
            aria-label="새 글 작성"
            title="분실물 / 습득물 등록"
            className="w-13 h-13 rounded-full bg-[#2B4080] text-white shadow-xl border-2 border-[#FCD757] flex items-center justify-center hover:bg-[#1F2F61] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
