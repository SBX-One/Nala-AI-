import React from "react";
import Image from "next/image";
import { Article } from "./ArticleCard";

interface ArticleDetailProps {
	article: Article & { content?: string; author?: { name: string }; topics?: any[] };
	author?: {
		name: string;
		role: string;
		avatar: string;
	};
	readTime?: string;
}

export default function ArticleDetail({
	article,
	author,
	readTime,
}: ArticleDetailProps) {
	const displayAuthor = author || {
		name: article.author?.name || "Nala Expert",
		role: "Mental Health Specialist",
		avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.name || "Nala")}&background=random`,
	};

	const displayReadTime = readTime || `${article.duration || 0} Min read`;

	return (
		<div className="bg-surface-background rounded-3xl overflow-hidden flex flex-col gap-8">
			{/* Main Image */}
			<div className=" border-b border-border-default p-8 md:p-16 flex flex-col gap-8">
				<div className="relative aspect-video md:aspect-21/9 w-full rounded-2xl overflow-hidden bg-surface-disabled">
					{article.image_url ? (
						<Image
							src={article.image_url}
							alt={article.title}
							fill
							className="object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-text-placeholder">
							No Image
						</div>
					)}
				</div>

				<div className="flex flex-col gap-6 mx-auto w-full max-w-4xl">
					{/* Author & Meta */}
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="relative w-10 h-10 rounded-full overflow-hidden">
								<Image src={displayAuthor.avatar} alt={displayAuthor.name} fill className="object-cover" />
							</div>
							<div>
								<p className="text-body-sm-bold text-text-heading">{displayAuthor.name}</p>
								<p className="text-label-caption-medium text-text-subheading">
									{new Date(article.created_at).toLocaleDateString("en-US", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</p>
							</div>
						</div>
						<span className="text-label-caption-medium text-text-subheading">
							{displayReadTime}
						</span>
					</div>

					{/* Title & Category */}
					<div className="flex flex-col gap-4">
						<div className="grid gap-3">
							<h1 className="text-heading-4-bold md:text-heading-3-bold text-text-heading">
								{article.title}
							</h1>
							<p className="text-body-base-medium text-text-subheading italic">
								{article.overview}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<span className="px-3 py-1 rounded-full bg-surface-information text-text-action text-label-caption-medium border border-border-information/20">
								{article.category?.name || "General"}
							</span>
							{article.topics?.map((topic: any, idx: number) => (
								<span key={idx} className="px-3 py-1 rounded-full bg-surface-default text-text-subheading text-label-caption-medium border border-border-default">
									{topic.categoryTopic?.name}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
			
			{/* Content */}
			<div className="p-8 md:p-16 pt-0">
				<div className="flex flex-col gap-6 text-text-body leading-relaxed mx-auto max-w-4xl prose prose-slate">
					{article.content ? (
						<div 
							className="text-body-base-regular whitespace-pre-wrap"
							dangerouslySetInnerHTML={{ __html: article.content }}
						/>
					) : (
						<p className="text-body-base-regular text-text-placeholder italic">
							No content available for this article.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
