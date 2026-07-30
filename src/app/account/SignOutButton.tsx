"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
      className="rounded-full border border-line px-5 py-2 text-sm text-muted transition-colors hover:border-brass hover:text-brass"
    >
      Sign out
    </button>
  );
}
