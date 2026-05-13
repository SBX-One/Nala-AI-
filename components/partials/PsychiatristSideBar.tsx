"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NalaLogo from "@/public/icon/Nala-Logo.svg";
import { signOut } from "@/app/auth/actions";

import NavLink, { NavItemType } from "./navLink";

const navItems: NavItemType[] = [
	{
		href: "/psychiatrist",
		label: "Dashboard",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6 "
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M14 9q-.425 0-.712-.288T13 8V4q0-.425.288-.712T14 3h6q.425 0 .713.288T21 4v4q0 .425-.288.713T20 9zM4 13q-.425 0-.712-.288T3 12V4q0-.425.288-.712T4 3h6q.425 0 .713.288T11 4v8q0 .425-.288.713T10 13zm10 8q-.425 0-.712-.288T13 20v-8q0-.425.288-.712T14 11h6q.425 0 .713.288T21 12v8q0 .425-.288.713T20 21zM4 21q-.425 0-.712-.288T3 20v-4q0-.425.288-.712T4 15h6q.425 0 .713.288T11 16v4q0 .425-.288.713T10 21z"
				/>
			</svg>
		),
	},

	{
		href: "/psychiatrist/consultation",
		label: "Consultation",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				className="size-6 "
			>
				<g fill="none">
					<path
						fill="currentColor"
						d="M4 7v2h16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2"
					/>
					<path
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M16 5h2a2 2 0 0 1 2 2v2H4V7a2 2 0 0 1 2-2h2m8 0V3m0 2H8m0-2v2M4 9.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.5"
					/>
				</g>
			</svg>
		),
		children: [
			{ href: "/psychiatrist/history", label: "History" },
			{ href: "/psychiatrist/queue", label: "Queue" },
		],
	},
	{
		href: "/psychiatrist/availability",
		label: "Availability",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M11 13v3q0 .425.288.713T12 17t.713-.288T13 16v-3h3q.425 0 .713-.288T17 12t-.288-.712T16 11h-3V8q0-.425-.288-.712T12 7t-.712.288T11 8v3H8q-.425 0-.712.288T7 12t.288.713T8 13zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
				/>
			</svg>
		),
	},
	{
		href: "/psychiatrist/article",
		label: "Article",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M11 17.825Q9.95 18.5 8.838 19t-2.338.5q-1.325 0-2.512-.513T1.75 17.65q-.325-.25-.325-.65t.325-.65q.775-.625 1.663-1.075t1.862-.65q-1.5-1.2-2.275-2.9t-.975-3.6q-.05-.45.275-.775t.8-.275q1.5.15 2.875.687T8.5 9.2V9q0-1.975.788-3.75t1.987-3.35q.275-.35.725-.35t.725.35q1.2 1.575 1.988 3.35T15.5 9q0 .05-.012.1t-.013.1q1.175-.9 2.55-1.425t2.875-.7q.45-.05.788.262t.287.788q-.175 1.9-.975 3.6t-2.3 2.9q.975.2 1.85.65t1.675 1.075q.325.25.325.65t-.325.65q-1.05.825-2.225 1.338t-2.5.512q-1.25 0-2.363-.5T13 17.825V21q0 .425-.288.713T12 22t-.712-.288T11 21zM9.6 14.6q-.275-.95-.712-1.812T7.75 11.25q-.7-.7-1.562-1.137T4.375 9.4q.275.95.713 1.813t1.137 1.562q.675.7 1.55 1.138T9.6 14.6m-3.1 2.9q.525 0 1.025-.137T8.5 17q-.475-.2-.975-.35T6.5 16.5t-1.025.15t-1 .35q.475.225.988.363T6.5 17.5m5.5-3.8q.65-1.1 1.075-2.262T13.5 9t-.425-2.437T12 4.325q-.65 1.075-1.075 2.237T10.5 9t.425 2.45T12 13.7m2.4.9q.95-.25 1.813-.687t1.537-1.138q.7-.7 1.138-1.562T19.6 9.4q-.95.275-1.812.713t-1.563 1.137q-.7.675-1.137 1.538T14.4 14.6m3.1 2.9q.525 0 1.025-.137T19.5 17q-.475-.2-.975-.35T17.5 16.5t-1.025.15t-1 .35q.475.225.988.363t1.037.137m-2.025-.5"
				/>
			</svg>
		),
	},
];



export default function PsychiatristSideBar() {
	const path = usePathname() || "";
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	return (
		<div className="flex flex-col w-fit h-screen bg-surface-background border-r border-border-default px-4 py-8 justify-between">
			<div>
				{/* Logo Section */}
				<div className="flex items-center gap-4 mb-10">
					<Image
						src={NalaLogo}
						alt="Nala-Logo"
						priority
						className="w-15"
					/>
					<div className="flex flex-col gap-1">
						<h1 className="text-body-xl-semibold text-text-action">
							Nala
						</h1>
						<p className="text-label-small-medium text-text-subheading leading-none">
							Psychiatrist Portal
						</p>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex flex-col gap-2">
					{navItems.map((item) => (
						<NavLink
							key={item.label}
							item={item}
							currentPath={path}
						/>
					))}
				</nav>
			</div>

			{/* Bottom Section */}
			<div className="flex flex-col  gap-4">
				{/* Profile Card */}
				<div className="flex items-center justify-between pt-6 gap-2.5 border-t border-border-default">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="w-10 h-10 rounded-full bg-surface-disabled ">
							{/* image */}
						</div>
						<div className="flex flex-col overflow-hidden">
							<span className="text-label-base-semibold text-text-heading">
								Nanda Mahardika
							</span>
							<span className="text-label-caption-medium text-text-subheading">
								Istrirendy@gmail.com
							</span>
						</div>
					</div>
					<div className="relative">
						<button
							type="button"
							className="text-icon-default hover:text-icon-action transition-colors cursor-pointer relative z-10"
							onClick={(e) => {
								e.stopPropagation();
								setIsMenuOpen((prev) => !prev);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-6"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.487 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"
								/>
							</svg>
						</button>

						{/* Logout Popup */}
						{isMenuOpen && (
							<div className="absolute bottom-[120%] right-0 w-max bg-surface-background border border-border-default rounded-xl shadow-sm p-2 z-50">
								<button 
									className="button-error-outline-medium w-full justify-center"
									onClick={() => {
										setIsMenuOpen(false);
										setIsLogoutModalOpen(true);
									}}
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Custom Logout Confirmation Modal */}
			{isLogoutModalOpen && (
				<div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
					<div className="bg-surface-background p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-4 border border-border-default">
						<div className="flex flex-col gap-2">
							<h3 className="text-heading-6-semibold text-text-heading">
								Logout Account
							</h3>
							<p className="text-body-base-regular text-text-subheading">
								Are you sure you want to log out from your account? You will need to sign in again to access the dashboard.
							</p>
						</div>
						<div className="flex gap-3 justify-end mt-2">
							<button
								className="button-outline-medium flex-1 justify-center"
								onClick={() => setIsLogoutModalOpen(false)}
							>
								Cancel
							</button>
							<button
								className="button-error-medium flex-1 justify-center"
								onClick={async () => {
									await signOut();
								}}
							>
								Yes, Logout
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
