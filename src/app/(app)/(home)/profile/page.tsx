// src/app/(app)/(home)/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon, UserIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery(trpc.auth.session.queryOptions());
  const logout = useMutation(trpc.auth.logout.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.auth.session.queryFilter());
      router.push("/");
    },
  }));

  useEffect(() => {
    if (!isLoading && !session?.user) {
      router.push("/sign-in");
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderIcon className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="px-4 lg:px-12 py-10 flex flex-col items-center">
      <div className="max-w-md w-full bg-white border rounded-md p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="size-20 rounded-full bg-pink-100 flex items-center justify-center">
            <UserIcon className="size-10 text-pink-400" />
          </div>
          <h1 className="text-2xl font-medium">Profile</h1>
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">{session.user.username}</span>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;