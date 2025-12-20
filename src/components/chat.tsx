import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ChatMessages } from "@/components/chat-messages";
import type { MyUIMessage } from "@/routes/api/chat";
import { useChat } from "@ai-sdk/react";
import { type FormEvent, useState } from "react";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";

export default function Chat() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, regenerate, stop } =
		useChat<MyUIMessage>();

	const handleSubmit = (
		message: PromptInputMessage,
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (status === "streaming" || status === "submitted") {
			return stop();
		}

		if (!message.text) {
			return;
		}

		sendMessage({ text: message.text });
		setInput("");
	};

	const [suggestionsCache, _setSuggestionsCache] = useState<string[]>([
		"Carikan perda apa saja tentang lingkungan hidup",
		"Ada berapa hibah kendaraan bermotor?",
		"Carikan perda tentang pengadaan barang/jasa",
	]);

	return (
		<div className="flex flex-col h-full w-full max-w-4xl mx-auto">
			{/* Fixed Header */}
			<div className="flex-shrink-0 border-b bg-white px-4 py-3">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-zinc-900">
							JDIH Trenggalek
						</h1>
						<p className="text-xs text-zinc-500">
							Asisten pencarian peraturan daerah
						</p>
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-hidden">
				<ChatMessages
					messages={messages}
					status={status}
					regenerate={regenerate}
				/>
			</div>

			{/* Input Area */}
			<div className="flex-shrink-0 border-t bg-white p-4">
				<div className="mb-3">
					<Suggestions className="flex gap-2 overflow-x-auto pb-2">
						{messages.length === 0 &&
							suggestionsCache.map((suggestion, index) => (
								<Suggestion
									onClick={() => setInput(suggestion)}
									key={index.toString()}
									suggestion={suggestion}
								/>
							))}
					</Suggestions>
				</div>
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputBody>
						<PromptInputTextarea
							onChange={(e) => setInput(e.target.value)}
							value={input}
							placeholder="Tanyakan tentang peraturan daerah..."
						/>
					</PromptInputBody>
					<PromptInputFooter className="flex justify-end">
						<PromptInputSubmit
							size={"sm"}
							disabled={!input && !status}
							status={status}
						/>
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
