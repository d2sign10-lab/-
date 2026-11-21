import React, { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  Megaphone,
  Calendar,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Pin,
  X,
} from 'lucide-react';
import { useLostFound } from '../context/LostFoundContext';
import {
  FILTER_CATEGORIES,
  FilterCategory,
  ListTab,
  PostItem,
} from '../types/lostFound';
import { formatKoreanDateTime } from '../utils/formatters';
import { ItemThumbnail } from './CategoryIcon';

interface ListNoticeScreenProps {
  activeTab: ListTab;
  onTabChange: (tab: ListTab) => void;
  onSelectPost: (postId: string) => void;
}

export const ListNoticeScreen: React.FC<ListNoticeScreenProps> = ({
  activeTab,
  onTabChange,
  onSelectPost,
}) => {
  const { posts, notices } = useLostFound();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('전체');

  const filteredPosts = useMemo(() => {
    if (activeTab === 'notices') return [];
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (post.status !== 'returned') return false;
      if (post.type !== activeTab) return false;
      if (selectedCategory !== '전체' && post.category !== selectedCategory) return false;
      if (q) {
        const hay = [post.title, post.description, post.location, post.category]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, activeTab, selectedCategory, searchQuery]);

  const renderStatusBadge = (post: PostItem) => {
    if (post.status === 'returned') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {post.type === 'lost' ? '찾기 완료' : '전달 완료'}
        </span>
      );
    }
    if (post.type === 'lost') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFF7D6] border border-[#EEDB8B] text-[#8A5A00] text-[11px] font-bold whitespace-nowrap shrink-0">
          분실중
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EAF2FF] border border-[#C6DAFC] text-[#2B4080] text-[11px] font-bold whitespace-nowrap shrink-0">
        보관중
      </span>
    );
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* 1. 히어로 배너 */}
      <section className="rounded-2xl bg-[#EAF2FF] px-5 py-5 text-center border border-[#D4E4FC]">
        <h2 className="text-[26px] font-extrabold text-[#2B4080] tracking-tight leading-tight">
          찾았어요!
        </h2>
        <p className="text-[13px] font-medium text-[#2B4080]/80 mt-1">
          소중한 물건, 이제 다시 주인을 찾아가요
        </p>
      </section>

      {/* 2. 상단 메인 탭 3종 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onTabChange('lost')}
          className={`min-h-[44px] px-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'lost'
              ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-xs'
              : 'bg-white text-[#2B4080] border-[#BFCFE8] hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>분실물</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('found')}
          className={`min-h-[44px] px-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'found'
              ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-xs'
              : 'bg-white text-[#2B4080] border-[#BFCFE8] hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>습득물</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('notices')}
          className={`min-h-[44px] px-2 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notices'
              ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-xs'
              : 'bg-white text-[#2B4080] border-[#BFCFE8] hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4 shrink-0" />
          <span>공지사항</span>
        </button>
      </div>

      {/* 3. 검색바 & 가로 스크롤 카테고리 칩 (분실물/습득물 탭일 때) */}
      {activeTab !== 'notices' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="찾는 물건을 검색해보세요!"
              aria-label="찾는 물건 검색"
              className="w-full h-11 pl-4 pr-11 rounded-full bg-white border border-[#BFCFE8] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
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
              <Search className="w-4 h-4 text-[#2B4080] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {FILTER_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#2B4080] text-white border-[#2B4080]'
                      : 'bg-white text-[#2B4080] border-[#BFCFE8] hover:bg-[#EAF2FF]/60'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 리스트형 게시글 카드 OR 공지사항 목록 */}
      {activeTab === 'notices' ? (
        <div className="space-y-3">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className="rounded-2xl border border-[#CBD8F0] bg-white p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2B4080]">
                  {notice.isPinned ? (
                    <>
                      <Pin className="w-3.5 h-3.5 text-[#2B4080]" />
                      필독 공지
                    </>
                  ) : (
                    '안내'
                  )}
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">{notice.date}</span>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                {notice.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>
              <p className="text-[11px] font-semibold text-slate-400 pt-1">
                작성: {notice.author}
              </p>
            </article>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            {activeTab === 'lost'
              ? '해당 조건의 찾기 완료된 분실물이 없습니다.'
              : '해당 조건의 전달 완료된 습득물이 없습니다.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('전체');
              setSearchQuery('');
            }}
            className="min-h-[38px] px-4 rounded-xl bg-[#EAF2FF] text-[#2B4080] text-xs font-bold hover:bg-[#dce9ff] cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPosts.map((post) => {
            const { datePart, timePart } = formatKoreanDateTime(post.dateTime);
            return (
              <article
                key={post.id}
                onClick={() => onSelectPost(post.id)}
                className="rounded-2xl border border-[#BFCFE8] bg-white p-3 flex items-center gap-3 hover:border-[#2B4080] transition-colors cursor-pointer shadow-xs"
              >
                <ItemThumbnail
                  imageUrl={post.imageUrl}
                  category={post.category}
                  alt={post.title}
                  className="w-[76px] h-[76px] rounded-xl"
                  iconClassName="w-7 h-7 text-[#2B4080]"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-[#1E2E5C] truncate">
                      {post.title}
                    </h3>
                    {renderStatusBadge(post)}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-snug">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-3 text-[11px] text-[#2B4080]/80 min-w-0">
                      <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {datePart}
                        {timePart ? ` ${timePart}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{post.location}</span>
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2B4080]/60 shrink-0" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 5. 하단 푸터 문구 */}
      <footer className="pt-4 pb-2 flex items-center gap-3 text-center">
        <div className="flex-1 h-px bg-[#C7D7F2]" />
        <p className="text-[11px] font-medium text-[#2B4080]/75 whitespace-nowrap">
          분실물을 찾아주는 순간, 또 다른 행복이 됩니다.
        </p>
        <div className="flex-1 h-px bg-[#C7D7F2]" />
      </footer>
    </div>
  );
};
