import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { INITIAL_NOTICES, INITIAL_POSTS } from '../data/mockData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CommentItem,
  FeedbackCategory,
  FeedbackItem,
  ItemCategory,
  NoticeItem,
  PostItem,
  PostStatus,
  PostType,
  UserProfile,
} from '../types/lostFound';

const STORAGE_PROFILE_KEY = 'doan_finddream_profile_v1';
const STORAGE_DEVICE_ID_KEY = 'doan_finddream_device_id_v1';

export interface CreateFeedbackInput {
  category: FeedbackCategory;
  title: string;
  content: string;
  isAnonymous: boolean;
}

export interface CreatePostInput {
  type: PostType;
  category: ItemCategory;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  dateTime: string;
  storageLocation?: string;
  contact?: string;
}

interface LostFoundContextValue {
  posts: PostItem[];
  notices: NoticeItem[];
  feedbacks: FeedbackItem[];
  activePostComments: CommentItem[];
  isLoadingPosts: boolean;
  isLoadingComments: boolean;
  deviceId: string;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  setActivePostId: (postId: string | null) => void;
  stats: {
    total: number;
    searchingLost: number;
    storedFound: number;
  };
  addPost: (input: CreatePostInput) => Promise<PostItem>;
  setPostStatus: (postId: string, status: PostStatus) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string | null) => Promise<void>;
  updateComment: (postId: string, commentId: string, newContent: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  addFeedback: (input: CreateFeedbackInput) => Promise<void>;
  resetDemoData: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LostFoundContext = createContext<LostFoundContextValue | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_DEVICE_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{4,64}$/.test(existing)) {
      return existing;
    }
    const created = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_DEVICE_ID_KEY, created);
    return created;
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'number') return value;
  return Date.now();
}

function generateDocId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const LostFoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [notices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activePostComments, setActivePostComments] = useState<CommentItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [deviceId] = useState<string>(getOrCreateDeviceId);
  const [userProfile, setUserProfileState] = useState<UserProfile>(() =>
    loadFromStorage<UserProfile>(STORAGE_PROFILE_KEY, { studentName: '21015 김하늘' })
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const seedAttemptedRef = useRef(false);

  if (fatalError) {
    throw fatalError;
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(userProfile));
    } catch {
      // Ignore storage error
    }
  }, [userProfile]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const seedMissingInitialPosts = useCallback(async () => {
    for (const post of [...INITIAL_POSTS].reverse()) {
      const postRef = doc(db, 'posts', post.id);
      let snap;
      try {
        snap = await getDoc(postRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `posts/${post.id}`);
      }
      if (snap.exists()) continue;

      const batch = writeBatch(db);
      const postPayload: Record<string, unknown> = {
        type: post.type,
        status: post.status,
        category: post.category,
        title: post.title.slice(0, 80),
        description: post.description.slice(0, 1000),
        location: post.location.slice(0, 120),
        dateTime: post.dateTime.slice(0, 40),
        authorName: post.authorName.slice(0, 40),
        authorDeviceId: 'seed-team',
        commentCount: post.comments.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (post.imageUrl) {
        postPayload.imageUrl = post.imageUrl;
      }
      if (post.storageLocation) {
        postPayload.storageLocation = post.storageLocation.slice(0, 120);
      }
      if (post.contact) {
        postPayload.contact = post.contact.slice(0, 120);
      }

      batch.set(postRef, postPayload);

      for (const comment of post.comments) {
        const commentRef = doc(db, 'posts', post.id, 'comments', comment.id);
        batch.set(commentRef, {
          postId: post.id,
          parentId: comment.parentId || '',
          author: comment.author.slice(0, 40),
          authorDeviceId: 'seed-team',
          content: comment.content.slice(0, 500),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}`);
      }
    }
  }, []);

  // Subscribe to shared posts collection
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const nextPosts: PostItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          const rawCategory = data.category as string;
          const category: ItemCategory =
            rawCategory === '휴대폰' ? '전자기기' : (rawCategory as ItemCategory);
          return {
            id: d.id,
            type: data.type as PostType,
            status: data.status as PostStatus,
            category,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            imageUrl: typeof data.imageUrl === 'string' && data.imageUrl ? data.imageUrl : undefined,
            location: String(data.location ?? ''),
            dateTime: String(data.dateTime ?? ''),
            storageLocation:
              typeof data.storageLocation === 'string' && data.storageLocation
                ? data.storageLocation
                : undefined,
            contact: typeof data.contact === 'string' && data.contact ? data.contact : undefined,
            authorName: String(data.authorName ?? ''),
            authorDeviceId:
              typeof data.authorDeviceId === 'string' ? data.authorDeviceId : undefined,
            commentCount: typeof data.commentCount === 'number' ? data.commentCount : 0,
            createdAt: toMillis(data.createdAt),
            comments: [],
          };
        });
        setPosts(nextPosts);
        setIsLoadingPosts(false);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'posts');
        } catch (err) {
          setFatalError(err as Error);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Seed initial demo posts once if Firestore /posts is completely empty
  useEffect(() => {
    if (seedAttemptedRef.current) return;
    seedAttemptedRef.current = true;

    (async () => {
      try {
        const existingSnap = await getDocs(query(collection(db, 'posts'), limit(1)));
        if (existingSnap.empty) {
          await seedMissingInitialPosts();
        }
      } catch (error) {
        try {
          if (error instanceof Error && error.message.startsWith('{')) {
            throw error;
          }
          handleFirestoreError(error, OperationType.LIST, 'posts');
        } catch (err) {
          setFatalError(err as Error);
        }
      }
    })();
  }, [seedMissingInitialPosts]);

  // Subscribe to shared feedbacks collection
  useEffect(() => {
    const feedbackQuery = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const nextFeedbacks: FeedbackItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            category: data.category as FeedbackCategory,
            title: String(data.title ?? ''),
            content: String(data.content ?? ''),
            authorName: String(data.authorName ?? '익명'),
            isAnonymous: Boolean(data.isAnonymous),
            createdAt: toMillis(data.createdAt),
          };
        });
        setFeedbacks(nextFeedbacks);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'feedbacks');
        } catch (err) {
          setFatalError(err as Error);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to comments of the currently open detail post
  useEffect(() => {
    if (!activePostId) {
      setActivePostComments([]);
      setIsLoadingComments(false);
      return;
    }

    setIsLoadingComments(true);
    const commentsPath = `posts/${activePostId}/comments`;
    const commentsQuery = query(collection(db, 'posts', activePostId, 'comments'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const nextComments: CommentItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          const createdMs = toMillis(data.createdAt);
          const updatedMs = data.updatedAt ? toMillis(data.updatedAt) : undefined;
          const wasEdited =
            updatedMs !== undefined && Math.abs(updatedMs - createdMs) > 1500;
          return {
            id: d.id,
            postId: String(data.postId ?? activePostId),
            parentId: data.parentId ? String(data.parentId) : null,
            author: String(data.author ?? ''),
            authorDeviceId:
              typeof data.authorDeviceId === 'string' ? data.authorDeviceId : undefined,
            content: String(data.content ?? ''),
            createdAt: createdMs,
            updatedAt: wasEdited ? updatedMs : undefined,
          };
        });
        setActivePostComments(nextComments);
        setIsLoadingComments(false);
      },
      (error) => {
        setIsLoadingComments(false);
        try {
          handleFirestoreError(error, OperationType.LIST, commentsPath);
        } catch (err) {
          setFatalError(err as Error);
        }
      }
    );

    return () => unsubscribe();
  }, [activePostId]);

  const setUserProfile = useCallback(
    (profile: UserProfile) => {
      const trimmed = profile.studentName.trim().slice(0, 40);
      if (!trimmed) return;
      setUserProfileState({ studentName: trimmed });
      showToast(`작성자 정보가 '${trimmed}'(으)로 저장되었습니다.`);
    },
    [showToast]
  );

  const stats = useMemo(() => {
    const searchingLost = posts.filter(
      (p) => p.type === 'lost' && p.status === 'searching'
    ).length;
    const storedFound = posts.filter(
      (p) => p.type === 'found' && p.status === 'stored'
    ).length;
    const total = searchingLost + storedFound;
    return { total, searchingLost, storedFound };
  }, [posts]);

  const addPost = useCallback(
    async (input: CreatePostInput): Promise<PostItem> => {
      const postId = generateDocId('post');
      const initialStatus: PostStatus = input.type === 'lost' ? 'searching' : 'stored';
      const cleanTitle = input.title.trim().slice(0, 80);
      const cleanDescription = input.description.trim().slice(0, 1000);
      const cleanLocation = (input.location.trim() || '교내 (위치 미상)').slice(0, 120);
      const cleanDateTime = input.dateTime.trim().slice(0, 40);
      const cleanStorage =
        input.type === 'found' && input.storageLocation?.trim()
          ? input.storageLocation.trim().slice(0, 120)
          : undefined;
      const cleanContact = input.contact?.trim()
        ? input.contact.trim().slice(0, 120)
        : undefined;
      const cleanAuthor = (userProfile.studentName.trim() || '익명 학생').slice(0, 40);

      const payload: Record<string, unknown> = {
        type: input.type,
        status: initialStatus,
        category: input.category,
        title: cleanTitle,
        description: cleanDescription,
        location: cleanLocation,
        dateTime: cleanDateTime,
        authorName: cleanAuthor,
        authorDeviceId: deviceId,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (input.imageUrl && input.imageUrl.length <= 450000) {
        payload.imageUrl = input.imageUrl;
      }
      if (cleanStorage) {
        payload.storageLocation = cleanStorage;
      }
      if (cleanContact) {
        payload.contact = cleanContact;
      }

      try {
        await setDoc(doc(db, 'posts', postId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `posts/${postId}`);
      }

      showToast(
        input.type === 'lost'
          ? '분실물 게시글이 등록되었습니다.'
          : '습득물 게시글이 등록되었습니다.'
      );

      return {
        id: postId,
        type: input.type,
        status: initialStatus,
        category: input.category,
        title: cleanTitle,
        description: cleanDescription,
        imageUrl: input.imageUrl,
        location: cleanLocation,
        dateTime: cleanDateTime,
        storageLocation: cleanStorage,
        contact: cleanContact,
        authorName: cleanAuthor,
        authorDeviceId: deviceId,
        commentCount: 0,
        createdAt: Date.now(),
        comments: [],
      };
    },
    [deviceId, userProfile.studentName, showToast]
  );

  const setPostStatus = useCallback(
    async (postId: string, nextStatus: PostStatus) => {
      const target = posts.find((p) => p.id === postId);
      if (!target || target.status === nextStatus) return;

      const statusLabel =
        nextStatus === 'returned'
          ? target.type === 'lost'
            ? '찾기 완료'
            : '전달 완료'
          : target.type === 'lost'
          ? '분실중'
          : '보관중';

      try {
        await updateDoc(doc(db, 'posts', postId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
      }

      showToast(`상태가 "${statusLabel}"(으)로 변경되었습니다.`);
    },
    [posts, showToast]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'));
        const batch = writeBatch(db);
        for (const commentDoc of commentsSnap.docs) {
          batch.delete(commentDoc.ref);
        }
        batch.delete(doc(db, 'posts', postId));
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
      }
      showToast('게시글이 삭제되었습니다.');
    },
    [showToast]
  );

  const addComment = useCallback(
    async (postId: string, content: string, parentId: string | null = null) => {
      const trimmed = content.trim().slice(0, 500);
      if (!trimmed) return;

      const commentId = generateDocId('c');
      const cleanAuthor = (userProfile.studentName.trim() || '익명 학생').slice(0, 40);

      const batch = writeBatch(db);
      batch.set(doc(db, 'posts', postId, 'comments', commentId), {
        postId,
        parentId: parentId || '',
        author: cleanAuthor,
        authorDeviceId: deviceId,
        content: trimmed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'posts', postId), {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/comments/${commentId}`);
      }

      showToast(parentId ? '답글이 등록되었습니다.' : '댓글이 등록되었습니다.');
    },
    [deviceId, userProfile.studentName, showToast]
  );

  const updateComment = useCallback(
    async (postId: string, commentId: string, newContent: string) => {
      const trimmed = newContent.trim().slice(0, 500);
      if (!trimmed) return;

      try {
        await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
          content: trimmed,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}/comments/${commentId}`);
      }

      showToast('댓글이 수정되었습니다.');
    },
    [showToast]
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      try {
        const postRef = doc(db, 'posts', postId);
        const [commentsSnap, postSnap] = await Promise.all([
          getDocs(collection(db, 'posts', postId, 'comments')),
          getDoc(postRef),
        ]);

        const toDelete = commentsSnap.docs.filter(
          (d) => d.id === commentId || d.data().parentId === commentId
        );
        if (toDelete.length === 0) return;

        const batch = writeBatch(db);
        for (const commentDoc of toDelete) {
          batch.delete(commentDoc.ref);
        }

        if (postSnap.exists()) {
          const existingCount =
            typeof postSnap.data().commentCount === 'number'
              ? postSnap.data().commentCount
              : commentsSnap.size;
          const nextCount = Math.max(0, existingCount - toDelete.length);
          if (nextCount < existingCount) {
            batch.update(postRef, {
              commentCount: nextCount,
              updatedAt: serverTimestamp(),
            });
          }
        }

        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${postId}/comments/${commentId}`);
      }

      showToast('댓글이 삭제되었습니다.');
    },
    [showToast]
  );

  const addFeedback = useCallback(
    async (input: CreateFeedbackInput) => {
      const feedbackId = generateDocId('fb');
      const cleanTitle = input.title.trim().slice(0, 100);
      const cleanContent = input.content.trim().slice(0, 1000);
      const cleanAuthor = input.isAnonymous
        ? '익명'
        : (userProfile.studentName.trim() || '익명 학생').slice(0, 40);

      try {
        await setDoc(doc(db, 'feedbacks', feedbackId), {
          category: input.category,
          title: cleanTitle,
          content: cleanContent,
          authorName: cleanAuthor,
          isAnonymous: input.isAnonymous,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `feedbacks/${feedbackId}`);
      }

      showToast('개선사항 요청이 등록되었습니다. 소중한 의견 감사합니다!');
    },
    [userProfile.studentName, showToast]
  );

  const resetDemoData = useCallback(async () => {
    await seedMissingInitialPosts();
    setUserProfileState({ studentName: '21015 김하늘' });
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify({ studentName: '21015 김하늘' }));
    showToast('기본 예시 게시글 및 프로필이 복원되었습니다.');
  }, [seedMissingInitialPosts, showToast]);

  const value: LostFoundContextValue = {
    posts,
    notices,
    feedbacks,
    activePostComments,
    isLoadingPosts,
    isLoadingComments,
    deviceId,
    userProfile,
    setUserProfile,
    setActivePostId,
    stats,
    addPost,
    setPostStatus,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
    addFeedback,
    resetDemoData,
    toastMessage,
    showToast,
  };

  return <LostFoundContext.Provider value={value}>{children}</LostFoundContext.Provider>;
};

export function useLostFound(): LostFoundContextValue {
  const ctx = useContext(LostFoundContext);
  if (!ctx) {
    throw new Error('useLostFound must be used within LostFoundProvider');
  }
  return ctx;
}
