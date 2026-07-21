import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GamesLayout({ children }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
        
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to arcade
          </Link>

          <span className="text-muted-foreground text-sm font-medium">AkiraChix Games</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}



// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function GamesLayout({ children }) {
//   return (
//     <div className="flex min-h-full flex-col">
//       <header className="border-b">
//         <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
        
//           <Button asChild variant="ghost" size="sm">
//             <Link
//             href="/"
//             className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
//           >
//             <ArrowLeft className="size-4" />
//             Back to arcade
//           </Link>
//           </Button>

//           <span className="text-muted-foreground text-sm font-medium">AkiraChix Games</span>
//         </div>
//       </header>
//       <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
//     </div>
//   );
// }



