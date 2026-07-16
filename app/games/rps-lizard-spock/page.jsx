import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { issueUrl } from "@/app/games/_lib/loader";

// 🚧 PLACEHOLDER — this game hasn't been built yet.
// If you claimed "Rock Paper Scissors Lizard Spock", replace everything in this file with your game.
// See app/games/tic-tac-toe/ for a complete worked example, and CONTRIBUTING.md.
export default function RpsLizardSpockPage() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Rock Paper Scissors Lizard Spock</CardTitle>
            <Badge variant="secondary">easy</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <p className="text-foreground text-base">
            {"The five-way version of Rock Paper Scissors vs the computer."}
          </p>
          <p>🚧 This game hasn&apos;t been built yet.</p>
          <p>
            The full spec — objective, rules, required features and definition of done — lives in
            issue #56. Claim it, then replace this file with your game.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={issueUrl(56)}>Read the full spec (issue #56)</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
