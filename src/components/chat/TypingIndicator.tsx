export default function TypingIndicator({
  user,
}: {
  user: string;
}) {
  if (!user) return null;

  return (
    <div className="px-4 py-2 text-sm text-zinc-400">
      {user} is typing...
    </div>
  );
}