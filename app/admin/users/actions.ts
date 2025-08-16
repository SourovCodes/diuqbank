"use server";

import { revalidatePath } from "next/cache";
import { userFormSchema, type UserFormValues } from "./schemas/user";
import {
  ensurePermission,
  getPaginationMeta,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { userRepository } from "@/lib/repositories";

// Create a new user
export async function createUser(values: UserFormValues) {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = userFormSchema.parse(values);

    // Check if user with same email already exists
    const isEmailTaken = await userRepository.isEmailTaken(validatedFields.email);
    if (isEmailTaken) {
      return fail("A user with this email already exists.");
    }

    // Check if username already exists
    const isUsernameTaken = await userRepository.isUsernameTaken(validatedFields.username);
    if (isUsernameTaken) {
      return fail("A user with this username already exists.");
    }

    // Check if student ID is provided and already exists
    if (validatedFields.studentId) {
      const isStudentIdTaken = await userRepository.isStudentIdTaken(validatedFields.studentId);
      if (isStudentIdTaken) {
        return fail("A user with this student ID already exists.");
      }
    }

    const user = await userRepository.create({
      id: userRepository.generateUserId(),
      name: validatedFields.name,
      email: validatedFields.email,
      username: validatedFields.username,
      studentId: validatedFields.studentId || null,
      image: validatedFields.image || null,
    });

    revalidatePath("/admin/users");
    return ok(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Update an existing user
export async function updateUser(id: string, values: UserFormValues) {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = userFormSchema.parse(values);

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return fail("User not found.");
    }

    // Check if another user with the same email exists (except this one)
    const isEmailTaken = await userRepository.isEmailTaken(validatedFields.email, id);
    if (isEmailTaken) {
      return fail("Another user with this email already exists.");
    }

    // Check if another user with the same username exists (except this one)
    const isUsernameTaken = await userRepository.isUsernameTaken(validatedFields.username, id);
    if (isUsernameTaken) {
      return fail("Another user with this username already exists.");
    }

    // Check if student ID is provided and another user with the same student ID exists (except this one)
    if (validatedFields.studentId) {
      const isStudentIdTaken = await userRepository.isStudentIdTaken(validatedFields.studentId, id);
      if (isStudentIdTaken) {
        return fail("Another user with this student ID already exists.");
      }
    }

    const user = await userRepository.update(id, {
      name: validatedFields.name,
      email: validatedFields.email,
      username: validatedFields.username,
      studentId: validatedFields.studentId || null,
      image: validatedFields.image || null,
    });

    if (!user) {
      return fail("Failed to update user.");
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}/edit`);
    return ok(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return fail("User not found.");
    }

    // Check if user is associated with any questions
    const questionCount = await userRepository.getQuestionCount(id);

    if (questionCount > 0) {
      return fail("Cannot delete user that has associated questions.");
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) {
      return fail("Failed to delete user.");
    }

    revalidatePath("/admin/users");
    return ok();
  } catch (error) {
    console.error("Error deleting user:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single user by ID
export async function getUser(id: string) {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    const user = await userRepository.findById(id);

    if (!user) {
      return fail("User not found");
    }

    return ok(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get paginated users with optional search
export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    const result = await userRepository.findManyWithQuestionCounts({
      page,
      pageSize,
      search,
    });

    return ok({
      users: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all users for migration dropdown
export async function getAllUsers() {
  try {
    // Check if the user has permission to manage users
    const perm = await ensurePermission("USERS:MANAGE");
    if (!perm.success) return perm;

    const allUsers = await userRepository.findAllWithQuestionCounts();

    return ok(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return fail("Something went wrong. Please try again.");
  }
}
