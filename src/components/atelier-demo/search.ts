export interface CatalogNode {
  /** Category path in the picker, such as `GameObject/Set Active`. */
  path: string;
  title: string;
}

export function catalogNode(path: string): CatalogNode {
  return { path, title: path.split("/").at(-1) ?? path };
}

/**
 * The picker's search, as Atelier's: every word of the query must appear in the node's title, in
 * any order, and the results are sorted by title. Atelier also matches each node's keywords,
 * which the catalog does not carry.
 */
export function searchNodes(paths: readonly string[], query: string): CatalogNode[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return paths
    .map(catalogNode)
    .filter((node) => words.every((word) => node.title.toLowerCase().includes(word)))
    .sort((a, b) => a.title.localeCompare(b.title));
}
