import React, { useEffect, useState } from 'react';
import { User, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  currentName,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(currentName);
      setError('');
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError('학번과 이름(또는 닉네임)을 2글자 이상 입력해 주세요.');
      return;
    }
    onSave(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]">
      <div
        className="w-full max-w-[380px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="bg-[#2B4080] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#FCD757]" />
            <h2 id="profile-modal-title" className="text-base font-bold">
              작성자 학번 · 닉네임 설정
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            게시글과 댓글 작성 시 표시될 학번이나 닉네임을 입력해 주세요. 입력한 정보는
            기기에 안전하게 저장됩니다.
          </p>

          <div>
            <label
              htmlFor="student-name-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              학번 및 이름 (또는 닉네임)
            </label>
            <input
              id="student-name-input"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              placeholder="학번 및 이름을 입력해 주세요"
              maxLength={20}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#2B4080] focus:ring-2 focus:ring-[#2B4080]/15"
            />
            {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#2B4080] text-white text-sm font-bold hover:bg-[#1F2F61] cursor-pointer"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
