import { tool } from "ai";
import { env } from "cloudflare:workers";
import { z } from "zod";

export const executeDocumentParse = async ({
	filename,
	query,
}: {
	filename: string;
	query?: string;
}) => {
	console.log(Date.now(), `Parsing document: ${filename} with query: ${query}`);

	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "google/gemini-2.0-flash-lite-001",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: query
									? `Extract and return the text content of this document focusing on sections relevant to: "${query}". Do not summarize or add commentary.`
									: "Extract and return the full, plain text content of this document. Do not summarize or add commentary.",
							},
							{
								type: "file",
								file: {
									filename,
									file_data: `https://tgxai-buckets.abidf.com/${filename}`,
								},
							},
						],
					},
				],
			}),
		},
	);

	const data = (await response.json()) as {
		id: string;
		provider: string;
		model: string;
		object: string;
		created: number;
		choices: Array<{
			message: {
				role: string;
				content: string;
			};
		}>;
		usage: {
			prompt_tokens: number;
			completion_tokens: number;
			total_tokens: number;
		};
	};

	const content = data.choices
		.map((choice) => choice.message.content)
		.join("\n");

	console.log(
		Date.now(),
		`Parsed content for ${filename}: ${content.length} characters`,
	);

	return {
		filename,
		content: content,
	};
};

export const documentParse = tool({
	description: "Parse documents and return its content as text",
	inputSchema: z.object({
		query: z
			.string()
			.optional()
			.describe("Optional search query to filter documents"),
		filenames: z
			.array(z.string())
			.describe(
				"Arrays of file name including extension (e.g., document.pdf, report.docx). Must be a valid file name that exists in the tgxai-buckets.abidf.com bucket.",
			),
	}),
	execute: async ({ filenames, query }) => {
		const results = await Promise.all(
			filenames.map((filename) => executeDocumentParse({ filename, query })),
		);

		return results;
	},
});
