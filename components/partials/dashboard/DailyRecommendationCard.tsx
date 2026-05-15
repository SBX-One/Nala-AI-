import starImage from "@/public/icon/star-outline.svg"
import Image from "next/image";
export default function DailyRecommendationCard() {
	return (
		<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-fit ">
			<div className="flex items-center gap-2 mb-2">
				<div className="">
				
				<Image src={starImage} alt="star-outline" className="size-8" />
				</div>
				<h3 className="text-body-xl-semibold text-text-body">
					Daily Recommendation
				</h3>
			</div>
			<p className="text-label-caption-semibold text-text-placeholder mb-6 ">
				Based by your mood, Nala AI suggest you to do these
			</p>

			<div className="bg-surface-default border border-border-default rounded-2xl p-8 flex flex-col items-center text-center gap-4">
				<h4 className="text-body-lg-semibold text-text-heading">
					How is your heart today?
				</h4>
				<p className="text-body-sm-medium text-text-subheading">
					A single tap on an emoji is all we need to suggest the right
					activities to support your well-being right now.
				</p>
				<button className="button-primary-medium ">
					Start Journaling
				</button>
			</div>
		</div>
	);
}
