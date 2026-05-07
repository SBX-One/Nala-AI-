import StarIcon from "@/public/icon/star.svg";
import Image from "next/image";
export default function Info() {
	return (
		<div className="rounded-full border border-border-default p-4 bg-surface-primary-light w-fit flex gap-3">
			<Image
				src={StarIcon}
				alt="Star Icon"
				priority
				className="size-4.5"
			/>
			<p className="text-body-base-medium text-text-body">
				You have 4 appointments today!. 14.00 - 17.00 is a busy hour
			</p>
		</div>
	);
}
