import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        image: z.string(),
        tags: z.array(z.string()),
        link: z.string().url().optional(),
        github: z.string().url().optional(),
        category: z.enum(['game', 'other']),
    }),
});

export const collections = { projects };