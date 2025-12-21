import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
} from "@/components/ai-elements/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { DocumentSearchResults } from "@/components/document-search-results";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import type { ChatUIMessage } from "@/routes/api/chat";
import {
	AiSheetsIcon,
	Copy01Icon,
	FileSearchIcon,
	RefreshIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChatRequestOptions, ChatStatus } from "ai";

interface ChatMessagesProps {
	messages: ChatUIMessage[];
	status: ChatStatus;
	regenerate: (options?: ChatRequestOptions) => void;
}

function ToolCallDisplay({
	toolName,
	input,
	output,
}: {
	toolName: string;
	input: Record<string, unknown>;
	output?: Record<string, unknown>;
}) {
	const getToolIcon = () => {
		switch (toolName) {
			case "documentSearch":
				return <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} />;
			case "documentContentSearchTool":
				return (
					<HugeiconsIcon icon={FileSearchIcon} size={16} strokeWidth={2} />
				);
			case "documentRelationGraph":
				return <HugeiconsIcon icon={AiSheetsIcon} size={16} strokeWidth={2} />;
			default:
				return <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} />;
		}
	};

	const getToolLabel = () => {
		switch (toolName) {
			case "documentSearch":
				return "Mencari dokumen";
			case "documentContentSearchTool":
				return "Membaca isi dokumen";
			case "documentRelationGraph":
				return "Menganalisa relasi dokumen";
			case "sequentialThinking":
				return "Berpikir sekuensial";
			case "generateSummarySequentialThinking":
				return "Merangkum pemikiran";
			default:
				return toolName;
		}
	};

	const getToolArgs = (): string => {
		if (toolName === "documentSearch" && input?.query) {
			return String(input.query);
		}
		if (toolName === "documentContentSearchTool") {
			return `${String(input?.filename || "")} - ${String(input?.query || "")}`;
		}
		if (toolName === "documentRelationGraph" && input?.filename) {
			return String(input.filename);
		}
		return JSON.stringify(input);
	};

	const shouldShowDocuments = (): boolean => {
		return (
			(toolName === "documentSearch" ||
				toolName === "documentContentSearchTool") &&
			!!output?.data &&
			Array.isArray(output.data) &&
			output.data.length > 0
		);
	};

	const shouldShowMermaid = (): boolean => {
		return toolName === "documentRelationGraph" && !!output?.mermaid;
	};

	return (
		<div className="my-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
			<div className="flex items-start gap-2">
				<div className="mt-0.5 text-violet-600">{getToolIcon()}</div>
				<div className="flex-1 w-full flex flex-col gap-3">
					<div className="flex flex-row justify-between">
						<div className="flex-1">
							<div className="font-medium text-sm text-zinc-900">
								<span className="px-2 bg-violet-100 py-0.5 rounded-full">
									{getToolLabel()}
								</span>
							</div>
							<div className="text-xs text-zinc-600 mt-1 break-words">
								{getToolArgs()}
							</div>
						</div>
						{shouldShowDocuments() && output && (
							<DocumentSearchResults
								output={output as AutoRagSearchResponse}
								query={getToolArgs()}
							/>
						)}
					</div>
					{shouldShowMermaid() && (
						<div className="bg-white p-4 rounded-md border border-violet-100">
							<MermaidDiagram
								chart={String((output as { mermaid: string }).mermaid)}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export function ChatMessages({
	messages,
	status,
	regenerate,
}: ChatMessagesProps) {
	return (
		<Conversation className="h-full">
			<ConversationContent>
				{messages.map((message) => (
					<div key={message.id}>
						{message.parts.map((part, i) => {
							switch (part.type) {
								case "text":
									return (
										<Message key={`${message.id}-${i}`} from={message.role}>
											<MessageContent>
												<MarkdownRenderer>{part.text}</MarkdownRenderer>
											</MessageContent>
											{message.role === "assistant" && (
												<MessageActions>
													<MessageAction
														onClick={() => regenerate()}
														label="Retry"
													>
														<HugeiconsIcon
															icon={RefreshIcon}
															size={12}
															stroke="2"
														/>
													</MessageAction>
													<MessageAction
														onClick={() =>
															navigator.clipboard.writeText(part.text)
														}
														label="Copy"
													>
														<HugeiconsIcon icon={Copy01Icon} size={12} />
													</MessageAction>
												</MessageActions>
											)}
										</Message>
									);
								case "reasoning":
									return (
										<Reasoning
											key={`${message.id}-${i}`}
											defaultOpen={false}
											isStreaming={
												status === "streaming" &&
												i === message.parts.length - 1 &&
												message.id === messages.at(-1)?.id
											}
										>
											<ReasoningTrigger />
											<ReasoningContent className="data-[state=closed]:animate-none data-[state=open]:animate-none bg-sky-50 border border-sky-200 text-sky-900 p-2 rounded-md">
												{part.text}
											</ReasoningContent>
										</Reasoning>
									);
								case "tool-documentSearch":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentSearch"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-documentContentSearchTool":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentContentSearchTool"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-sequentialThinking":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="sequentialThinking"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-generateSummarySequentialThinking":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="generateSummarySequentialThinking"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								case "tool-documentRelationGraph":
									return (
										<div key={`${message.id}-${i}`} className="px-4 sm:px-6">
											<ToolCallDisplay
												toolName="documentRelationGraph"
												input={(part.input || {}) as Record<string, unknown>}
												output={part.output as Record<string, unknown>}
											/>
										</div>
									);
								default:
									return null;
							}
						})}
					</div>
				))}
				{status === "submitted" && <LoadingSkeleton />}
			</ConversationContent>
			<ConversationScrollButton />
		</Conversation>
	);
}

function LoadingSkeleton() {
	return (
		<div>
			<div className="animate-pulse space-y-3">
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				<div className="h-4 bg-gray-200 rounded w-1/2"></div>
				<div className="h-18 bg-gray-200 rounded w-5/6"></div>
			</div>
		</div>
	);
}
