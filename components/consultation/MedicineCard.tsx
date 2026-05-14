"use client";

import Image from "next/image";

interface MedicineCardProps {
  name: string;
  dose: string;
  use: string;
  notes?: string;
}

export default function MedicineCard({
  name,
  dose,
  use,
  notes,
}: MedicineCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-border-default space-y-4 ">
      <div className="flex gap-4 items-start">
        <div className="size-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <Image
            src={"/icon/medicine.svg"}
            width={32}
            height={32}
            alt="Medicine"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-body-xl-semibold text-text-body truncate mb-1">
            {name} {dose}
          </h4>
          <p className="text-body-sm-medium text-text-subheading">{use}</p>
        </div>
      </div>

      <div className="pt-4 space-y-1">
        <p className="text-label-caption-bold text-text-subheading">
          Psychiatry&apos;s Note
        </p>
        <p className="text-body-sm-medium text-text-body">
          {notes || "Initial consultation notes..."}
        </p>
      </div>
    </div>
  );
}
