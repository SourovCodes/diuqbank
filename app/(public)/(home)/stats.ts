"use server";

import { db } from "@/db/drizzle";
import { questions, courses, departments, users } from "@/db/schema";
import { count } from "drizzle-orm";

export type StatsData = {
  questionsCount: number;
  coursesCount: number;
  departmentsCount: number;
  contributorsCount: number;
};

export async function getStats(): Promise<StatsData> {
  try {
    // Fetch stats from database concurrently
    const [
      questionsResult,
      coursesResult,
      departmentsResult,
      contributorsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(questions),
      db.select({ count: count() }).from(courses),
      db.select({ count: count() }).from(departments),
      db.select({ count: count() }).from(users),
    ]);

    return {
      questionsCount: questionsResult[0]?.count || 0,
      coursesCount: coursesResult[0]?.count || 0,
      departmentsCount: departmentsResult[0]?.count || 0,
      contributorsCount: contributorsResult[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return default values in case of error.ok
    return {
      questionsCount: 0,
      coursesCount: 0,
      departmentsCount: 0,
      contributorsCount: 0,
    };
  }
}
