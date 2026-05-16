"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

export default function InformationBar() {
  const path = usePathname();
  const { toggle } = useSidebar();

  const formatPath = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";

    // Base paths
    if (segments.length === 1 && (segments[0] === "user" || segments[0] === "psychiatrist")) {
      return "Dashboard";
    }

    const isUser = segments[0] === "user";
    const isPsych = segments[0] === "psychiatrist";

    if (isUser) {
      // Mapping for user paths
      if (segments[1] === "article") return "Article";
      if (segments[1] === "chat") return "Chat";
      if (segments[1] === "habit-tracker") return "Habit Tracker";
      if (segments[1] === "profile") return "Profile";
      
      if (segments[1] === "session") {
        if (segments[2] === "booking") return "Booking";
        if (segments[2] === "history") return "History";
        return "Sessions";
      }
    }

    if (isPsych) {
      if (segments[1] === "consultation") {
        if (segments[2] === "queue") return "Queue";
        if (segments[2] === "history") return "History";
        return "Consultation";
      }
      if (segments[1] === "schedule") return "Schedule";
      if (segments[1] === "article") return "Article";
      if (segments[1] === "profile") return "Profile";
    }

    const lastSegment = segments[segments.length - 1] || "";
    return (
      lastSegment.charAt(0).toUpperCase() +
      lastSegment.slice(1).replace(/-/g, " ")
    );
  };

  const formattedTitle = formatPath(path);

  return (
    <div className="flex px-4 py-3 border-b w-full border-b-border-default items-center justify-between bg-surface-background">
      <div className="flex gap-4 items-center justify-center">
        <button
          onClick={toggle}
          className="p-2 -ml-2 xl:hidden text-icon-default hover:bg-surface-default rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
            />
          </svg>
        </button>
        <p className="text-body-xl-bold text-text-heading whitespace-nowrap">
          {formattedTitle}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full justify-end">
        <div className="relative w-1/3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-placeholder"
          >
            <path
              fill="currentColor"
              d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
          <input
            suppressHydrationWarning
            type="text"
            placeholder="search"
            className="w-full border border-border-default rounded-lg text-label-base-medium text-text-placeholder pl-11 pr-4 py-3"
          />
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-6 text-icon-default"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12.838 17.638q.362-.363.362-.888t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362t.888-.363M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m.1-12.3q.625 0 1.088.4t.462 1q0 .55-.337.975t-.763.8q-.575.5-1.012 1.1t-.438 1.35q0 .35.263.588t.612.237q.375 0 .638-.25t.337-.625q.1-.525.45-.937t.75-.788q.575-.55.988-1.2t.412-1.45q0-1.275-1.037-2.087T12.1 6q-.95 0-1.812.4T8.975 7.625q-.175.3-.112.638t.337.512q.35.2.725.125t.625-.425q.275-.375.688-.575t.862-.2"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-6 text-icon-default"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M5 19q-.425 0-.712-.288T4 18t.288-.712T5 17h1v-7q0-2.075 1.25-3.687T10.5 4.2v-.7q0-.625.438-1.062T12 2t1.063.438T13.5 3.5v.7q2 .5 3.25 2.113T18 10v7h1q.425 0 .713.288T20 18t-.288.713T19 19zm7 3q-.825 0-1.412-.587T10 20h4q0 .825-.587 1.413T12 22m-4-5h8v-7q0-1.65-1.175-2.825T12 6T9.175 7.175T8 10z"
          />
        </svg>
      </div>
    </div>
  );
}
