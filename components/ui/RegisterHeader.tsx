import Image from "next/image";

interface RegisterHeaderProps {
  title: string;
  description: string;
}

export function RegisterHeader({ title, description }: RegisterHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 mt-12">
      <Image
        src="/icon/Nala-Logo.svg"
        alt="Nala Logo"
        width={80}
        height={65}
        className="w-20 h-auto"
      />
      <div className="text-center">
        <h1 className="text-heading-6-semibold text-text-heading mb-2">
          {title}
        </h1>
        <p className="text-body-base-medium text-text-subheading">
          {description}
        </p>
      </div>
    </div>
  );
}
