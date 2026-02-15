type SortableProduct = {
  id: string;
  collection?: string | null;
  productType?: string | null;
  title?: string | null;
  subtitle?: string | null;
};

const COLLECTION_RANK: Record<string, number> = {
  aslan: 0,
  ottoman: 1,
};

function normalize(value?: string | null): string {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

function getCollectionRank(collection?: string | null): number {
  const key = normalize(collection);
  return key in COLLECTION_RANK ? COLLECTION_RANK[key] : 99;
}

function getTypeRank(productType?: string | null): number {
  const type = normalize(productType);

  if (type.includes('tabak')) return 0;
  if (type.includes('fincan') || type.includes('kupa')) return 1;
  if (type.includes('mumluk')) return 2;
  if (type.includes('küllük') || type.includes('kulluk') || type.includes('puro')) return 3;
  if (type.includes('tepsi') || type.includes('kutu')) return 4;
  if (type.includes('tekstil') || type.includes('yastık') || type.includes('yastik')) return 5;
  if (type.includes('aksesuar')) return 6;

  return 99;
}

export function sortProductsForCatalog<T extends SortableProduct>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const collectionRankDiff = getCollectionRank(a.collection) - getCollectionRank(b.collection);
    if (collectionRankDiff !== 0) return collectionRankDiff;

    const collectionDiff = normalize(a.collection).localeCompare(normalize(b.collection), 'tr');
    if (collectionDiff !== 0) return collectionDiff;

    const typeRankDiff = getTypeRank(a.productType) - getTypeRank(b.productType);
    if (typeRankDiff !== 0) return typeRankDiff;

    const typeDiff = normalize(a.productType).localeCompare(normalize(b.productType), 'tr');
    if (typeDiff !== 0) return typeDiff;

    const titleDiff = normalize(a.title).localeCompare(normalize(b.title), 'tr');
    if (titleDiff !== 0) return titleDiff;

    const subtitleDiff = normalize(a.subtitle).localeCompare(normalize(b.subtitle), 'tr');
    if (subtitleDiff !== 0) return subtitleDiff;

    return normalize(a.id).localeCompare(normalize(b.id), 'tr');
  });
}
