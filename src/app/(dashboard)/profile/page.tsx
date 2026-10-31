import type { Metadata } from "next";

import { MyProfileView } from "@/features/profile/components/MyProfileView";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return <MyProfileView />;
}
