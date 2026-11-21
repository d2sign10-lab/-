import React from 'react';
import {
  X,
  Home,
  LayoutList,
  Megaphone,
  PlusCircle,
  UserCheck,
  RotateCcw,
  Edit3,
  Lightbulb,
} from 'lucide-react';
import { ScreenView } from '../types/lostFound';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenView;
  studentName: string;
  onNavigateFeed: () => void;
  onNavigateList: (tab: 'lost' | 'found' | 'notices') => void;
  onNavigateCreate: () => void;
  onNavigateFeedback: () => void;
  onOpenProfileModal: () => void;
  onResetDemo: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  studentName,
  onNavigateFeed,
  onNavigateList,
  onNavigateCreate,
  onNavigateFeedback,
  onOpenProfileModal,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div
        className="w-full max-w-[430px] relative h-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px] transition-opacity cursor-pointer"
        />

        {/* Drawer Panel */}
        <aside className="absolute top-0 right-0 bottom-0 w-[290px] bg-white shadow-2xl flex flex-col justify-between">
          <div>
            {/* Drawer Header */}
            <div className="bg-[#2B4080] px-5 pt-5 pb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-blue-100">
                  대전도안고 찾아드림
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="닫기"
                  className="min-h-[40px] min-w-[40px] -mr-2 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Profile Card */}
              <div className="bg-white/12 rounded-xl p-3.5 border border-white/15 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-blue-100 mb-0.5">현재 작성자 프로필</p>
                  <p className="text-sm font-bold text-white truncate">{studentName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfileModal();
                  }}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#FCD757] text-[#2B4080] text-xs font-bold flex items-center gap-1 hover:brightness-95 transition-all cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  변경
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigateFeed();
                  onClose();
                }}
                className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                  currentScreen === 'feed'
                    ? 'bg-[#EAF2FF] text-[#2B4080]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="w-5 h-5 text-[#2B4080]" />
                <span>홈 피드 (실시간 현황판)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateList('found');
                  onClose();
                }}
                className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                  currentScreen === 'list'
                    ? 'bg-[#EAF2FF] text-[#2B4080]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutList className="w-5 h-5 text-[#2B4080]" />
                <span>찾기 완료</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateList('notices');
                  onClose();
                }}
                className="w-full min-h-[46px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Megaphone className="w-5 h-5 text-[#2B4080]" />
                <span>교내 공지사항</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateFeedback();
                  onClose();
                }}
                className={`w-full min-h-[46px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors cursor-pointer ${
                  currentScreen === 'feedback'
                    ? 'bg-[#EAF2FF] text-[#2B4080]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Lightbulb className="w-5 h-5 text-[#2B4080]" />
                <span>개선사항 요청</span>
              </button>

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  onNavigateCreate();
                  onClose();
                }}
                className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#2B4080] text-white flex items-center gap-3 text-sm font-bold hover:bg-[#1F2F61] transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-[#FCD757]" />
                <span>분실물 / 습득물 등록하기</span>
              </button>
            </nav>
          </div>

          {/* Footer Utilities */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              className="w-full min-h-[40px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기 데모 데이터 복원
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>도안고 2-10 교내 분실물 반환 서비스</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
