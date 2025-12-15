import type { MyUIMessage } from "@/routes/api/chat";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const saveSession = createServerFn()
	.inputValidator(
		z.object({
			id: z.uuid().optional(),
			messages: z.array(z.custom<MyUIMessage>()),
		}),
	)
	.handler(async ({ data }) => {
		const { id, messages } = data;

		// if no id is provided, generate a new one
		const sessionId = id ?? uuidv7();
		await env.kv.put(`session:${sessionId}`, JSON.stringify(messages));

		return { id: sessionId };
	});
