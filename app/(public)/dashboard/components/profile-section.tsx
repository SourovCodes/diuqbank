"use client";

import type { User as UserType } from "@/db/schema";
import { ProfileForm } from "../../edit-profile/components/profile-form";

interface ProfileSectionProps {
  user: UserType;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Edit Profile
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Update your profile information and settings.
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
