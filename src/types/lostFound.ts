export type PostType = 'lost' | 'found';

export type PostStatus = 'searching' | 'stored' | 'returned';

export type ItemCategory =
  | '지갑'
  | '가방'
  | '전자기기'
  | '의류'
  | '학용품/체육복'
  | '기타';

export type FilterCategory = '전체' | ItemCategory;

export type ScreenView = 'feed' | 'list' | 'detail' | 'create' | 'feedback';

export type ListTab = 'lost' | 'found' | 'notices';

export type FeedbackCategory = '오류 신고' | '기능 추가' | '개선 요청' | '기타';

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  title: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: number;
}

export interface CommentItem {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  authorDeviceId?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
}

export interface PostItem {
  id: string;
  type: PostType;
  status: PostStatus;
  category: ItemCategory;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  dateTime: string; // e.g., "2026-11-22T14:15" or empty string
  storageLocation?: string; // Only for found items
  contact?: string;
  authorName: string;
  authorDeviceId?: string;
  commentCount?: number;
  createdAt: number;
  comments: CommentItem[];
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  isPinned?: boolean;
}

export interface UserProfile {
  studentName: string; // e.g., "21015 김하늘"
}

export const CATEGORIES: ItemCategory[] = [
  '지갑',
  '가방',
  '전자기기',
  '의류',
  '학용품/체육복',
  '기타',
];

export const FILTER_CATEGORIES: FilterCategory[] = ['전체', ...CATEGORIES];

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  '오류 신고',
  '기능 추가',
  '개선 요청',
  '기타',
];
