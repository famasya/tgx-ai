import { tool } from "ai";
import { z } from "zod";

const documentRelationGraphSchema = z.object({
	documents: z
		.array(z.string())
		.describe("Array of document filenames (e.g., ['doc-a.pdf', 'doc-b.pdf'])"),
	relationships: z
		.array(
			z.object({
				from: z.string().describe("Source document filename"),
				to: z.string().describe("Target document filename"),
				type: z
					.string()
					.describe(
						"Relationship type (free-form label, e.g., 'mengubah', 'mencabut', 'melengkapi')",
					),
			}),
		)
		.describe("Array of relationship definitions between documents"),
});

type DocumentRelationGraphInput = z.infer<typeof documentRelationGraphSchema>;

/**
 * Sanitize document name by removing HTML tags and special characters
 * that could break Mermaid syntax
 */
function sanitizeDocumentName(filename: string): string {
	return (
		filename
			// Remove all HTML tags (including <br>, <em>, etc.)
			.replace(/<[^>]*>/g, "")
			// Decode common HTML entities
			.replace(/&nbsp;/g, " ")
			.replace(/&quot;/g, '"')
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			// Remove file extension
			.replace(/\.[^/.]+$/, "")
			// Remove or replace characters that break Mermaid
			.replace(/[[\](){}|<>]/g, "")
			// Replace quotes with single quotes
			.replace(/"/g, "'")
			// Normalize whitespace
			.replace(/\s+/g, " ")
			// Trim whitespace
			.trim()
	);
}

/**
 * Create a safe node ID for Mermaid by removing all special characters
 */
function createNodeId(filename: string): string {
	return filename
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/[^a-zA-Z0-9]/g, "_") // Replace special chars with underscore
		.replace(/_+/g, "_") // Replace multiple underscores with single
		.replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

/**
 * Generate Mermaid graph syntax from documents and relationships
 */
function generateMermaidGraph(
	documents: string[],
	relationships: DocumentRelationGraphInput["relationships"],
): string {
	const lines: string[] = ["graph TD"];

	// Create a map of filename to sanitized label
	const nodeLabels = new Map<string, string>();
	const nodeIds = new Map<string, string>();

	for (const doc of documents) {
		const nodeId = createNodeId(doc);
		const label = sanitizeDocumentName(doc);
		nodeLabels.set(doc, label);
		nodeIds.set(doc, nodeId);
	}

	// Add relationships as edges
	if (relationships.length > 0) {
		for (const rel of relationships) {
			const fromId = nodeIds.get(rel.from);
			const toId = nodeIds.get(rel.to);
			const fromLabel = nodeLabels.get(rel.from);
			const toLabel = nodeLabels.get(rel.to);

			if (fromId && toId && fromLabel && toLabel) {
				// Sanitize relationship type - remove HTML and special chars
				const relType = rel.type
					.replace(/<[^>]*>/g, "") // Remove HTML tags
					.replace(/&nbsp;/g, " ") // Decode entities
					.replace(/[[\](){}|<>"]/g, "") // Remove special chars
					.replace(/\s+/g, " ") // Normalize whitespace
					.trim();
				lines.push(
					`    ${fromId}["${fromLabel}"] -->|${relType}| ${toId}["${toLabel}"]`,
				);
			}
		}
	} else {
		// If no relationships, just list the documents as separate nodes
		for (const doc of documents) {
			const nodeId = nodeIds.get(doc);
			const label = nodeLabels.get(doc);
			if (nodeId && label) {
				lines.push(`    ${nodeId}["${label}"]`);
			}
		}
	}

	return lines.join("\n");
}

export const documentRelationGraph = tool({
	description:
		"Generate a visual relationship graph between documents in Mermaid format. Returns Mermaid diagram code showing documents as nodes and relationships as edges. Use this when users ask to visualize document relationships, dependencies, or connections.",
	inputSchema: documentRelationGraphSchema,
	execute: async ({ documents, relationships }) => {
		// Validate that all relationship references exist in documents array
		const documentSet = new Set(documents);
		const invalidReferences = relationships.filter(
			(rel) => !documentSet.has(rel.from) || !documentSet.has(rel.to),
		);

		if (invalidReferences.length > 0) {
			throw new Error(
				`Invalid document references in relationships: ${invalidReferences
					.map((r) => `${r.from} -> ${r.to}`)
					.join(", ")}`,
			);
		}

		// Generate Mermaid diagram
		const mermaidCode = generateMermaidGraph(documents, relationships);

		return {
			mermaid: mermaidCode,
			metadata: {
				documentCount: documents.length,
				relationshipCount: relationships.length,
				format: "mermaid",
			},
		};
	},
});
