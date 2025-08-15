"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Eye, FileText, ArrowRight } from "lucide-react";
import { PublicContributor } from "../actions";

interface ContributorCardProps {
  contributor: PublicContributor;
}

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ContributorCard({ contributor }: ContributorCardProps) {
  return (
    <Link
      href={`/contributors/${contributor.username}`}
      className="block group"
    >
      <Card className="relative overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md h-full hover:-translate-y-0.5 py-4">
        <CardContent className="px-4 py-0 relative z-10 flex flex-col h-full">
          {/* User Info */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-12 w-12 border-2 border-slate-200 dark:border-slate-700">
              <AvatarImage
                src={contributor.image || ""}
                alt={contributor.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-semibold">
                {getInitials(contributor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {contributor.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                @{contributor.username}
              </p>
              {contributor.studentId && (
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  ID: {contributor.studentId}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              {contributor.questionCount} Questions
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {contributor.totalViews} Views
            </Badge>
          </div>

          {/* Stats */}
          <div className="mt-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-2 mb-3">
            {contributor.latestQuestionDate && (
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span>
                  Latest: {formatDate(contributor.latestQuestionDate)}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              <span>Contributor</span>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-3 w-3 text-blue-700 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
