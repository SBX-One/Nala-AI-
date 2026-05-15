interface NextAppointmentCardProps {
	appointments?: any[];
}

export default function NextAppointmentCard({
	appointments = [],
}: NextAppointmentCardProps) {
	if (appointments.length === 0) {
		return (
			<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-full shadow-sm flex flex-col gap-6">
				<h3 className="text-body-xl-semibold text-text-body">
					Next Appoinment
				</h3>
				<div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-border-default rounded-3xl bg-surface-default gap-4">
					<div className="flex flex-col gap-2">
						<h4 className="text-body-lg-bold text-text-heading">
							Your schedule is a quiet space for now.
						</h4>
						<p className="text-body-sm-medium text-text-subheading">
							There are no upcoming sessions. Remember, a
							professional is always here to listen whenever you
							feel like talking.
						</p>
					</div>
					<button className="button-primary-medium w-full">
						Book Specialist
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-full  flex flex-col gap-6">
			<h3 className="text-body-xl-semibold text-text-body">
				Next Appoinment
			</h3>

			<div className="flex flex-col gap-4">
				{appointments.map((item) => (
					<div
						key={item.id}
						className="p-4 border border-border-default rounded-2xl flex items-center gap-4 hover:bg-surface-default transition-colors cursor-pointer group"
					>
						<div className="bg-surface-primary px-4 py-3 rounded-2xl text-white text-center group-hover:scale-105 transition-transform">
							<p className="text-label-large-semibold">
								{item.date.split(" ")[0]}
							</p>
							<p className="text-label-large-semibold">
								{item.date.split(" ")[1]}
							</p>
						</div>
						<div className="grid gap-1">
							<p className="text-body-xl-semibold text-text-body">
								{item.name}
							</p>
							<div className="flex items-center gap-1 ">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="size-4"
									viewBox="0 0 24 24"
								>
									<path d="M0 0h24v24H0z" fill="none" />
									<g
										fill="none"
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
									>
										<circle cx="12" cy="12" r="10" />
										<path d="M12 6v6l4 2" />
									</g>
								</svg>

								<p className="text-body-caption-medium text-text-subheading">
									{item.time}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
