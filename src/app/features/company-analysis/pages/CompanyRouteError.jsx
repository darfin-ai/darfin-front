import { Link, useRouteError } from 'react-router';

/**
 * 기업 분석 라우트 전용 에러 바운더리 — 렌더링 중 예외가 나도 라우터의
 * 기본 흰 화면(스택 트레이스) 대신 복구 경로가 있는 안내를 보여준다.
 */
export function CompanyRouteError() {
  const error = useRouteError();

  return (
    <div className="container py-16 text-center">
      <p className="text-base font-semibold text-slate-900">화면을 표시하는 중 문제가 발생했어요.</p>
      <p className="mt-2 text-sm text-slate-500">
        잠시 후 새로고침하거나 기업 목록으로 돌아가 다시 시도해주세요.
      </p>
      {import.meta.env.DEV && error != null && (
        <pre className="mx-auto mt-4 max-w-2xl overflow-x-auto rounded-md bg-slate-100 p-3 text-left text-xs text-slate-600">
          {error.stack || error.message || String(error)}
        </pre>
      )}
      <Link
        to="/company"
        className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
      >
        기업 목록으로 돌아가기
      </Link>
    </div>
  );
}
