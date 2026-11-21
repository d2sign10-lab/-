import React from 'react';
import { ChevronLeft, Menu } from 'lucide-react';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogoClick: () => void;
  onMenuClick: () => void;
  hideMenu?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBack = false,
  onBack,
  onLogoClick,
  onMenuClick,
  hideMenu = false,
}) => {
  return (
    <header className="sticky top-0 z-30 h-[56px] w-full bg-[#2B4080] px-4 text-white shadow-sm flex items-center justify-between">
      {showBack ? (
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로 가기"
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-[17px] font-bold tracking-tight truncate">
            {title || '찾아드림'}
          </h1>
        </div>
      ) : (
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center gap-2.5 min-h-[44px] text-left rounded-lg hover:opacity-90 active:opacity-80 transition-opacity cursor-pointer"
        >
          <img
            src="/src/assets/images/doan_logo.png"
            alt="대전도안고등학교 교표"
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain shrink-0"
          />
          <span className="text-[20px] font-extrabold tracking-tight text-white whitespace-nowrap">
            찾아드림
          </span>
        </button>
      )}

      {!hideMenu && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="메뉴 열기"
          className="w-9 h-9 min-h-[40px] min-w-[40px] rounded-full bg-white text-[#2B4080] flex items-center justify-center shadow-sm hover:bg-[#FFF7D6] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </header>
  );
};
