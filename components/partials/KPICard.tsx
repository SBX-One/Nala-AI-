import React from "react";

interface KPICardProps {
	title: string;
	value: string;
	unit?: string;
	icon?: React.ReactNode;
}

export default function KPICard({ title, value, unit, icon }: KPICardProps) {
	return (
		<div className="w-full bg-surface-background border border-border-default grid gap-6 rounded-2xl p-6 ">
			<div className="p-3 bg-surface-primary-light border border-border-action text-icon-action rounded-lg flex items-start justify-center w-fit ">
				{/* Put your icon SVG or Component here */}
				{icon ? (
					icon
				) : (
					<div className="size-6 bg-current/20 rounded-sm" />
				)}
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-body-base-medium text-text-heading">
					{title}
				</p>
				<div className="flex items-baseline gap-1">
					<p className="text-heading-5-medium text-text-heading ">
						{value}
					</p>
					{unit && (
						<p className="text-label-caption-medium text-text-subheading">
							{unit}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
