import {
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import type { MyUIMessage } from "@/routes/api/chat";
import { Streamdown } from "streamdown";

interface DocumentContent {
  id: string;
  type: string;
  text: string;
}

interface DocumentResult {
  file_id: string;
  filename: string;
  score: number;
  attributes: {
    timestamp: number;
    folder: string;
    filename: string;
  };
  content: DocumentContent[];
}

interface DocumentSourcesProps {
  messages: MyUIMessage[];
}

export function DocumentSources({ messages }: DocumentSourcesProps) {
  // Extract all document search results from messages
  const documentSearchResults = messages
    .filter((message) => message.role === "assistant")
    .flatMap((message) =>
      message.parts
        .filter(
          (part) =>
            part.type === "tool-documentSearch" &&
            part.state === "output-available",
        )
        .map((part) => ({
          messageId: message.id,
          part,
        })),
    );

  if (documentSearchResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        <p className="text-sm">No document sources available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {documentSearchResults.map(({ messageId, part }, index) => (
        <div key={`${messageId}-${index.toString()}`}>
          <Sources>
            <SourcesTrigger count={part.output?.data?.length || 0} />
            {part.output?.data?.map((result: DocumentResult) => (
              <SourcesContent key={result.file_id}>
                <div className="p-4 bg-zinc-50 rounded-lg space-y-3">
                  <div className="text-sm">
                    <strong className="font-medium">Query:</strong>
                    <span className="ml-2 text-zinc-700">
                      {part.input.query}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="font-medium text-sm mb-3">
                      {result.filename}
                    </div>
                    <div className="space-y-3">
                      {result.content?.map((content: DocumentContent) => (
                        <div
                          key={content.id}
                          className="text-sm bg-white p-3 rounded prose prose-sm max-w-none"
                        >
                          <Streamdown>
                            {content.text}
                          </Streamdown>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SourcesContent>
            ))}
          </Sources>
        </div>
      ))}
    </div>
  );
}
