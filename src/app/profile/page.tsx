import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.email) {
    return (
      <div>
        Unauthorized
      </div>
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },
    });

  if (!user) {
    return (
      <div>
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Profile
        </h1>

        <ProfileForm
          user={user}
        />
      </div>
    </div>
  );
}