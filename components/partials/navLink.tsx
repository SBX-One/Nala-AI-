"use client";

import { useState } from "react";
import Link from "next/link";

export type SubItem = { href: string; label: string };

export type NavItemType = {
	href?: string;
	label: string;
	icon: React.ReactNode;
	children?: SubItem[];
};

export default function NavLink({
	item,
	currentPath,
}: {
	item: NavItemType;
	currentPath: string;
}) {
	const hasChildren = !!item.children;
	const isChildrenActive =
		hasChildren &&
		item.children!.some((c) => currentPath.startsWith(c.href));
	const isActive = item.href ? currentPath === item.href : isChildrenActive;

	// Untuk demo, kita pastikan "Sessions" terbuka (sesuai gambar)
	const [isOpen, setIsOpen] = useState(
		item.label === "Sessions" || isChildrenActive,
	);

	// Jika ini sebuah link tanpa anak, gunakan tag <Link>
	const Wrapper = hasChildren ? "button" : Link;
	const wrapperProps = hasChildren
		? { onClick: () => setIsOpen(!isOpen) }
		: { href: item.href! };

	return (
		<div className="flex flex-col mb-1">
			<Wrapper
				{...(wrapperProps as any)}
				suppressHydrationWarning
				className={`group flex items-center justify-between w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
					isActive
						? "bg-surface-primary"
						: "hover:bg-surface-primary-light" 
				}`}
			>
				<div className="flex items-center gap-3 h-fit">
					<div className={`transition-colors duration-200 ${isActive ? "text-white" : "text-links-default group-hover:text-text-action"}`}>
						{item.icon}
					</div>
					<span className={`text-body-base-medium transition-colors duration-200 ${isActive ? "text-white" : "text-text-body text-body-base-medium group-hover:text-text-action"}`}>
						{item.label}
					</span>
				</div>
				{hasChildren && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						className={`transition-all duration-200 ${isOpen ? "" : "-rotate-90"} ${isActive ? "text-white" : "text-text-body text-body-base-semibold group-hover:text-text-action"}`}
					>
						<path
							fill="currentColor"
							fillRule="evenodd"
							d="m8 10.207l3.854-3.853l-.707-.708L8 8.793L4.854 5.646l-.708.708z"
							clipRule="evenodd"
						/>
					</svg>
				)}
			</Wrapper>

			{hasChildren && (
				<div
					className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
				>
					<div className="overflow-hidden flex flex-col gap-1">
						{/* Garis vertikal menggunakan border-l */}
						<div className="ml-4 pl-6 py-3 border-l border-border-default flex flex-col gap-1">
							{item.children!.map((child) => {
								const isChildActive =
									currentPath === child.href 
								return (
									<Link
										key={child.href}
										href={child.href}
										className={`block py-2 px-3 rounded-lg text-body-base-medium transition-colors duration-200 ${
											isChildActive
												? "bg-surface-primary-light text-text-action"
												: "text-body-base-medium bg-surface-background text-text-body hover:bg-surface-default hover:text-text-heading"
										}`}
									>
										{child.label}
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
