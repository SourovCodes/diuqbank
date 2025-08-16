import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redirecting to Dashboard | DIU QBank",
  description: "Redirecting to your dashboard",
};

export default async function EditProfilePage() {
  // Redirect to dashboard instead
  redirect("/dashboard?tab=profile");
}
