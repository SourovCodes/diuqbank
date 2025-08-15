"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Calendar, FileText, Eye, Users } from "lucide-react";
import { ContributorDetails } from "../../actions";

interface ContributorHeaderProps {
  contributor: ContributorDetails;
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

export function ContributorHeader({ contributor }: ContributorHeaderProps) {
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${contributor.name} - DIU Question Bank Contributor`,
            text: `Check out ${contributor.name}'s contributions to DIU Question Bank`,
            url: window.location.href,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          // You could add a toast notification here
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }
    }
  };

  return (
    <Card className="shadow-sm py-6">
      <CardHeader className="pb-0 px-6 pt-0">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-4 border-slate-200 dark:border-slate-700 shadow-lg">
            <AvatarImage src={contributor.image || ""} alt={contributor.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-2xl">
              {getInitials(contributor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl md:text-3xl font-semibold leading-snug">
              {contributor.name}
            </CardTitle>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
              @{contributor.username}
            </p>
            {contributor.studentId && (
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Student ID: {contributor.studentId}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-6 pb-0 space-y-5">
        {/* Statistics Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            {contributor.questionCount} Questions
          </Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {contributor.totalViews} Total Views
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Contributor
          </Badge>
        </div>

        {/* Join Date */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {contributor.joinedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                First contribution: {formatDate(contributor.joinedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Department and Course Statistics */}
        {(contributor.departments.length > 0 ||
          contributor.courses.length > 0 ||
          contributor.examTypes.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Top Departments */}
            {contributor.departments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Top Departments
                </h4>
                <div className="space-y-1">
                  {contributor.departments
                    .slice(0, 3)
                    .map(
                      (
                        dept: {
                          name: string | null;
                          shortName: string | null;
                          count: number;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-600 dark:text-slate-400 truncate">
                            {dept.shortName || "N/A"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {dept.count}
                          </Badge>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}

            {/* Top Courses */}
            {contributor.courses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Top Courses
                </h4>
                <div className="space-y-1">
                  {contributor.courses
                    .slice(0, 3)
                    .map(
                      (
                        course: {
                          name: string | null;
                          departmentName: string | null;
                          count: number;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-600 dark:text-slate-400 truncate">
                            {course.name || "N/A"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {course.count}
                          </Badge>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}

            {/* Exam Types */}
            {contributor.examTypes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Exam Types
                </h4>
                <div className="space-y-1">
                  {contributor.examTypes
                    .slice(0, 3)
                    .map(
                      (
                        examType: { name: string | null; count: number },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-600 dark:text-slate-400 truncate">
                            {examType.name || "N/A"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {examType.count}
                          </Badge>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="rounded-full h-10 border-slate-200 dark:border-slate-700 bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
