import Link from "next/link";
import Image from "next/image";

interface ArticleRecommendationCardProps {
	articles?: any[];
}

export default function ArticleRecommendationCard({ articles = [] }: ArticleRecommendationCardProps) {
	if (articles.length === 0) {
		return (
			<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-full shadow-sm flex flex-col">
				<h3 className="text-body-xl-semibold text-text-body mb-6">Article Recommendation</h3>
				<div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-border-default rounded-3xl bg-surface-default gap-4">
					<h4 className="text-heading-5-bold text-text-heading">Explore at your own pace.</h4>
					<p className="text-body-sm-medium text-text-subheading max-w-[450px]">
						Once we get to know your mood, we'll curate gentle reads and insights tailored just for you. For now, feel free to browse our full library whenever you're ready.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-surface-background border border-border-default rounded-2xl p-6 h-full flex flex-col">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-body-xl-semibold text-text-body ">
					Article Recommendation
				</h3>
				<Link
					href="/user/article"
					className="text-label-caption-semibold text-text-action hover:underline"
				>
					See All
				</Link>
			</div>

			<div className="flex flex-col gap-4">
				{articles.map((article: any, i: number) => (
					<Link
						href={`/user/article/${article.id}`}
						key={i}
						className="p-5 border border-border-default rounded-2xl flex flex-col gap-3 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
					>
						<div className="flex justify-between items-center">
							<span className="px-3 py-1 rounded bg-surface-primary-light text-text-action text-label-caption-semibold border border-border-default">
								{article.category || "Anxiety Management"}
							</span>
							<span className="text-label-caption-medium text-text-label">
								{article.duration || "12"} Min read
							</span>
						</div>
						<h4 className="text-body-lg-semibold text-text-body">
							{article.title ||
								"Tips for managing morning panic?"}
						</h4>
						<p className="text-body-sm-medium text-text-subheading line-clamp-2">
							{article.overview ||
								"I've been waking up with a racing heart lately. Does anyone have quick grounding exercises they recommend before getting out of bed?"}
						</p>
						<div className="flex justify-between items-center ">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded-full bg-surface-disabled overflow-hidden relative">
									<Image
										src={
											article.author_avatar ||
											`https://ui-avatars.com/api/?name=${encodeURIComponent(
												article.author_name ||
													"Anonymous",
											)}&background=random`
										}
										alt={article.author_name || "Avatar"}
										fill
										className="object-cover"
									/>
								</div>
								<span className="text-body-caption-medium text-text-heading">
									{article.author_name ||
										"Dr. Samantha Hellness"}
								</span>
							</div>
							<span className="text-body-caption-medium text-text-subheading">
								{article.date || "December 24, 2025"}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
