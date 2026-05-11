import Image from "next/image";
import Link from "next/link";

export interface Article {
	id: number;
	title: string;
	excerpt: string;
	category: string;
	readers: string;
	publishedAt: string;
	image: string;
}

interface ArticleCardProps {
	article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
	return (
		<Link
			href={`/psychiatrist/article/${article.id}`}
			className="bg-surface-background border border-border-default rounded-2xl flex flex-col h-full hover:border-border-action transition-all duration-300 hover:shadow-lg group cursor-pointer"
		>
			<div className="relative aspect-[16/9] m-4 rounded-xl overflow-hidden shrink-0">
				<Image
					src={article.image}
					alt={article.title}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-500"
				/>
			</div>
			<div className="p-4 flex flex-col gap-3 flex-1">
				<div className="flex justify-between items-center">
					<span className="px-2 py-1 rounded bg-surface-information text-text-action text-label-caption-semibold ">
						{article.category}
					</span>
					<span className="text-label-caption-medium text-text-label">
						{article.readers} Reader
					</span>
				</div>
				<div className="flex flex-col gap-2">
					<h3 className="text-body-lg-semibold text-text-body ">
						{article.title}
					</h3>
					<p className="text-body-sm-medium text-text-label line-clamp-2">
						{article.excerpt}
					</p>
				</div>
				<p className="text-label-caption-medium text-text-subheading mt-auto">
					Published at {article.publishedAt}
				</p>
			</div>
		</Link>
	);
}
