import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const parser = async (filename: string) => {
	console.log(`Parsing ${filename}`);
	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "amazon/nova-2-lite-v1:free",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: "Extract and return the full, plain text content of this document. Do not summarize or add commentary.",
							},
							{
								type: "file",
								file: {
									filename: "document.pdf",
									file_data: `https://tgxai-buckets.abidf.com/${filename}`,
								},
							},
						],
					},
				],
				// Optional: Configure PDF processing engine
				plugins: [
					{
						id: "file-parser",
						pdf: {
							engine: "pdf-text",
						},
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

	return data;
};
export const Route = createFileRoute("/api/parser")({
	server: {
		handlers: {
			GET: async () => {
				const files = await env.r2.list();

				for (const file of files.objects) {
					const key = `doc:${file.key}`;
					const content = await env.r2.get(key);
					if (content) {
						console.log(`Found content for ${key}`);
					} else {
						const parsed = await parser(file.key);
						const contentText = parsed.choices
							.map((choice) => choice.message.content)
							.join("\n");
						await env.kv.put(key, contentText);
						console.log(`Parsed content for ${file.key}`);
					}
				}
				return new Response("OK", { status: 200 });
			},
		},
	},
});
