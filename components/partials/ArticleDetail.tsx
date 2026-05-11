import React from "react";
import Image from "next/image";
import { Article } from "./ArticleCard";

interface ArticleDetailProps {
	article: Article;
	author?: {
		name: string;
		role: string;
		avatar: string;
	};
	readTime?: string;
}

export default function ArticleDetail({
	article,
	author = {
		name: "Jordan Lee",
		role: "MFT",
		avatar: "https://i.pravatar.cc/150?u=jordan",
	},
	readTime = "8 Min read",
}: ArticleDetailProps) {
	return (
		<div className="bg-surface-background rounded-3xl overflow-hidden flex flex-col gap-8">
			{/* Main Image */}
			<div className=" border-b border-border-default p-16 flex flex-col gap-8">
				<div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden ">
					<Image
						src={article.image}
						alt={article.title}
						fill
						className="object-cover"
					/>
				</div>

				<div className="flex flex-col gap-6 mx-auto  px-16  w-full">
					{/* Author & Meta */}
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<p className="text-label-caption-medium text-text-subheading">
								Published at {article.publishedAt}
							</p>
						</div>
						<span className="text-label-caption-medium text-text-subheading">
							{readTime}
						</span>
					</div>

					{/* Title & Category */}
					<div className="flex flex-col gap-4">
						<div className="grid gap-3">
							<h1 className="text-heading-5-semibold text-text-heading">
								{article.title}
							</h1>
							<p className="text-body-sm-medium text-text-subheading">
								{article.excerpt}
							</p>
						</div>
						<div className="flex gap-2">
							<span className="px-3 py-1 rounded-full bg-surface-information/10 text-text-information text-label-caption-medium border border-border-information/20">
								{article.category}
							</span>
							<span className="px-3 py-1 rounded-full bg-surface-default text-text-subheading text-label-caption-medium border border-border-default">
								Anxiety
							</span>
							<span className="px-3 py-1 rounded-full bg-surface-default text-text-subheading text-label-caption-medium border border-border-default">
								Personality
							</span>
						</div>
					</div>
				</div>
			</div>
			{/* Content Content (Dummy) */}
			<div className="p-16">
				<div className="flex flex-col gap-6 text-text-body leading-relaxed px-16">
					<p className="text-body-base-regular">
						In our fast-paced world, stress often feels like an
						unavoidable companion. When we are stressed, our bodies
						enter a &quot;fight-or-flight&quot; mode, increasing our
						heart rate and flooding our system with cortisol. But
						did you know that you have a built-in &quot;reset
						button&quot; to counter this? It&apos;s your breath.
					</p>

					<div className="flex flex-col gap-4">
						<h3 className="text-body-xl-semibold text-text-heading">
							What is Mindful Breathing?
						</h3>
						<p className="text-body-base-regular">
							Mindful breathing is the practice of intentionally
							focusing on the sensation of each breath. Unlike the
							automatic breathing we do all day, mindful breathing
							requires us to be present and observe how the air
							enters and leaves our bodies.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h3 className="text-body-xl-semibold text-text-heading">
							How It Works in Your Brain
						</h3>
						<p className="text-body-base-regular">
							When you take slow, deep breaths, you send a signal
							to your brain to switch from the Sympathetic Nervous
							System (the gas pedal for stress) to the
							Parasympathetic Nervous System (the brake for
							relaxation). This process stimulates the Vagus
							Nerve, which instantly tells your heart to slow down
							and your muscles to relax.
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h3 className="text-body-xl-semibold text-text-heading">
							Key Benefits of Mindful Breathing:
						</h3>
						<ol className="list-decimal list-inside flex flex-col gap-2 pl-4">
							<li>
								Lowers Cortisol Levels: Deep breathing helps
								reduce the production of stress hormones.
							</li>
							<li>
								Improves Focus: By anchoring your mind to your
								breath, you quiet the &quot;noise&quot; of
								overthinking.
							</li>
							<li>
								Regulates Emotions: It provides a &quot;pause
								button&quot; between a stressful event and your
								reaction.
							</li>
						</ol>
					</div>

					<div className="flex flex-col gap-4">
						<h3 className="text-body-xl-semibold text-text-heading">
							A Simple 4-7-8 Technique to Try Now:
						</h3>
						<p className="text-body-base-regular">
							If you&apos;re feeling overwhelmed, try this quick
							exercise:
						</p>
						<ul className="list-disc list-inside flex flex-col gap-2 pl-4">
							<li>
								Inhale quietly through your nose for a count of
								4.
							</li>
							<li>Hold your breath for a count of 7.</li>
							<li>
								Exhale forcefully through your mouth, making a
								&quot;whoosh&quot; sound for a count of 8.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
