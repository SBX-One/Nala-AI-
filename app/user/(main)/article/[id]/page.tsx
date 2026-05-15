import React from "react";
import ArticleDetail from "@/components/partials/ArticleDetail";
import Link from "next/link";
import { getArticleById } from "@/app/actions/article";
import { notFound } from "next/navigation";

export default async function page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const article = await getArticleById(parseInt(id));

	if (!article || article.status !== "published") {
		notFound();
	}

	return (
		<div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
			<Link
				href="/user/article"
				className="flex items-center gap-2 text-text-subheading hover:text-text-action transition-colors w-fit"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-5"
					viewBox="0 0 24 24"
				>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="m15 19l-7-7l7-7"
					/>
				</svg>
				Back to Articles
			</Link>

			<ArticleDetail article={article as any} />
		</div>
	);
}
