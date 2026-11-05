import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { error: "You must accept the terms" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  isPublic: z.boolean(),
});

export const passwordChangeSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters")
      .regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const LICENSE_TYPES = ["public_domain", "creative_commons", "author_owned", "explicit_permission"] as const;

export const bookMetaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  author: z.string().trim().min(1, "Author is required").max(200),
  description: z.string().trim().min(20, "Describe the book in at least 20 characters").max(5000),
  categoryId: z.string().uuid("Choose a category"),
  language: z.string().trim().min(2, "Choose a language").max(10),
  publicationYear: z.coerce.number().int().min(1000).max(2100).optional().or(z.literal("").transform(() => undefined)),
  isbn: z
    .string().trim()
    .regex(/^[0-9Xx-]{10,17}$/, "ISBN must be 10 or 13 digits")
    .optional().or(z.literal("").transform(() => undefined)),
  publisher: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  licenseType: z.enum(LICENSE_TYPES, { error: "Choose a licence type" }),
  licenseEvidence: z.string().trim().min(10, "Provide licence evidence or permission details (10+ characters)").max(2000),
  allowDownload: z.coerce.boolean().default(true),
  rightsConfirmed: z.literal(true, { error: "You must confirm you have the right to distribute this book" }),
});

export const bookEditSchema = bookMetaSchema.pick({
  title: true, author: true, description: true, categoryId: true, language: true,
  publicationYear: true, isbn: true, publisher: true, allowDownload: true,
  licenseType: true, licenseEvidence: true,
});

export const adminBookActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.enum(["approve", "restore"]) }),
  z.object({
    action: z.enum(["reject", "remove", "restrict"]),
    reason: z.string().trim().min(5, "A reason is required").max(1000),
    copyright: z.boolean().optional(),
  }),
  z.object({ action: z.literal("edit"), meta: bookEditSchema }),
]);

export const adminUserActionSchema = z.object({
  action: z.enum(["suspend", "restore"]),
  reason: z.string().trim().max(500).optional(),
});

export const adminReportActionSchema = z.object({
  status: z.enum(["open", "investigating", "resolved", "dismissed"]),
  note: z.string().trim().max(2000).optional(),
  restrictBook: z.boolean().optional(),
});

export const reviewSchema = z.object({
  bookId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(3000).optional().or(z.literal("")),
});

export const reportSchema = z.object({
  bookId: z.string().uuid(),
  kind: z.enum(["copyright", "inappropriate", "broken_file", "wrong_metadata", "other"]),
  details: z.string().trim().min(10, "Please give at least 10 characters").max(4000),
  claimantName: z.string().trim().max(200).optional().or(z.literal("")),
  claimantContact: z.string().trim().max(300).optional().or(z.literal("")),
});

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Invalid input";
}
