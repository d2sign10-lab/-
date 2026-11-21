import React, { useState } from 'react';
import {
  Wallet,
  Backpack,
  Smartphone,
  Shirt,
  BookOpen,
  Package,
} from 'lucide-react';
import { ItemCategory } from '../types/lostFound';

interface CategoryIconProps {
  category: ItemCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-6 h-6 text-[#2B4080]',
}) => {
  switch (category) {
    case '지갑':
      return <Wallet className={className} />;
    case '가방':
      return <Backpack className={className} />;
    case '전자기기':
      return <Smartphone className={className} />;
    case '의류':
      return <Shirt className={className} />;
    case '학용품/체육복':
      return <BookOpen className={className} />;
    case '기타':
    default:
      return <Package className={className} />;
  }
};

interface ItemThumbnailProps {
  imageUrl?: string;
  category: ItemCategory;
  alt: string;
  className?: string;
  iconClassName?: string;
}

export const ItemThumbnail: React.FC<ItemThumbnailProps> = ({
  imageUrl,
  category,
  alt,
  className = 'w-20 h-20 rounded-xl',
  iconClassName = 'w-8 h-8 text-[#2B4080]',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`${className} bg-[#EAF2FF] border border-[#D4E3FC] flex flex-col items-center justify-center gap-1 shrink-0 select-none`}
        aria-label={`${category} 기본 아이콘`}
      >
        <CategoryIcon category={category} className={iconClassName} />
        <span className="text-[10px] font-semibold text-[#2B4080]/80 leading-none">
          {category === '학용품/체육복' ? '학용품' : category}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} object-cover bg-slate-100 border border-slate-200/80 shrink-0`}
    />
  );
};
