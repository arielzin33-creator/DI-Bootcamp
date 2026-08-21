import type { DiffLine } from "@storyapp/types";

/**
 * A git-style unified diff.
 *
 * Colour is not the only signal -- each line also carries a +/-/space marker, so the
 * diff is still readable to someone who cannot distinguish red from green.
 */
export default function DiffView({
  diff,
  stats,
}: {
  diff: DiffLine[];
  stats?: { added: number; removed: number };
}) {
  return (
    <div className="border border-base-300 rounded-box overflow-hidden">
      {stats && (
        <div className="flex gap-3 px-3 py-2 bg-base-300 text-xs font-mono">
          <span className="text-success">+{stats.added}</span>
          <span className="text-error">-{stats.removed}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="font-mono text-xs w-full">
          <tbody>
            {diff.map((line, index) => {
              const marker = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
              const rowClass =
                line.type === "added"
                  ? "bg-success/15"
                  : line.type === "removed"
                    ? "bg-error/15"
                    : "";

              return (
                // Index is a safe key here: the list is static once rendered and is
                // never reordered or filtered.
                <tr key={index} className={rowClass}>
                  <td className="select-none opacity-40 px-2 text-right w-10">
                    {line.oldLine ?? ""}
                  </td>
                  <td className="select-none opacity-40 px-2 text-right w-10">
                    {line.newLine ?? ""}
                  </td>
                  <td className="select-none px-1 w-4 opacity-70">{marker}</td>
                  <td className="px-2 whitespace-pre-wrap break-words">{line.text || " "}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
