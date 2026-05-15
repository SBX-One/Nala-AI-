import Image from "next/image";
import Link from "next/link";

interface ConsultationSessionCardProps {
	session?: any;
}

export default function ConsultationSessionCard({ session }: ConsultationSessionCardProps) {
	if (!session) {
		return (
			<div className="bg-surface-background border border-border-default rounded-2xl my-auto h-full p-8 text-text-action flex flex-col items-center justify-center text-center gap-2 ">
				<h2 className="text-heading-6-bold ">There is no consultation for today</h2>
				<p className="text-body-sm-regular ">Enjoy your time and stay strong!</p>
			</div>
		);
	}

	return (
		<div className="bg-primary-600 rounded-2xl p-6 text-white flex flex-col justify-between min-h-[300px] relative overflow-hidden shadow-xl">
			<div className="flex justify-between items-start">
				<div className="rounded-3xl flex gap-2 bg-surface-primary-light px-3 py-2 text-text-action">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M11 17.825Q9.95 18.5 8.838 19t-2.338.5q-1.325 0-2.512-.513T1.75 17.65q-.325-.25-.325-.65t.325-.65q.775-.625 1.663-1.075t1.862-.65q-1.5-1.2-2.275-2.9t-.975-3.6q-.05-.45.275-.775t.8-.275q1.5.15 2.875.687T8.5 9.2V9q0-1.975.788-3.75t1.987-3.35q.275-.35.725-.35t.725.35q1.2 1.575 1.988 3.35T15.5 9q0 .05-.012.1t-.013.1q1.175-.9 2.55-1.425t2.875-.7q.45-.05.788.262t.287.788q-.175 1.9-.975 3.6t-2.3 2.9q.975.2 1.85.65t1.675 1.075q.325.25.325.65t-.325.65q-1.05.825-2.225 1.338t-2.5.512q-1.25 0-2.363-.5T13 17.825V21q0 .425-.288.713T12 22t-.712-.288T11 21zM9.6 14.6q-.275-.95-.712-1.812T7.75 11.25q-.7-.7-1.562-1.137T4.375 9.4q.275.95.713 1.813t1.137 1.562q.675.7 1.55 1.138T9.6 14.6m-3.1 2.9q.525 0 1.025-.137T8.5 17q-.475-.2-.975-.35T6.5 16.5t-1.025.15t-1 .35q.475.225.988.363T6.5 17.5m5.5-3.8q.65-1.1 1.075-2.262T13.5 9t-.425-2.437T12 4.325q-.65 1.075-1.075 2.237T10.5 9t.425 2.45T12 13.7m2.4.9q.95-.25 1.813-.687t1.537-1.138q.7-.7 1.138-1.562T19.6 9.4q-.95.275-1.812.713t-1.563 1.137q-.7.675-1.137 1.538T14.4 14.6m3.1 2.9q.525 0 1.025-.137T19.5 17q-.475-.2-.975-.35T17.5 16.5t-1.025.15t-1 .35q.475.225.988.363t1.037.137m-2.025-.5"
						/>
					</svg>
					<span className="text-label-small-medium">
						Consultation Sessions
					</span>
				</div>
				<div className="text-right">
					<h2 className="text-body-xl-bold">
						{session.time || "14:00"}
					</h2>
					<p className="text-body-sm-regular text-text-subheading-white">
						Today
					</p>
				</div>
			</div>

			<div className="">
				<h1 className="text-heading-6-bold mb-2 text-text-on-action">
					{session.doctorName || "Dr. Sarah Jenning"}
				</h1>
				<p className="text-body-sm-regular text-text-subheading-white">
					{session.specialization ||
						"Clinical Psychologist • Cognitive Behavioral Therapy"}
				</p>
			</div>

			<div className="mt-auto pt-4 border-t border-border-default flex items-center gap-6">
				{session.roomId ? (
					<Link
						href={`/user/waiting-room?roomId=${session.roomId}`}
						className="button-secondary-medium"
					>
						Enter Waiting Room
					</Link>
				) : (
					<button disabled className="button-secondary-medium">
						Waiting Room Opening Soon
					</button>
				)}
				<p className="text-label-caption-medium text-text-subheading-white">
					Waiting room opens 10 mins prior
				</p>
			</div>

			{/* Subtle Background Pattern */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
		</div>
	);
}
