
import AppoimentCard from "@/components/partials/AppoimentCard";
export default function page() {
	return (
		<div className="p-6">
			<div className=" grid gap-3">
				<p className="text-label-small-medium text-text-subheading">
					Welcome to your daily board
				</p>
				<p className="text-heading-2-bold ">
					Good Morning,{" "}
					<span className="text-text-action">Nanda</span>{" "}
				</p>
				<div className="flex justify-between">
					
					<div className="flex gap-3  items-end">
						<button className="button-primary-medium">
							{" "}
							Book Session
						</button>
						<button className="button-secondary-medium">
							{" "}
							Chat With AI
						</button>
					</div>
				</div>
			</div>

			<AppoimentCard />
		</div>
	);
}
