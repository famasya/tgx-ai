import { tool } from "ai";
import { z } from "zod";

export const thoughtSchema = z.object({
	thought: z.string(),
	thoughtNumber: z.number().int(),
	totalThoughts: z.number().int(),
	nextThoughtNeeded: z.boolean(),
	stage: z.string(),
	tags: z.array(z.string()).optional(),
	axiomsUsed: z.array(z.string()).optional(),
	assumptionsChallenged: z.array(z.string()).optional(),
});

type Thought = z.infer<typeof thoughtSchema>;
class SequentialThoughtStore {
	private thoughts: Thought[] = [];

	add(thought: Thought) {
		this.thoughts.push(thought);
	}

	all() {
		return [...this.thoughts];
	}

	clear() {
		this.thoughts = [];
	}
}

export const thoughtStore = new SequentialThoughtStore();

export const sequentialThinking = tool({
	description: "Record a step in a structured sequential thinking process.",
	inputSchema: thoughtSchema,
	execute: (input) => {
		thoughtStore.add(input);
		return {
			status: "ok",
			storedThoughts: thoughtStore.all().length,
			nextThoughtNeeded: input.nextThoughtNeeded,
		};
	},
});

export const generateSummarySequentialThinking = tool({
	description: "Generate a structured summary of all recorded thoughts.",
	inputSchema: z.object({}),
	execute: async () => {
		const thoughts = thoughtStore.all();
		return {
			totalThoughts: thoughts.length,
			stages: [...new Set(thoughts.map((t) => t.stage))],
			thoughts: thoughts.map((t) => ({
				thoughtNumber: t.thoughtNumber,
				stage: t.stage,
				thought: t.thought,
			})),
		};
	},
});

export const clearHistory = tool({
	description: "Clear all stored thoughts.",
	inputSchema: z.object({}),
	execute: async () => {
		thoughtStore.clear();
		return { status: "cleared" };
	},
});
