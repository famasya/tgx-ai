import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { ChatMessages } from "@/components/chat-messages";
import { DocumentSources } from "@/components/document-sources";
import type { MyUIMessage } from "@/routes/api/chat";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status, regenerate } = useChat<MyUIMessage>();

	const handleSubmit = (message: PromptInputMessage) => {
		if (!message.text) {
			return;
		}

		sendMessage({ text: message.text });
		setInput("");
	};

	return (
		<div className="w-full h-screen flex">
			{/* Left side - Chat */}
			<div className="flex-1 flex flex-col border-r">
				<div className="flex-1 overflow-hidden">
					<ChatMessages
						messages={messages}
						status={status}
						regenerate={regenerate}
					/>
				</div>
				<div className="border-t p-4">
					<PromptInput onSubmit={handleSubmit}>
						<PromptInputBody>
							<PromptInputTextarea
								onChange={(e) => setInput(e.target.value)}
								value={input}
							/>
						</PromptInputBody>
						<PromptInputFooter>
							<PromptInputSubmit disabled={!input && !status} status={status} />
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>

			{/* Right side - Document Sources */}
			<div className="w-1/2 flex flex-col">
				<DocumentSources messages={messages} />
			</div>
		</div>
	);
}
