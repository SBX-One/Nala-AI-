"use client";

import { useState, useEffect, Suspense } from "react";
import { getUserConsultations } from "@/app/actions/appointment";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function HistoryLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedPsychiatristId = searchParams.get("psyId");

  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await getUserConsultations();
      setConsultations(data);
      
      // If no psychiatrist is selected and we are on the main history page, select the first one
      if (!selectedPsychiatristId && data.length > 0 && pathname === "/user/session/history") {
        router.push(`/user/session/history?psyId=${data[0].psychiatrist_id}`);
      }
      
      setLoading(false);
    };
    fetchConsultations();
  }, [selectedPsychiatristId, pathname]);

  // Get unique psychiatrists from consultations
  const uniquePsychiatrists = Array.from(
    new Map(consultations.map((c) => [c.psychiatrist_id, c.psychiatrist])).values()
  );

  const handlePsychiatristClick = (psyId: number) => {
    router.push(`/user/session/history?psyId=${psyId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sub-sidebar: Psychiatrist List */}
      <div className="w-80 border-r border-border-default bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-border-default">
          <h2 className="text-body-lg-bold text-text-heading">Specialists</h2>
          <p className="text-body-caption-medium text-text-subheading">Your booked doctors</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {uniquePsychiatrists.length === 0 ? (
            <p className="text-body-sm-medium text-text-placeholder text-center py-10">No specialists found</p>
          ) : (
            uniquePsychiatrists.map((psy: any) => {
              const isActive = selectedPsychiatristId === psy.id.toString();
              return (
                <button
                  key={psy.id}
                  onClick={() => handlePsychiatristClick(psy.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    isActive ? "bg-primary-50 border border-primary-100 shadow-sm" : "hover:bg-neutral-50 border border-transparent"
                  }`}
                >
                  <div className="size-10 rounded-lg bg-surface-disabled shrink-0 overflow-hidden">
                    {psy.user?.user_profile?.avatar_url ? (
                      <img src={psy.user.user_profile.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                        {psy.user?.user_profile?.name?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-body-sm-bold truncate ${isActive ? "text-primary-700" : "text-text-heading"}`}>
                      {psy.user?.user_profile?.name || "Specialist"}
                    </p>
                    <p className="text-label-caption-medium text-text-subheading truncate">
                      {psy.specialization}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface-background overflow-y-auto">
        {children}
      </div>
    </div>
  );
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

