"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import NalaLogo from "@/public/Nala-Logo.svg";

import NavLink, { NavItemType } from "./navLink";

const navItems: NavItemType[] = [
	{
		href: "/dashboard",
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
		label: "Sessions",
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
			{ href: "/sessions/history", label: "History" },
			{ href: "/sessions/book", label: "Book A Specialist" },
		],
	},
	{
		label: "Habit Tracker",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M5 19V5v4.475V9zm3-6h3.525q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288H8q-.425 0-.712.288T7 12t.288.713T8 13m0 4h3.525q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288H8q-.425 0-.712.288T7 16t.288.713T8 17m0-8h8q.425 0 .713-.288T17 8t-.288-.712T16 7H8q-.425 0-.712.288T7 8t.288.713T8 9M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v4.45q0 .425-.288.713T20 10.45t-.712-.287T19 9.45V5H5v14h4q.425 0 .713.288T10 20t-.288.713T9 21zm10.225-5.725Q14.5 14.55 14.5 13.5t.725-1.775T17 11t1.775.725t.725 1.775t-.725 1.775T17 16t-1.775-.725M17 17q.975 0 1.938.188t1.862.562q.575.225.888.738T22 19.6v.4q0 .425-.288.713T21 21h-8q-.425 0-.712-.288T12 20v-.4q0-.6.313-1.112t.887-.738q.9-.375 1.863-.562T17 17"
				/>
			</svg>
		),
		children: [{ href: "/habits", label: "Habit Log" }],
	},
	{
		href: "/article",
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
					d="M12 22.5q-1.25 0-2.125-.875T9 19.5q0-.975.563-1.75T11 16.675V14.85q-.275-.1-.525-.237t-.45-.338L8.45 15.2q.025.125.038.263t.012.287q0 1.25-.875 2.125T5.5 18.75t-2.125-.875T2.5 15.75t.875-2.125T5.5 12.75q.575 0 1.075.188t.9.537l1.55-.9Q9 12.45 8.987 12.3t-.012-.3t.013-.288t.037-.262l-1.55-.925q-.4.35-.9.538T5.5 11.25q-1.25 0-2.125-.875T2.5 8.25t.875-2.125T5.5 5.25t2.125.875T8.5 8.25q0 .15-.012.3t-.038.275l1.575.9q.2-.2.45-.325T11 9.175V7.35q-.875-.3-1.437-1.087T9 4.5q0-1.25.875-2.125T12 1.5t2.125.875T15 4.5q0 .975-.562 1.763T13 7.35v1.825q.275.1.513.238t.437.337l1.6-.95q-.025-.125-.038-.262T15.5 8.25q0-1.25.875-2.125T18.5 5.25t2.125.875t.875 2.125t-.875 2.125t-2.125.875q-.575 0-1.062-.187t-.888-.538l-1.625.95q.025.125.038.263t.012.262t-.012.275t-.038.275l1.625.925q.4-.35.888-.537t1.062-.188q1.25 0 2.125.875t.875 2.125t-.875 2.125t-2.125.875t-2.125-.875t-.875-2.125q0-.15.013-.288t.037-.262l-1.6-.925q-.2.2-.437.325t-.513.225v1.85q.875.3 1.438 1.075T15 19.5q0 1.25-.875 2.125T12 22.5m0-2q.425 0 .713-.288T13 19.5t-.288-.712T12 18.5t-.712.288T11 19.5t.288.713t.712.287m-6.5-3.75q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288t-.712.288t-.288.712t.288.713t.712.287m13 0q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288t-.712.288t-.288.712t.288.713t.712.287M12 13q.425 0 .713-.288T13 12t-.288-.712T12 11t-.712.288T11 12t.288.713T12 13M5.5 9.25q.425 0 .713-.288T6.5 8.25t-.288-.712T5.5 7.25t-.712.288t-.288.712t.288.713t.712.287m13 0q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288t-.712.288t-.288.712t.288.713t.712.287M12 5.5q.425 0 .713-.288T13 4.5t-.288-.712T12 3.5t-.712.288T11 4.5t.288.713T12 5.5"
				/>
			</svg>
		),
	},
];



export default function SideBar() {
	const path = usePathname() || "";

	return (
		<div className="flex flex-col  h-screen bg-surface-background border-r border-border-default px-4 py-8 justify-between">
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
							Your mind partner
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
			<div className="flex flex-col mt-8 gap-4">
				<div className="flex flex-col gap-3">
					<button className="button-primary-large w-full justify-center">
						Chat With Our AI
					</button>
					<button className="button-secondary-large w-full justify-center">
						Book Consultation
					</button>
				</div>

				{/* Profile Card */}
				<div className="flex items-center justify-between pt-6 gap-2.5 border-t border-border-default">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="w-10 h-10 rounded-full bg-surface-disabled ">
							{/* image */}
						</div>
						<div className="flex flex-col overflow-hidden">
							<span className="text-label-base-semibold text-text-heading">
								Andra Divano
							</span>
							<span className="text-label-caption-medium text-text-subheading">
								andradiva@gmail.com
							</span>
						</div>
					</div>
					<button className="text-icon-default">
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
				</div>
			</div>
		</div>
	);
}
