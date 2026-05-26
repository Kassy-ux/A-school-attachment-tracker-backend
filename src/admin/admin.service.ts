import { eq, desc } from "drizzle-orm";
import db from "../drizzle/db.js";
import { users } from "../drizzle/schema.js";

export const getUsersService = async () => {
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      role: users.role,
      profileImage: users.profileImage,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
};

export const getSupervisorsService = async () => {
  return db
    .select({
      _id: users.id,
      fullName: users.fullName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "supervisor"));
};
