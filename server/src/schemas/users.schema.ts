import {z} from "zod";
export const userSchema = z.object({
    id:z.string(),
    name:z.string().length(2),
    email:z.string().email(),
    password:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    image:z.string().optional(),
    createdAt:z.date(),
    updatedAt:z.date()
});