import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      let friendlyMessage = '데이터를 불러오는 중 일시적인 문제가 발생했습니다.';
      if (this.state.errorMessage.includes('Quota exceeded')) {
        friendlyMessage =
          '오늘 무료 데이터베이스 사용 한도를 초과했습니다. 내일 자정 이후 자동으로 초기화됩니다.';
      } else if (this.state.errorMessage.includes('Missing or insufficient permissions')) {
        friendlyMessage = '데이터 접근 권한 확인 중 오류가 발생했습니다. 다시 시도해 주세요.';
      }

      return (
        <div className="min-h-screen w-full bg-[#E5EAF2] flex justify-center">
          <div className="w-full max-w-[430px] min-h-screen bg-[#F8F9FA] shadow-2xl flex items-center justify-center p-6">
            <div className="w-full rounded-2xl border border-rose-200 bg-white p-6 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-extrabold text-slate-900">
                  잠시 문제가 발생했어요
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">{friendlyMessage}</p>
              </div>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full h-11 rounded-xl bg-[#2B4080] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1F2F61] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                새로고침하기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
