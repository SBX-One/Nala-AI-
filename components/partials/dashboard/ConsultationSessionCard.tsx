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
				<div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
					<div className="size-2 bg-white rounded-full animate-pulse" />
					<span className="text-label-caption-semibold uppercase tracking-wider">Consultation Sessions</span>
				</div>
				<div className="text-right">
					<h2 className="text-display-sm-bold">{session.time || "14:00"}</h2>
					<p className="text-body-sm-medium opacity-80">Today</p>
				</div>
			</div>

			<div className="mt-8">
				<h1 className="text-display-sm-bold md:text-display-md-bold mb-2">{session.doctorName || "Dr. Sarah Jenning"}</h1>
				<p className="text-body-lg-medium opacity-90">{session.specialization || "Clinical Psychologist • Cognitive Behavioral Therapy"}</p>
			</div>

			<div className="mt-auto pt-8 border-t border-white/20 flex items-center gap-6">
				{session.roomId ? (
					<Link 
						href={`/user/active-Consultation?roomId=${session.roomId}`}
						className="bg-white text-primary-600 px-6 py-3 rounded-xl text-body-base-bold hover:bg-opacity-90 transition-all shadow-lg inline-block"
					>
						Enter Consultation Room
					</Link>
				) : (
					<button disabled className="bg-white/50 text-primary-600/50 px-6 py-3 rounded-xl text-body-base-bold cursor-not-allowed shadow-lg">
						Room Not Ready
					</button>
				)}
				<p className="text-body-sm-medium opacity-80 italic">Waiting room opens 10 mins prior</p>
			</div>
			
			{/* Subtle Background Pattern */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
		</div>
	);
}
