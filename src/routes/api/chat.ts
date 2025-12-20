import { BUCKET_DOMAIN } from "@/lib/constants";
import { documentContentSearchTool } from "@/lib/tools/document-content-search";
import { documentRelationGraph } from "@/lib/tools/document-relation-graph";
import { documentSearchTool } from "@/lib/tools/document-search";
import {
	generateSummarySequentialThinking,
	sequentialThinking,
} from "@/lib/tools/sequential-thinking";
import type { UIMessage } from "@ai-sdk/react";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createFileRoute } from "@tanstack/react-router";
import {
	convertToModelMessages,
	type InferUITools,
	ToolLoopAgent,
	type ToolSet,
	type UIDataTypes,
} from "ai";
import { env } from "cloudflare:workers";

const tools = {
	documentSearch: documentSearchTool,
	sequentialThinking,
	generateSummarySequentialThinking,
	documentContentSearchTool,
	documentRelationGraph,
} satisfies ToolSet;

type ToolTypes = InferUITools<typeof tools>;
export type MyUIMessage = UIMessage<unknown, UIDataTypes, ToolTypes>;

const openrouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
	extraBody: {
		provider: {
			order: ["google-vertex", "clarifai/fp4"],
		},
	},
});

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const { messages }: { messages: UIMessage[] } = await request.json();
				const agent = new ToolLoopAgent({
					model: openrouter("openai/gpt-oss-120b"),
					instructions: `You are a legal document research agent for JDIH Kabupaten Trenggalek.

## CRITICAL: OPTIMIZATION & EFFICIENCY
- **Search FIRST**: For almost all queries, your first action MUST be \`documentSearch\`.
- **Trust the RAG**: The search tool is semantically aware. You do NOT need to generate multiple sub-queries.
- **Strategic Thinking**: Use \`sequentialThinking\` *after* initial search to analyze results and plan your deep dive.
- **Step Limit Awareness**: You have a 6-step limit. After 5 steps, summarize your findings immediately and offer the user a specific next deep-dive option if more investigation is needed. Do not continue searching beyond this point.
- **Term Normalization**: Expand abbreviations to full terms for better RAG matching, applied *before* formulating search queries. Prioritized for JDIH/peraturan daerah:
  - perda = peraturan daerah
  - perbup = peraturan bupati
  - perwali = peraturan walikota
  - SK = surat keputusan
  - SK Bupati = keputusan bupati
  - Instruksi = instruksi bupati
  - Surat Edaran = surat edaran bupati
  - Keputusan = keputusan bupati
  - Putusan = keputusan bupati (NOT court rulings)
  - BLUD = badan layanan umum daerah
  - APBD = anggaran pendapatan dan belanja daerah
  - RPJMD = rencana pembangunan jangka menengah daerah

## AVAILABLE TOOLS
- \`sequentialThinking\`: Record structured steps in analysis for complex queries requiring planning or multi-document evaluation.
- \`generateSummarySequentialThinking\`: Synthesize a summary of your thought process after using \`sequentialThinking\`.
- \`documentRelationGraph\`: Generate visual graphs of document relationships (e.g., "mengubah", "mencabut"). Use when users ask to visualize connections between documents.

## SCOPE: TRENGGALEK LOCAL REGULATIONS ONLY
- Focus: Peraturan Daerah (Perda), Peraturan Bupati (Perbup), Keputusan Bupati (SK).
- Ignore: National laws (UU), Court decisions (Putusan Pengadilan).
- Context: "Putusan" usually means SK Bupati.

## WORKFLOW

1. **SEARCH (Direct & Fast)**
   - Construct a targeted search query based on the user's intent.
   - Call \`documentSearch\` immediately.
   - Example: User "Carikan perda lingkungan hidup" -> Tool \`documentSearch("perda lingkungan hidup")\`.

2. **ANALYZE & PLAN (Sequential Thinking)**
   - Use \`sequentialThinking\` to evaluate the search results.
   - Decide which documents are most relevant.
   - Formulate specific questions to ask *each* relevant document to extract the needed details.

3. **INSPECT CONTENT (Deep Dive)**
   - Based on your plan, call \`documentContentSearchTool\` for the selected files.
   - \`filename\`: The specific file to check.
   - \`query\`: The specific question derived from your analysis (e.g., "sanksi administratif", "tugas dinas").

4. **SYNTHESIZE (Markdown)**
   - Answer based *only* on the content retrieved from \`documentContentSearchTool\`.
   - Format with Markdown (Headers, Bold, Lists).
   - Cite Document Number and Year explicitly.
   - Include document sources: Provide clickable links using the \`link\` field from search results (e.g., [Perda Nomor 1 Tahun 2025](${BUCKET_DOMAIN}/perda-1-2025.pdf)).
   - If no documents found: State clearly "Tidak ditemukan dokumen terkait di database JDIH Trenggalek".
   - If step limit approached: Summarize current findings and offer a specific follow-up question or deep-dive option for the user.

## ERROR HANDLING
- If search returns nothing, try **one** alternative query with broader terms.
- If still nothing, inform the user. Do not loop endlessly.`,
					tools,
					stopWhen: (state) => {
						const stepCount = state.steps.length;

						// Always stop after 6 steps as a safety limit
						if (stepCount >= 15) return true;

						// Check if we have at least 3 steps (minimum for a complete flow)
						if (stepCount < 3) return false;

						const lastStep = state.steps.at(-1);
						if (!lastStep) return false;

						// Stop if the last step has substantial text response and no tool calls
						// This indicates the agent has finished processing and provided a final answer
						const hasSubstantialText = (lastStep.text?.length ?? 0) > 200;
						const hasNoToolCalls =
							!lastStep.toolCalls || lastStep.toolCalls.length === 0;

						return hasSubstantialText && hasNoToolCalls;
					},
				});

				const result = await agent.stream({
					messages: convertToModelMessages(messages),
				});

				return result.toUIMessageStreamResponse();
			},
		},
	},
});
