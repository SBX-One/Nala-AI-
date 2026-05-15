export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <HistoryLayoutContent>{children}</HistoryLayoutContent>
    </Suspense>
  );
}

