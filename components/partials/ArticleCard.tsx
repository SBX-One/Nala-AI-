import Image from "next/image";
import Link from "next/link";

export interface Article {
	id: number;
	title: string;
	overview: string;
	duration: number;
	image_url: string;
	created_at: string;
	category?: {
		name: string;
	};
	author?: {
		name: string;
		avatar_url?: string;
	};
}

interface ArticleCardProps {
	article: Article;
	basePath?: string;
}

export default function ArticleCard({ article, basePath = "/user/article" }: ArticleCardProps) {
	const authorAvatar = article.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.name || "Nala")}&background=random`;

	return (
		<Link
			href={`${basePath}/${article.id}`}
			className="bg-surface-background border border-border-default rounded-2xl flex flex-col h-full transition-all duration-300 group cursor-pointer"
		>
			<div className="relative aspect-video m-4 rounded-xl overflow-hidden shrink-0 bg-surface-disabled">
				{article.image_url ? (
					<Image
						src={article.image_url}
						alt={article.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-text-placeholder">
						No Image
					</div>
				)}
			</div>
			<div className="p-4 flex flex-col gap-3 flex-1 pt-0">
				<div className="flex justify-between items-center">
					<span className="px-2 py-1 rounded bg-surface-information/10 text-text-action text-label-caption-semibold border border-border-information/20">
						{article.category?.name || "General"}
					</span>
					<span className="text-label-caption-medium text-text-subheading">
						{article.duration} Min read
					</span>
				</div>
				<div className="flex flex-col gap-2">
					<h3 className="text-body-lg-semibold text-text-heading line-clamp-2">
						{article.title}
					</h3>
					<p className="text-body-sm-medium text-text-subheading line-clamp-2">
						{article.overview}
					</p>
				</div>
				
				{/* Author Section */}
				<div className="mt-auto pt-4 flex items-center gap-3">
					<div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
						<Image 
							src={authorAvatar} 
							alt={article.author?.name || "Nala Expert"} 
							fill 
							className="object-cover"
						/>
					</div>
					<span className="text-body-caption-medium text-text-subheading truncate">
						{article.author?.name || "Nala Expert"}
					</span>
				</div>
			</div>
		</Link>
	);
}
