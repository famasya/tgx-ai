import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ChatMessages } from "@/components/chat-messages";
import type { ChatUIMessage } from "@/routes/api/chat";
import { useChat } from "@ai-sdk/react";
import { Quote } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type FormEvent, useState } from "react";
import Header from "./header";

export default function Chat() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, regenerate, stop } =
		useChat<ChatUIMessage>();

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
		"Carikan peraturan apa saja tentang lingkungan hidup",
		"Ada berapa hibah kendaraan bermotor?",
		"Carikan perda tentang pengadaan barang/jasa",
	]);

	return (
		<div className="flex flex-col h-full w-full mx-auto">
			<Header />

			{/* Messages Area */}
			<div className="flex-1 w-full overflow-hidden max-w-4xl mx-auto [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
				{messages.length > 0 ? (
					<ChatMessages
						messages={messages}
						status={status}
						regenerate={regenerate}
					/>
				) : (
					<div className="max-w-4xl px-4 mx-auto h-full flex flex-col justify-center">
						<div className="text-center bg-gradient-to-tl from-sky-800 via-sky-500 to-sky-400 bg-clip-text text-transparent text-3xl font-semibold selection:bg-sky-200 selection:text-sky-900">
							Telo AI
						</div>
						<h3 className="text-sm font-semibold text-zinc-800 mb-3 flex items-center gap-2 mt-2">
							<span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
							SARAN PERTANYAAN
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{suggestionsCache.map((suggestion, index) => (
								<button
									key={index.toString()}
									type="button"
									onClick={() => setInput(suggestion)}
									className="group relative text-sm bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/80 text-blue-900 px-4 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xs border border-blue-200/50 hover:border-blue-300 
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 whitespace-normal break-words text-left"
								>
									<div className="flex items-start justify-between gap-2">
										<span className="leading-relaxed">{suggestion}</span>
										<HugeiconsIcon
											icon={Quote}
											strokeWidth={2}
											className="flex-shrink-0 w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors"
										/>
									</div>
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Input Area */}
			<div className="flex-shrink-0 p-2 w-full max-w-4xl mx-auto">
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputBody>
						<PromptInputTextarea
							className="bg-white"
							onChange={(e) => setInput(e.target.value)}
							value={input}
							placeholder="Ketik pertanyaan disini..."
						/>
					</PromptInputBody>
					<PromptInputFooter className="flex justify-end bg-white">
						<PromptInputSubmit
							className="rounded-full bg-sky-600 hover:bg-sky-700 text-white"
							size={"sm"}
							disabled={!input && !status}
							status={status}
						/>
					</PromptInputFooter>
				</PromptInput>
				<div className="text-xs my-2 text-center text-zinc-700 rounded-lg p-2">
					AI mungkin memberikan informasi yang tidak akurat. Selalu cek
					kebenaran informasi di sumber resmi.
				</div>
			</div>
		</div>
	);
}
