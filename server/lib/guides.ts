import fs from "fs";
import path from "path";
import { tokenize } from "./text";

// Carrier profile guides dropped on the box as flat JSON under
// carrier-assets/<carrier>/profile-guide.json. This is deliberately file-backed
// rather than a table: an underwriter's class-code guide arrives as a spreadsheet
// export, and dropping it in a folder should make it searchable without a
// migration.

// Module-level cache so the box doesn't re-parse the JSON on every request. The
// cache is keyed by carrier-assets folder and refreshed when the file mtime
// changes (a redeploy writes new files and the process picks them up).
const guideCache = new Map<string, { carrierName: string; mtime: number; rows: any[] }>();

export function loadClassGuides(): { carrierName: string; rows: any[] }[] {
  const bases = [
    path.join(process.cwd(), "dist", "carrier-assets"),
    path.join(process.cwd(), "public", "carrier-assets"),
  ];
  const seen = new Set<string>();
  const out: { carrierName: string; rows: any[] }[] = [];
  for (const base of bases) {
    let folders: string[] = [];
    try { folders = fs.readdirSync(base); } catch { continue; }
    for (const f of folders) {
      if (seen.has(f)) continue;
      const file = path.join(base, f, "profile-guide.json");
      try { fs.accessSync(file); } catch { continue; }
      seen.add(f);
      const metaFile = path.join(base, f, "meta.json");
      let carrierName = f;
      try { carrierName = JSON.parse(fs.readFileSync(metaFile, "utf8")).carrierName || f; } catch {}
      let mtime = 0;
      try { mtime = fs.statSync(file).mtimeMs; } catch {}
      const cached = guideCache.get(f);
      let rows: any[];
      if (cached && cached.mtime === mtime && cached.carrierName === carrierName) {
        rows = cached.rows;
      } else {
        try { rows = JSON.parse(fs.readFileSync(file, "utf8")); guideCache.set(f, { carrierName, mtime, rows }); }
        catch { rows = []; }
      }
      out.push({ carrierName, rows });
    }
  }
  return out;
}

export function searchClassGuides(
  guides: { carrierName: string; rows: any[] }[], query: string, limit = 15,
) {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const scored: any[] = [];
  for (const g of guides) {
    for (const r of g.rows) {
      const hay = `${r.class_description} ${r.industry_group} ${r.small_business_appetite} ${r.sic} ${r.cna_connect_class_code}`.toLowerCase();
      let score = 0;
      for (const t of terms) if (hay.includes(t)) score += 1;
      if (score > 0) scored.push({ score, carrierName: g.carrierName, ...r });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function formatClassRows(rows: any[]): string {
  if (!rows.length) return "none matched";
  return rows
    .map(
      (r) =>
        `${r.carrierName} | SIC ${r.sic} | class ${r.cna_connect_class_code} | ${r.industry_group} | ${r.class_description}\n   appetite: ${r.small_business_appetite}\n   products: ${r.products_available}\n   territory: ${r.territorial_restrictions}`,
    )
    .join("\n");
}
