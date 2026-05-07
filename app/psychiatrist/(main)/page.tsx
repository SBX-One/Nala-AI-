import PlantIcon from "@/public/icon/plant-icon.svg";
import AppoimentCard from "@/components/partials/AppoimentCard";
import Image from "next/image";
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
					<div className="rounded-full border border-border-default p-4 bg-surface-primary-light w-fit flex gap-3">
						<Image
							src={PlantIcon}
							alt="Plant-Icon"
							priority
							className="size-4.5"
						/>
						<p className="text-body-base-medium text-text-body">
							You have 4 appointments today!. 14.00 - 17.00 is a
							busy hour
						</p>
					</div>
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
