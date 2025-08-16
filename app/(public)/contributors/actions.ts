"use server";

import { ok, fail } from "@/lib/action-utils";
import { contributorRepository } from "@/lib/repositories";

export interface PublicContributor {
  id: string;
  name: string;
  username: string;
  studentId: string | null;
  image: string | null;
  questionCount: number;
  totalViews: number;
  latestQuestionDate: Date | null;
}

export interface ContributorQuestion {
  id: number;
  pdfKey: string;
  pdfFileSizeInBytes: number;
  viewCount: number;
  createdAt: Date;
  departmentName: string | null;
  departmentShortName: string | null;
  courseName: string | null;
  semesterName: string | null;
  examTypeName: string | null;
}

export interface ContributorDetails {
  id: string;
  name: string;
  username: string;
  studentId: string | null;
  image: string | null;
  questionCount: number;
  totalViews: number;
  joinedAt: Date | null;
  departments: Array<{
    name: string | null;
    shortName: string | null;
    count: number;
  }>;
  courses: Array<{
    name: string | null;
    departmentName: string | null;
    count: number;
  }>;
  examTypes: Array<{ name: string | null; count: number }>;
}

// Get paginated list of contributors with their statistics
export async function getPublicContributors(
  page: number = 1,
  pageSize: number = 12
) {
  try {
    const result = await contributorRepository.findPublicContributors(page, pageSize);

    return ok(result);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single contributor's details with their questions
export async function getPublicContributor(username: string) {
  try {
    const contributor = await contributorRepository.findPublicContributorByUsername(username);

    if (!contributor) {
      return fail("Contributor not found");
    }

    return ok(contributor);
  } catch (error) {
    console.error("Error fetching contributor:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a contributor's questions with pagination
export async function getContributorQuestions(
  username: string,
  page: number = 1,
  pageSize: number = 12
) {
  try {
    const result = await contributorRepository.findContributorQuestions(username, page, pageSize);

    if (!result) {
      return fail("User not found");
    }

    return ok(result);
  } catch (error) {
    console.error("Error fetching contributor questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}
