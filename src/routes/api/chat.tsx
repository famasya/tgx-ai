import { documentSearchTool } from "@/lib/tools";
import type { UIMessage } from "@ai-sdk/react";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createFileRoute } from "@tanstack/react-router";
import {
	convertToModelMessages,
	type InferUITools,
	stepCountIs,
	ToolLoopAgent,
	type ToolSet,
	type UIDataTypes,
} from "ai";
import { env } from "cloudflare:workers";

const openrouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
});

const tools = {
	documentSearch: documentSearchTool,
} satisfies ToolSet;
type ToolTypes = InferUITools<typeof tools>;
export type MyUIMessage = UIMessage<unknown, UIDataTypes, ToolTypes>;

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const { messages }: { messages: UIMessage[] } = await request.json();

				const agent = new ToolLoopAgent({
					model: openrouter("openai/gpt-5-nano"),
					instructions: `
    You are a document research agent. 
    For the user’s query, generate exactly THREE meaningful sub-queries.
    For each sub-query, call the tool: documentSearch.
    After retrieving documents for each, summarize the findings.
  `,
					tools,
					stopWhen: stepCountIs(10),
				});

				const result = await agent.stream({
					messages: convertToModelMessages(messages),
				});

				return result.toUIMessageStreamResponse();
			},
		},
	},
});
