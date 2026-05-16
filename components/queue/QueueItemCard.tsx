"use client";

import Image from "next/image";

interface QueueItemCardProps {
  name: string;
  status: string;
  avatar: string;
  tags: string[];
  isActive: boolean;
  timeLeft?: string;
  onMoreInfo?: () => void;
  onEnterRoom?: () => void;
}

export default function QueueItemCard({
  name,
  status,
  avatar,
  tags,
  isActive,
  timeLeft,
  onMoreInfo,
  onEnterRoom,
}: QueueItemCardProps) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        isActive ? "border-[#FF8A00] bg-orange-50/10" : "border-border-default"
      } transition-all`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative size-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image src={avatar} alt={name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex flex-col-reverse lg:flex-row lg:items-center gap-4 lg:gap-6">
              <h4 className="text-body-lg-semibold text-text-heading truncate max-w-[30ch]">
                {name}
              </h4>
              {timeLeft && (
                <span className="px-3 py-1 rounded-full bg-orange-100 text-text-warning text-xs border border-text-warning">
                  {timeLeft}
                </span>
              )}
            </div>
            <p className="text-body-sm-medium text-text-placeholder">
              {status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMoreInfo} className="button-secondary-medium">
            More Info {!isActive && "→"}
          </button>
          {isActive && (
            <button onClick={onEnterRoom} className="button-primary-medium">
              Enter Room
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
