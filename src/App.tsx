import React, { useState } from 'react';
import { LostFoundProvider, useLostFound } from './context/LostFoundContext';
import { ListTab, ScreenView } from './types/lostFound';
import { TopAppBar } from './components/TopAppBar';
import { SideDrawer } from './components/SideDrawer';
import { ProfileModal } from './components/ProfileModal';
import { MainFeedScreen } from './components/MainFeedScreen';
import { ListNoticeScreen } from './components/ListNoticeScreen';
import { DetailScreen } from './components/DetailScreen';
import { CreatePostScreen } from './components/CreatePostScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CheckCircle2 } from 'lucide-react';

const AppShell: React.FC = () => {
  const { userProfile, setUserProfile, toastMessage } = useLostFound();

  const [screen, setScreen] = useState<ScreenView>('feed');
  const [returnScreen, setReturnScreen] = useState<'feed' | 'list'>('feed');
  const [listTab, setListTab] = useState<ListTab>('found');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [focusCommentOnDetail, setFocusCommentOnDetail] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navigateToFeed = () => {
    setScreen('feed');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToList = (tab: ListTab = 'found') => {
    setListTab(tab);
    setScreen('list');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToDetail = (postId: string, focusComment = false) => {
    if (screen === 'feed' || screen === 'list') {
      setReturnScreen(screen);
    }
    setSelectedPostId(postId);
    setFocusCommentOnDetail(focusComment);
    setScreen('detail');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToCreate = () => {
    if (screen === 'feed' || screen === 'list') {
      setReturnScreen(screen);
    }
    setScreen('create');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToFeedback = () => {
    if (screen === 'feed' || screen === 'list') {
      setReturnScreen(screen);
    }
    setScreen('feedback');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleBack = () => {
    setScreen(returnScreen);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const isSubPage = screen === 'create' || screen === 'detail' || screen === 'feedback';
  const topBarTitle =
    screen === 'create'
      ? '분실물 / 습득물 등록'
      : screen === 'detail'
      ? '게시글 상세'
      : screen === 'feedback'
      ? '개선사항 요청'
      : undefined;

  return (
    <div className="min-h-screen w-full bg-[#E5EAF2] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8F9FA] shadow-2xl relative flex flex-col">
        <TopAppBar
          title={topBarTitle}
          showBack={isSubPage}
          onBack={handleBack}
          onLogoClick={navigateToFeed}
          onMenuClick={() => setIsDrawerOpen(true)}
          hideMenu={screen === 'create'}
        />

        <main className="flex-1">
          {screen === 'feed' && (
            <MainFeedScreen
              onSelectPost={navigateToDetail}
              onGoToCreate={navigateToCreate}
              onGoToList={() => navigateToList('found')}
            />
          )}

          {screen === 'list' && (
            <ListNoticeScreen
              activeTab={listTab}
              onTabChange={setListTab}
              onSelectPost={(postId) => navigateToDetail(postId, false)}
            />
          )}

          {screen === 'detail' && selectedPostId && (
            <DetailScreen
              postId={selectedPostId}
              autoFocusComment={focusCommentOnDetail}
              onPostDeleted={handleBack}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {screen === 'create' && (
            <CreatePostScreen
              onSuccess={() => {
                setScreen('feed');
                window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
              }}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {screen === 'feedback' && <FeedbackScreen />}
        </main>

        {/* Side Drawer Menu */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentScreen={screen}
          studentName={userProfile.studentName}
          onNavigateFeed={navigateToFeed}
          onNavigateList={navigateToList}
          onNavigateCreate={navigateToCreate}
          onNavigateFeedback={navigateToFeedback}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Profile Edit Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          currentName={userProfile.studentName}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(newName) => setUserProfile({ studentName: newName })}
        />

        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px] pointer-events-none"
          >
            <div className="rounded-xl bg-[#1F2F61] text-white px-4 py-3 shadow-xl border border-white/15 flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#FCD757] shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LostFoundProvider>
        <AppShell />
      </LostFoundProvider>
    </ErrorBoundary>
  );
}
