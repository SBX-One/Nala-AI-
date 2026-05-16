"use client";

import { useState, useEffect, useCallback } from "react";
import {
	getPublishedArticles,
	getArticleCategories,
	getArticleTopics,
} from "@/app/actions/article";
import ArticleCard from "@/components/partials/ArticleCard";

export default function ArticleListPage() {
	const [articles, setArticles] = useState<any[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Filter States
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(
		null,
	);
	const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
	const [selectedDuration, setSelectedDuration] = useState<string | null>(
		null,
	);

	// Temp States for Drawer
	const [tempCategory, setTempCategory] = useState<number | null>(null);
	const [tempTopic, setTempTopic] = useState<number | null>(null);
	const [tempDuration, setTempDuration] = useState<string | null>(null);

	const openDrawer = useCallback(() => {
		setTempCategory(selectedCategory);
		setTempTopic(selectedTopic);
		setTempDuration(selectedDuration);
		setIsDrawerOpen(true);
	}, [selectedCategory, selectedTopic, selectedDuration]);

	const handleSaveFilter = () => {
		setSelectedCategory(tempCategory);
		setSelectedTopic(tempTopic);
		setSelectedDuration(tempDuration);
		setIsDrawerOpen(false);
	};

	const fetchData = useCallback(async () => {
		setLoading(true);
		const [articlesData, categoriesData, topicsData] = await Promise.all([
			getPublishedArticles(),
			getArticleCategories(),
			getArticleTopics(),
		]);
		setArticles(articlesData);
		setCategories(categoriesData);
		setTopics(topicsData);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Filter Logic
	const filteredArticles = articles.filter((article) => {
		const matchCategory =
			!selectedCategory || article.category_id === selectedCategory;
		const matchTopic =
			!selectedTopic ||
			article.topics?.some((t: any) => t.category_topic === selectedTopic);

		let matchDuration = true;
		if (selectedDuration === "light") matchDuration = article.duration <= 3;
		if (selectedDuration === "medium")
			matchDuration = article.duration > 3 && article.duration <= 7;
		if (selectedDuration === "deep") matchDuration = article.duration > 7;

		return matchCategory && matchTopic && matchDuration;
	});

	// Helper to get filter summary text
	const getFilterSummary = () => {
		const parts = [];

		const catName =
			categories.find((c) => c.id === selectedCategory)?.name ||
			"All Categories";
		parts.push(catName);

		if (selectedTopic) {
			const topicName = topics.find((t) => t.id === selectedTopic)?.name;
			if (topicName) parts.push(topicName);
		} else {
			parts.push("All Topics");
		}

		if (selectedDuration) {
			const labels: Record<string, string> = {
				light: "Light Read",
				medium: "Medium Read",
				deep: "Deep Dive",
			};
			parts.push(labels[selectedDuration]);
		} else {
			parts.push("All Reading Time");
		}

		return parts.join(", ");
	};

	// Check if any advanced filter is active (Topic or Duration)
	// Quick filter (Category) doesn't trigger the summary bar anymore
	const isFiltering = selectedTopic !== null || selectedDuration !== null;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen">
			{/* Drawer / Modal */}
			{isDrawerOpen && (
				<div className="fixed inset-0 z-100 flex justify-end">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
						onClick={() => setIsDrawerOpen(false)}
					/>

					{/* Drawer Content */}
					<div className="relative w-full md:max-w-lg bg-surface-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 md:rounded-l-3xl">
						<div className="p-6 sm:p-8 flex-1 overflow-y-auto">
							<div className="flex items-center justify-between mb-8">
								<h2 className="text-heading-6-bold sm:text-heading-4-bold text-text-heading">
									Filter Article
								</h2>
								<button
									onClick={() => setIsDrawerOpen(false)}
									className="p-2 hover:bg-surface-default rounded-full text-icon-default transition-colors"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-6"
										viewBox="0 0 24 24"
									>
										<path
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M18 6L6 18M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Categories Section */}
							<div className="flex flex-col gap-4 mb-8">
								<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
									Categories
								</h3>
								<div className="flex flex-wrap gap-3">
									<button
										onClick={() => setTempCategory(null)}
										className={`select-default-medium ${
											!tempCategory ? "active" : ""
										}`}
									>
										All Categories
									</button>
									{categories.map((cat) => (
										<button
											key={cat.id}
											onClick={() =>
												setTempCategory(cat.id)
											}
											className={`select-default-medium ${
												tempCategory === cat.id
													? "active"
													: ""
											}`}
										>
											{cat.name}
										</button>
									))}
								</div>
							</div>

							{/* Topics Section */}
							<div className="flex flex-col gap-4 mb-8">
								<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
									Topics
								</h3>
								<div className="flex flex-wrap gap-3">
									<button
										onClick={() => setTempTopic(null)}
										className={`select-default-medium ${
											!tempTopic ? "active" : ""
										}`}
									>
										All Topics
									</button>
									{topics.map((topic) => (
										<button
											key={topic.id}
											onClick={() =>
												setTempTopic(topic.id)
											}
											className={`select-default-medium ${
												tempTopic === topic.id
													? "active"
													: ""
											}`}
										>
											{topic.name}
										</button>
									))}
								</div>
							</div>

							{/* Reading Time Section */}
							<div className="flex flex-col gap-4 mb-8">
								<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
									Reading Time
								</h3>
								<div className="flex flex-wrap gap-3">
									<button
										onClick={() => setTempDuration(null)}
										className={`select-default-medium ${
											!tempDuration ? "active" : ""
										}`}
									>
										All Reading
									</button>
									<button
										onClick={() => setTempDuration("light")}
										className={`select-default-medium ${
											tempDuration === "light"
												? "active"
												: ""
										}`}
									>
										Light Read (1-3 Min)
									</button>
									<button
										onClick={() => setTempDuration("medium")}
										className={`select-default-medium ${
											tempDuration === "medium"
												? "active"
												: ""
										}`}
									>
										Medium Read (3-7 Min)
									</button>
									<button
										onClick={() => setTempDuration("deep")}
										className={`select-default-medium ${
											tempDuration === "deep"
												? "active"
												: ""
										}`}
									>
										Deep Dive (7+ Min)
									</button>
								</div>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="p-6 sm:p-8 flex gap-4 mt-auto border-t border-border-default bg-white">
							<button
								onClick={handleSaveFilter}
								className="button-primary-large flex-1 justify-center"
							>
								Save Filter
							</button>
							<button
								onClick={() => {
									setTempCategory(null);
									setTempTopic(null);
									setTempDuration(null);
								}}
								className="button-outline-large flex-1 justify-center"
							>
								Clear Filter
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="border-b border-b-border-default py-8 px-6 grid gap-4">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 ">
					<div className="flex flex-col gap-2">
						<h1 className="md:text-display-lg-bold text-heading-3-semibold text-text-heading">
							Read Article
						</h1>
						<p className="text-body-base-medium text-text-subheading">
							Explore more insight about human's mental
						</p>
					</div>
					<button
						onClick={openDrawer}
						className="button-outline-medium"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-4"
							viewBox="0 0 24 24"
						>
							<path d="M0 0h24v24H0z" fill="none" />
							<path
								fill="currentColor"
								d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
							/>
						</svg>
						More Filter
					</button>
				</div>

				{/* Filter Bar Logic */}
				<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
					{isFiltering ? (
						<div
							onClick={openDrawer}
							className="flex items-center gap-3 px-4 py-2 bg-surface-primary-light border border-border-default rounded-full cursor-pointer transition-all group"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-6 text-text-action"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"
								/>
							</svg>
							<span className="text-label-base-medium text-text-action">
								{getFilterSummary()}
							</span>
						</div>
					) : (
						<>
							{/* Default Quick Category Filter */}
							<button
								onClick={() => setSelectedCategory(null)}
								className={`select-default-medium ${
									selectedCategory === null ? "active" : ""
								}`}
							>
								All Categories
							</button>
							{categories.map((category) => (
								<button
									key={category.id}
									onClick={() => setSelectedCategory(category.id)}
									className={`select-default-medium ${
										selectedCategory === category.id
											? "active"
											: ""
									}`}
								>
									{category.name}
								</button>
							))}
						</>
					)}
				</div>
			</div>

			<div className="p-6 bg-surface-default min-h-[500px]">
				{filteredArticles.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 bg-surface-background rounded-3xl border border-dashed border-border-default">
						<p className="text-body-lg-semibold text-text-heading">
							No articles found
						</p>
						<p className="text-body-sm-medium text-text-subheading">
							Check back later for new content.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredArticles.map((article) => (
							<ArticleCard
								key={article.id}
								article={article}
								basePath="/user/article"
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
