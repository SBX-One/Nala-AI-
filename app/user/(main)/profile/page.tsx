"use client";

import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "@/app/actions/user";
import { Contact, User } from "lucide-react";

export default function UserAccountPage() {
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [profile, setProfile] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		displayName: "",
		sex: "male",
		location: "",
		birthDate: "",
		avatarUrl: "",
	});

	useEffect(() => {
		async function loadProfile() {
			const data = await getUserProfile();
			if (data) {
				setProfile(data);
				setFormData({
					name: data.name || "",
					displayName: data.display_name || "",
					sex: data.sex || "male",
					location: data.location || "",
					birthDate: data.birth_date || "",
					avatarUrl: data.avatar_url || "",
				});
			}
			setLoading(false);
		}
		loadProfile();
	}, []);

	const handleSave = async () => {
		setIsSaving(true);
		const result = await updateUserProfile(formData);
		if (result.success) {
			alert("Profile updated successfully!");
		} else {
			alert("Failed to update profile: " + result.error);
		}
		setIsSaving(false);
	};

	const handleRevert = () => {
		if (profile) {
			setFormData({
				name: profile.name || "",
				displayName: profile.display_name || "",
				sex: profile.sex || "male",
				location: profile.location || "",
				birthDate: profile.birth_date || "",
				avatarUrl: profile.avatar_url || "",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-default"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6 flex w-full justify-center items-center px-4 sm:px-6">
			<div className="bg-white border border-border-default rounded-2xl p-4 sm:p-8 w-full lg:w-4/5 shadow-sm">
				<div className="flex flex-col gap-8">
					{/* Section Header */}
					<div className="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-6 sm:size-8 text-text-action shrink-0"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M5 19V5v4.475V9zm3-6h3.525q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288H8q-.425 0-.712.288T7 12t.288.713T8 13m0 4h3.525q.425 0 .713-.288t.287-.712t-.288-.712t-.712-.288H8q-.425 0-.712.288T7 16t.288.713T8 17m0-8h8q.425 0 .713-.288T17 8t-.288-.712T16 7H8q-.425 0-.712.288T7 8t.288.713T8 9M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v4.45q0 .425-.288.713T20 10.45t-.712-.287T19 9.45V5H5v14h4q.425 0 .713.288T10 20t-.288.713T9 21zm10.225-5.725Q14.5 14.55 14.5 13.5t.725-1.775T17 11t1.775.725t.725 1.775t-.725 1.775T17 16t-1.775-.725M17 17q.975 0 1.938.188t1.862.562q.575.225.888.738T22 19.6v.4q0 .425-.288.713T21 21h-8q-.425 0-.712-.288T12 20v-.4q0-.6.313-1.112t.887-.738q.9-.375 1.863-.562T17 17"
							/>
						</svg>
						<h2 className="text-body-lg-semibold sm:text-body-xl-semibold text-text-heading">
							Personal Information
						</h2>
					</div>

					{/* Profile Picture */}
					<div className="space-y-4">
						<p className="text-label-base-semibold text-text-label">
							Profile Picture
						</p>
						<div className="flex flex-col sm:grid sm:grid-cols-2 w-full items-start sm:items-center gap-6">
							<div className="flex gap-4 items-center w-full">
								<div className="size-20 sm:size-25 rounded-full overflow-hidden bg-surface-disabled relative border border-border-default shrink-0">
									{formData.avatarUrl ? (
										<img
											src={formData.avatarUrl}
											alt="Profile"
											className="size-full object-cover"
										/>
									) : (
										<div className="size-full flex items-center justify-center bg-primary-100 text-primary-700 text-heading-4-bold">
											{formData.name?.charAt(0) || (
												<User className="size-10" />
											)}
										</div>
									)}
								</div>
								{formData.avatarUrl && (
									<p className="text-label-caption-medium text-text-heading truncate">
										{formData.avatarUrl.split("/").pop()}
									</p>
								)}
							</div>
							<div className="flex w-full items-center sm:items-end justify-start sm:justify-end">
								<div className="flex gap-3 w-full sm:w-auto">
									<button className="button-outline-small flex-1 sm:flex-none justify-center">
										Delete
									</button>
									<button className="button-outline-small flex-1 sm:flex-none justify-center">
										Change Picture
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Form Fields */}
					<div className="grid gap-6">
						<div className="space-y-2">
							<p className="text-label-small-semibold text-text-label">
								Display Name
							</p>
							<input
								type="text"
								value={formData.displayName}
								onChange={(e) =>
									setFormData({
										...formData,
										displayName: e.target.value,
									})
								}
								className="w-full p-3 sm:p-4 rounded-xl border border-border-default bg-white text-body-base-medium focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
								placeholder="Dont use your real name"
							/>
						</div>

						<div className="space-y-2">
							<p className="text-label-small-semibold text-text-label">
								Full Name
							</p>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								className="w-full p-3 sm:p-4 rounded-xl border border-border-default bg-white text-body-base-medium focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
								placeholder="Enter Full Name"
							/>
						</div>

						<div className="space-y-2">
							<p className="text-label-small-semibold text-text-label">
								Gender
							</p>
							<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
								<label className="flex items-center gap-3 cursor-pointer group">
									<input
										type="radio"
										name="gender"
										checked={formData.sex === "male"}
										onChange={() =>
											setFormData({
												...formData,
												sex: "male",
											})
										}
										className="size-5 accent-primary-default"
									/>
									<span className="text-body-base-medium text-text-body group-hover:text-text-heading transition-colors">
										Male
									</span>
								</label>
								<label className="flex items-center gap-3 cursor-pointer group">
									<input
										type="radio"
										name="gender"
										checked={formData.sex === "female"}
										onChange={() =>
											setFormData({
												...formData,
												sex: "female",
											})
										}
										className="size-5 accent-primary-default"
									/>
									<span className="text-body-base-medium text-text-body group-hover:text-text-heading transition-colors">
										Female
									</span>
								</label>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<p className="text-label-small-semibold text-text-label">
									Current Location
								</p>
								<input
									type="text"
									value={formData.location}
									onChange={(e) =>
										setFormData({
											...formData,
											location: e.target.value,
										})
									}
									className="w-full p-3 sm:p-4 rounded-xl border border-border-default bg-white text-body-base-medium focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
									placeholder="Ex: New York, Denpasar, Oklahoma"
								/>
							</div>
							<div className="space-y-2">
								<p className="text-label-small-semibold text-text-label">
									Date of Born
								</p>
								<input
									type="date"
									value={formData.birthDate}
									onChange={(e) =>
										setFormData({
											...formData,
											birthDate: e.target.value,
										})
									}
									className="w-full p-3 sm:p-4 rounded-xl border border-border-default bg-white text-body-base-medium focus:outline-none focus:ring-1 focus:ring-primary-default transition-all"
								/>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6">
						<button
							onClick={handleRevert}
							className="button-outline-small w-full sm:w-auto justify-center"
						>
							Revert
						</button>
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="button-primary-small w-full sm:w-auto justify-center"
						>
							{isSaving ? "Saving..." : "Save Change"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
