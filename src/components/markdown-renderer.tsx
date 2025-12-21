import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Streamdown } from "@phaserjs/streamdown-lite";
import { memo, useMemo } from "react";

interface MarkdownRendererProps {
	children: string;
	className?: string;
}

interface ParsedContent {
	type: "markdown" | "mermaid";
	content: string;
	id: string;
}

function parseMarkdownWithMermaid(markdown: string): ParsedContent[] {
	const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
	const parts: ParsedContent[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while (true) {
		match = mermaidRegex.exec(markdown);
		if (match === null) break;
		// Add markdown before mermaid block
		if (match.index > lastIndex) {
			const markdownContent = markdown.slice(lastIndex, match.index).trim();
			if (markdownContent) {
				parts.push({
					type: "markdown",
					content: markdownContent,
					id: `md-${lastIndex}`,
				});
			}
		}

		// Add mermaid block
		parts.push({
			type: "mermaid",
			content: match[1].trim(),
			id: `mermaid-${match.index}`,
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining markdown
	if (lastIndex < markdown.length) {
		const remaining = markdown.slice(lastIndex).trim();
		if (remaining) {
			parts.push({
				type: "markdown",
				content: remaining,
				id: `md-${lastIndex}`,
			});
		}
	}

	// If no mermaid blocks found, return original markdown
	if (parts.length === 0) {
		parts.push({
			type: "markdown",
			content: markdown,
			id: "md-0",
		});
	}

	return parts;
}

export const MarkdownRenderer = memo(
	({ children, className }: MarkdownRendererProps) => {
		const parsedContent = useMemo(
			() => parseMarkdownWithMermaid(children),
			[children],
		);

		// If only markdown, use Streamdown directly
		if (parsedContent.length === 1 && parsedContent[0].type === "markdown") {
			return (
				<Streamdown
					className={`size-full streamdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className || ""}`}
				>
					{children}
				</Streamdown>
			);
		}

		// Mixed content with mermaid diagrams
		return (
			<div className={className}>
				{parsedContent.map((part) => {
					if (part.type === "mermaid") {
						return (
							<MermaidDiagram
								key={part.id}
								chart={part.content}
								className="my-4"
							/>
						);
					}

					return (
						<Streamdown
							key={part.id}
							className="size-full streamdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
						>
							{part.content}
						</Streamdown>
					);
				})}
			</div>
		);
	},
	(prevProps, nextProps) => prevProps.children === nextProps.children,
);

MarkdownRenderer.displayName = "MarkdownRenderer";
