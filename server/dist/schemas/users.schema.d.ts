import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    image: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
//# sourceMappingURL=users.schema.d.ts.map