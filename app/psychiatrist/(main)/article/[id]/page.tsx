import React from "react";
import ArticleDetail from "@/components/partials/ArticleDetail";
import { Article } from "@/components/partials/ArticleCard";
import Link from "next/link";

const dummyArticles: Article[] = [
	{
		id: 1,
		title: "Tips for managing morning panic?",
		excerpt:
			"I've been waking up with a racing heart lately. Does anyone have quick grounding techniques that help in the first few minutes of the day?",
		category: "Anxiety Management",
		readers: "120K",
		publishedAt: "December 24, 2025",
		image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
	},
	{
		id: 2,
		title: "How can mindful breathing reduce stress?",
		excerpt:
			"Struggling to stay present? Learn simple breathing patterns to calm your nervous system anytime, anywhere with these expert-backed techniques.",
		category: "Stress Relief",
		readers: "85K",
		publishedAt: "December 20, 2025",
		image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop",
	},
	{
		id: 3,
		title: "Does improving sleep help anxiety symptoms?",
		excerpt:
			"Discover effective bedtime routines that promote restful sleep and reduce nighttime anxiety. Quality rest is the foundation of mental well-being.",
		category: "Sleep Hygiene",
		readers: "95K",
		publishedAt: "December 18, 2025",
		image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1000&auto=format&fit=crop",
	},
];

export default async function page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const article = dummyArticles.find((a) => a.id === parseInt(id));

	if (!article) {
		return (
			<div className="p-8 flex flex-col items-center justify-center gap-4">
				<h1 className="text-heading-3-bold text-text-heading">
					Article not found
				</h1>
				<Link href="/psychiatrist/article" className="button-primary-medium">
					Back to Articles
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Link
				href="/psychiatrist/article"
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

			<ArticleDetail article={article} />
		</div>
	);
}
