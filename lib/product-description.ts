export interface ProductDescriptionInput {
  title?: string | null;
  material?: string | null;
  productType?: string | null;
  usage?: string | null;
}

function lower(value?: string | null): string {
  return (value || '').toLocaleLowerCase('tr-TR');
}

export function buildDefaultProductDescription(input: ProductDescriptionInput): string {
  const material = lower(input.material);
  const productType = lower(input.productType);
  const title = lower(input.title);
  const usage = lower(input.usage);

  const targetArea = usage.includes('dekor')
    ? 'ya\u015fam alan\u0131n\u0131za'
    : 'sofran\u0131za';

  const sentences: string[] = [
    `El i\u015f\u00e7ili\u011fiyle haz\u0131rlanan bu \u00f6zel par\u00e7a, ${targetArea} l\u00fcks ve zamans\u0131z bir dokunu\u015f katar.`,
  ];

  if (material.includes('cam') || material.includes('akrilik')) {
    sentences.push('Nemli bezle temizleyiniz.');
  }

  if (material.includes('porselen')) {
    sentences.push('Bula\u015f\u0131k makinesine uygundur.');
  }

  if (productType.includes('mumluk') || title.includes('mumluk')) {
    sentences.push('Mumlar bittikten sonra fincan olarak kullan\u0131labilir.');
  }

  return sentences.join(' ');
}
