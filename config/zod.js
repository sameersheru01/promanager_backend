const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    email: z.string().email('Invalid email format').trim().min(1, { message: "Email is required" }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmpassword: z.string().trim().min(1, { message: "Confirm password is required" }),
}).refine(data => {
    // Only check if both fields are filled
    if (data.password && data.confirmpassword) {
        return data.password === data.confirmpassword;
    }
    return true; // Skip validation if one of the fields is empty
}, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format').trim().min(1, { message: "Email is required" }),
    password: z.string().min(1, { message: 'Password is required' })
})

const todoSchema = z.object({
    title: z.string().min(1, "Title is required"),
    priority: z.string().min(1, "Priority is required"),
    checklist: z.array(
        z.object({
            todo: z.string().min(1, "Todo item cannot be empty"), 
            checked: z.boolean(),
        })
    ).min(1, "Checklist must contain at least one item"), 
    assignedto: z.string().optional(), // This should be optional
    duedate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
});



module.exports = { registerSchema,loginSchema, todoSchema };
