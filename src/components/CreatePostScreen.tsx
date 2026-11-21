import React, { useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Trash2, AlertCircle } from 'lucide-react';
import { useLostFound } from '../context/LostFoundContext';
import { CATEGORIES, ItemCategory, PostType } from '../types/lostFound';
import { getCurrentDateTimeLocalValue, readAndCompressImage } from '../utils/formatters';

interface CreatePostScreenProps {
  onSuccess: (createdPostId: string) => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onSuccess }) => {
  const { addPost, userProfile } = useLostFound();
  const [type, setType] = useState<PostType>('lost');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [foundDateTime, setFoundDateTime] = useState(() => getCurrentDateTimeLocalValue());
  const [lostDateTime, setLostDateTime] = useState('');
  const [isLostDateFocused, setIsLostDateFocused] = useState(false);
  const [storageLocation, setStorageLocation] = useState('');
  const [contact, setContact] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMessage('');
    try {
      const dataUrl = await readAndCompressImage(file);
      setImageUrl(dataUrl);
    } catch {
      setErrorMessage('이미지를 불러오는 중 문제가 발생했습니다. 다른 사진을 선택해 주세요.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!category) {
      setErrorMessage('카테고리를 선택해 주세요.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('물품명을 작성해 주세요.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('물품 상세설명을 작성해 주세요.');
      return;
    }
    if (type === 'found') {
      if (!location.trim()) {
        setErrorMessage('발견 위치를 입력해 주세요.');
        return;
      }
      if (!foundDateTime) {
        setErrorMessage('발견 날짜 및 시간을 선택해 주세요.');
        return;
      }
      if (!storageLocation.trim()) {
        setErrorMessage('현재 보관위치를 입력해 주세요. (예: 2-10 교실, 교무실)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const created = await addPost({
        type,
        category,
        title,
        description,
        imageUrl,
        location: location.trim() || '교내 (상세 위치 미상)',
        dateTime: type === 'found' ? foundDateTime : lostDateTime,
        storageLocation: type === 'found' ? storageLocation : undefined,
        contact,
      });

      onSuccess(created.id);
    } catch {
      setErrorMessage('게시글 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-5 pb-10 space-y-4">
      {/* 1. 상단 대형 유형 선택 토글 (분실물 / 습득물) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setType('lost');
            setErrorMessage('');
          }}
          className={`h-16 rounded-2xl text-lg font-extrabold border-2 transition-all cursor-pointer ${
            type === 'lost'
              ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-sm'
              : 'bg-[#FFF7D6] text-slate-400 border-[#E8DDA9] hover:text-slate-600'
          }`}
        >
          분실물
        </button>

        <button
          type="button"
          onClick={() => {
            setType('found');
            setErrorMessage('');
          }}
          className={`h-16 rounded-2xl text-lg font-extrabold border-2 transition-all cursor-pointer ${
            type === 'found'
              ? 'bg-[#FCD757] text-[#2B4080] border-[#2B4080] shadow-sm'
              : 'bg-[#FFF7D6] text-slate-400 border-[#E8DDA9] hover:text-slate-600'
          }`}
        >
          습득물
        </button>
      </div>

      {/* 작성자 안내 */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>
          작성자: <strong className="text-[#2B4080]">{userProfile.studentName}</strong>
        </span>
        <span>* 필수 입력 항목</span>
      </div>

      {/* 2. 카테고리 선택 (네이비 바 드롭다운) */}
      <div>
        <div className="relative">
          <select
            aria-label="카테고리 선택"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as ItemCategory);
              if (errorMessage) setErrorMessage('');
            }}
            className="w-full h-11 appearance-none rounded-xl bg-[#2B4080] text-white font-bold text-sm text-center px-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FCD757] shadow-xs"
          >
            <option value="" disabled className="bg-white text-slate-500">
              카테고리 선택 *
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-white text-slate-900 font-medium">
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 text-white pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 3. 사진 첨부 (선택) */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {imageUrl ? (
          <div className="relative rounded-2xl border border-slate-300 bg-white overflow-hidden">
            <img
              src={imageUrl}
              alt="첨부된 물품 사진 미리보기"
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-3 rounded-lg bg-slate-900/75 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
              >
                사진 변경
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageUrl(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="사진 삭제"
                className="h-9 w-9 rounded-lg bg-rose-600/90 text-white flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-[#2B4080] hover:bg-[#EAF2FF]/30 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 cursor-pointer"
          >
            <ImagePlus className="w-8 h-8 text-[#2B4080]/60" />
            <span className="text-sm font-bold text-slate-500">
              {isUploadingImage
                ? '사진 불러오는 중...'
                : type === 'lost'
                ? '분실물 사진 첨부 (선택)'
                : '습득물 사진 첨부 (선택)'}
            </span>
            <span className="text-[11px] text-slate-400">
              터치하여 갤러리 또는 파일에서 이미지를 선택하세요
            </span>
          </button>
        )}
      </div>

      {/* 4. 물품명 작성 (필수) */}
      <div>
        <label htmlFor="item-title" className="sr-only">
          물품명 작성
        </label>
        <input
          id="item-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          placeholder="물품명 작성 * (예: 검은색 지갑, 에어팟 프로)"
          maxLength={40}
          className="w-full h-12 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080] focus:ring-2 focus:ring-[#2B4080]/10"
        />
      </div>

      {/* 5. 물품 상세설명 작성 (필수) */}
      <div>
        <label htmlFor="item-description" className="sr-only">
          물품 상세설명 작성
        </label>
        <textarea
          id="item-description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          placeholder="물품 상세설명 작성 * (색상, 브랜드, 특징, 안에 든 내용물 등)"
          maxLength={1000}
          className="w-full p-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080] focus:ring-2 focus:ring-[#2B4080]/10 resize-none"
        />
      </div>

      {/* 6. 조건부 필드: 습득물 vs 분실물 */}
      {type === 'found' ? (
        <div className="space-y-3 pt-1">
          <div>
            <label
              htmlFor="found-location"
              className="block text-xs font-bold text-[#2B4080] mb-1.5 ml-1"
            >
              발견 위치 및 날짜 *
            </label>
            <div className="space-y-2">
              <input
                id="found-location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="발견 위치 입력 * (예: 교문 앞, 급식실, 본관 1층)"
                maxLength={120}
                className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
              />
              <input
                aria-label="발견 날짜 및 시간"
                type="datetime-local"
                value={foundDateTime}
                onChange={(e) => setFoundDateTime(e.target.value)}
                className="block w-full min-w-0 max-w-full box-border appearance-none h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#2B4080]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="storage-location"
              className="block text-xs font-bold text-[#2B4080] mb-1.5 ml-1"
            >
              현재 보관위치 *
            </label>
            <input
              id="storage-location"
              type="text"
              value={storageLocation}
              onChange={(e) => {
                setStorageLocation(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="현재 보관위치 입력 * (예: 2-10 교실, 본관 교무실)"
              maxLength={120}
              className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="분실 추정 위치 (선택, 예: 도서관 2층, 체육관)"
              aria-label="분실 추정 위치"
              maxLength={120}
              className="w-full min-w-0 max-w-full box-border h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
            />
          </div>

          <div className="w-full min-w-0 overflow-hidden">
            <label htmlFor="lost-datetime" className="sr-only">
              분실 추정 일시 (선택)
            </label>
            <input
              id="lost-datetime"
              type={isLostDateFocused || lostDateTime ? 'datetime-local' : 'text'}
              value={lostDateTime}
              onFocus={() => setIsLostDateFocused(true)}
              onBlur={() => setIsLostDateFocused(false)}
              onChange={(e) => setLostDateTime(e.target.value)}
              placeholder="분실 추정 일시 (선택)"
              aria-label="분실 추정 일시 (선택)"
              className="block w-full min-w-0 max-w-full box-border appearance-none h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
            />
          </div>
        </div>
      )}

      {/* 7. 연락처 및 인스타 아이디 (선택) */}
      <div>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="연락처 및 인스타 아이디 (선택)"
          aria-label="연락처 및 인스타 아이디"
          maxLength={120}
          className="w-full h-11 px-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B4080]"
        />
      </div>

      {/* 에러 안내 */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 등록하기 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting || isUploadingImage}
        className="w-full h-12 rounded-xl bg-[#2B4080] text-white text-[15px] font-extrabold shadow-md hover:bg-[#1F2F61] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all cursor-pointer"
      >
        {isSubmitting ? '등록 중...' : '등록하기'}
      </button>
    </form>
  );
};
