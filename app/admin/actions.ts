"use server";

import { dashboardRepository } from "@/lib/repositories";

export interface DashboardStats {
  totalUsers: number;
  totalDepartments: number;
  totalCourses: number;
  totalSemesters: number;
  totalExamTypes: number;
  totalQuestions: number;
  questionsByStatus: {
    published: number;
    pending: number;
    rejected: number;
  };
}

export interface RecentQuestion {
  id: number;
  departmentName: string;
  courseName: string;
  semesterName: string;
  examTypeName: string;
  status: string;
  createdAt: Date;
  userName: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return dashboardRepository.getDashboardStats();
}

export async function getRecentQuestions(): Promise<RecentQuestion[]> {
  return dashboardRepository.getRecentQuestions();
}
