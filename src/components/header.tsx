import {
	AiFileIcon,
	Document,
	HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function Header() {
	return (
		<header className="flex-shrink-0 bg-gradient-to-b from-zinc-100 to-white px-4 py-2">
			<div className="flex items-center justify-between">
				<Link
					to="/"
					className="flex flex-row items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 px-2 py-1 rounded-lg transition-colors"
				>
					<HugeiconsIcon
						icon={AiFileIcon}
						className="text-sky-600"
						strokeWidth={2}
					/>
					<div className="ml-2">
						<h1 className="font-semibold text-sm text-zinc-900">Telo AI</h1>
						<p className="text-xs">
							Asisten pencarian peraturan daerah JDIH Trenggalek
						</p>
					</div>
				</Link>

				<div className="text-xs text-zinc-500 flex gap-2">
					<Button
						variant={"outline"}
						size={"sm"}
						className="rounded-full"
						asChild
					>
						<Link to="/docs">
							<HugeiconsIcon icon={Document} />
							Dokumen
						</Link>
					</Button>
					<Button
						variant={"outline"}
						size={"sm"}
						className="rounded-full"
						asChild
					>
						<Link to="/about">
							<HugeiconsIcon icon={HelpCircleIcon} />
							Tentang
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
