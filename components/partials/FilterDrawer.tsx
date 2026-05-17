"use client";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expertises: any[];
  tempStates: {
    expertise: number | null;
    rating: number | null;
    gender: string | null;
    experience: string | null;
    minPrice: string;
    maxPrice: string;
  };
  setTempStates: {
    setExpertise: (val: number | null) => void;
    setRating: (val: number | null) => void;
    setGender: (val: string | null) => void;
    setExperience: (val: string | null) => void;
    setMinPrice: (val: string) => void;
    setMaxPrice: (val: string) => void;
  };
  onSave: () => void;
  onClear: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  expertises,
  tempStates,
  setTempStates,
  onSave,
  onClear,
}: FilterDrawerProps) {
  return (
		<div className={`fixed inset-0 z-200 flex justify-end transition-all duration-300 ${
			isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
		}`}>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300"
				onClick={onClose}
			/>

			{/* Drawer Content */}
			<div className={`relative w-full md:max-w-lg bg-surface-background h-full shadow-2xl flex flex-col md:rounded-l-3xl transition-transform duration-300 ease-out ${
				isOpen ? "translate-x-0" : "translate-x-full"
			}`}>
				<div className="p-6 sm:p-8 flex-1 overflow-y-auto">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-heading-6-bold sm:text-heading-4-bold text-text-heading">
							Filter Specialist
						</h2>
						<button
							onClick={onClose}
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

					{/* Expertise Section */}
					<div className="flex flex-col gap-4 mb-8">
						<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
							Expertise
						</h3>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => setTempStates.setExpertise(null)}
								className={`select-default-medium ${
									!tempStates.expertise ? "active" : ""
								}`}
							>
								All Specialist
							</button>
							{expertises.map((exp) => (
								<button
									key={exp.id}
									onClick={() =>
										setTempStates.setExpertise(exp.id)
									}
									className={`select-default-medium ${
										tempStates.expertise === exp.id
											? "active"
											: ""
									}`}
								>
									{exp.name}
								</button>
							))}
						</div>
					</div>

					{/* Rating Section */}
					<div className="flex flex-col gap-4 mb-8">
						<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
							Rating
						</h3>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => setTempStates.setRating(null)}
								className={`select-default-medium flex items-center gap-2 ${
									tempStates.rating === null ? "active" : ""
								}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									className="size-4 "
									viewBox="0 0 24 24"
								>
									<path d="M0 0h24v24H0z" fill="none" />
									<path
										fill="currentColor"
										d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
									/>
								</svg>
								All
							</button>
							{[4, 3, 5, 2, 1].map((r) => (
								<button
									key={r}
									onClick={() => setTempStates.setRating(r)}
									className={`select-default-medium flex items-center gap-2 ${
										tempStates.rating === r ? "active" : ""
									}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										className="size-4 "
										viewBox="0 0 24 24"
									>
										<path d="M0 0h24v24H0z" fill="none" />
										<path
											fill="currentColor"
											d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
										/>
									</svg>
									{r}.0
								</button>
							))}
						</div>
					</div>

					{/* Gender Section */}
					<div className="flex flex-col gap-4 mb-8">
						<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
							Gender
						</h3>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => setTempStates.setGender(null)}
								className={`select-default-medium ${
									tempStates.gender === null ? "active" : ""
								}`}
							>
								All Gender
							</button>
							<button
								onClick={() =>
									setTempStates.setGender("female")
								}
								className={`select-default-medium ${
									tempStates.gender === "female"
										? "active"
										: ""
								}`}
							>
								Female
							</button>
							<button
								onClick={() => setTempStates.setGender("male")}
								className={`select-default-medium ${
									tempStates.gender === "male" ? "active" : ""
								}`}
							>
								Male
							</button>
						</div>
					</div>

					{/* Experience Section */}
					<div className="flex flex-col gap-4 mb-8">
						<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
							Experience
						</h3>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() =>
									setTempStates.setExperience(null)
								}
								className={`select-default-medium ${
									tempStates.experience === null
										? "active"
										: ""
								}`}
							>
								All
							</button>
							<button
								onClick={() =>
									setTempStates.setExperience("junior")
								}
								className={`select-default-medium ${
									tempStates.experience === "junior"
										? "active"
										: ""
								}`}
							>
								Junior (1-2 Years)
							</button>
							<button
								onClick={() =>
									setTempStates.setExperience("intermediate")
								}
								className={`select-default-medium ${
									tempStates.experience === "intermediate"
										? "active"
										: ""
								}`}
							>
								Intermediate (3-4 Years)
							</button>
							<button
								onClick={() =>
									setTempStates.setExperience("expert")
								}
								className={`select-default-medium ${
									tempStates.experience === "expert"
										? "active"
										: ""
								}`}
							>
								Expert (5+ Years)
							</button>
						</div>
					</div>

					{/* Price Section */}
					<div className="flex flex-col gap-4 mb-8">
						<h3 className="text-heading-6-semibold text-text-heading border-b border-border-default pb-4">
							Price
						</h3>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<input
									type="number"
									value={tempStates.minPrice}
									onChange={(e) =>
										setTempStates.setMinPrice(
											e.target.value,
										)
									}
									placeholder="Lowest Price"
									className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
								/>
							</div>
							<div className="text-border-default">—</div>
							<div className="flex-1">
								<input
									type="number"
									value={tempStates.maxPrice}
									onChange={(e) =>
										setTempStates.setMaxPrice(
											e.target.value,
										)
									}
									placeholder="Highest Price"
									className="w-full p-4 rounded-xl border border-border-default bg-surface-default focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="p-6 sm:p-8 flex gap-4 mt-auto border-t border-border-default bg-white">
					<button onClick={onSave} className="button-primary-large flex-1 justify-center">
						Save Filter
					</button>
					<button onClick={onClear} className="button-outline-large flex-1 justify-center">
						Clear Filter
					</button>
				</div>
			</div>
		</div>
  );
}
