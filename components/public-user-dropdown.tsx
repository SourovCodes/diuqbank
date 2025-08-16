"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LayoutDashboard, LogOut, LogIn } from "lucide-react";

interface PublicUserDropdownProps {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function PublicUserDropdown({
  align = "end",
  sideOffset = 8,
}: PublicUserDropdownProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Get initials for the fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // If user is not logged in, show login button
  if (!user) {
    return (
      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href="/login">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Link>
      </Button>
    );
  }

  // If user is logged in, show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
          <Avatar className="h-6 w-6">
            {user?.image ? (
              <AvatarImage src={user.image} alt={user?.name ?? "User"} />
            ) : null}
            <AvatarFallback className="text-xs">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-flex text-sm font-medium">
            {user?.name?.split(" ")[0] || "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={align}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard?tab=profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
