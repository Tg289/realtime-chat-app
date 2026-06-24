import { User } from "@prisma/client";

export default function UserCard({
  user,
}: {
  user: User;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <div className="flex items-center gap-3">
        {user.image && (
          <img
            src={user.image}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}

        <div>
          <h3 className="font-semibold">
            {user.name}
          </h3>

          <p className="text-sm text-zinc-500">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}