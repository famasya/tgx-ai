import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex flex-col h-full max-w-4xl w-full mx-auto p-4 space-y-2">
			<h1 className="text-2xl font-bold">Tentang Telo AI</h1>
			<p className="mt-4">
				Telo AI adalah asisten pencarian peraturan daerah berbasis kecerdasan
				buatan yang dirancang untuk membantu masyarakat menemukan informasi
				peraturan daerah Kabupaten Trenggalek dengan cepat.
			</p>
			<p className="mt-2">
				Dengan menggunakan teknologi{" "}
				<em>
					<a
						href="https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
						target="_blank"
						rel="noopener noreferrer"
					>
						Retrieval Augmented Generation (RAG)
					</a>
				</em>{" "}
				untuk menganalisis dan mengindeks peraturan daerah, Telo AI dapat
				memberikan hasil pencarian yang lebih relevan dan akurat.
			</p>
			<p className="mt-2">
				Proyek ini memiliki kode sumber terbuka (<em>open source</em>) dan dapat
				diakses oleh siapa saja untuk meningkatkan akses informasi peraturan
				daerah secara transparan dan efisien.
			</p>

			<div className="mt-2 text-red-600 bg-red-50 p-3 rounded-lg">
				<h3 className="font-semibold">Penting:</h3>
				<ol className="list-decimal list-outside ml-2 space-y-1 pl-3">
					<li>
						Dilarang mengklaim bahwa Telo-AI merupakan karya individu atau
						organisasi tertentu karena proyek ini bersifat open source dan
						dikembangkan secara kolaboratif.
					</li>
					<li>
						Informasi yang dihasilkan oleh Telo AI bersifat asistif dan tidak
						menggantikan penafsiran hukum oleh ahli hukum atau lembaga yang
						berwenang.
					</li>
				</ol>
			</div>

			<div className="mt-4">
				<Button asChild variant={"outline"}>
					<a
						href="https://github.com/famasya/telo-ai"
						target="_blank"
						rel="noopener noreferrer"
					>
						Kode sumber (source code)
					</a>
				</Button>
			</div>
		</main>
	);
}
