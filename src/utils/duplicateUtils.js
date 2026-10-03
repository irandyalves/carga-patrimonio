/**
 * Utilitários para detecção e agrupamento de Patrimônios Duplicados
 * e identificação automática de itens de TI.
 */

// Normaliza o número de patrimônio para comparação confiável
export const normalizePatrimonioKey = (pat) => {
  if (!pat) return '';
  const clean = String(pat).trim().toUpperCase();
  
  // Ignora identificadores genéricos que não configuram duplicidade real
  if (
    clean === 'S/N' || 
    clean === 'SN' || 
    clean === 'SEM PATRIMONIO' || 
    clean === 'SEM PATRIMÔNIO' || 
    clean === 'S/NUMERO' || 
    clean === '0' || 
    clean === '-' ||
    clean === 'N/A' ||
    clean === ''
  ) {
    return '';
  }

  // Extrai dígitos para casar variações como "0045123" e "45123" ou "45.123"
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length >= 3) {
    // Remove zeros à esquerda para casar "001234" com "1234"
    const unpadded = digitsOnly.replace(/^0+/, '');
    return unpadded.length >= 2 ? unpadded : digitsOnly;
  }

  return clean;
};

// Analisa toda a lista de bens e localiza duplicidades em todos os setores
export const analyzeDuplicateAssets = (assets = [], sectors = []) => {
  const groupsByKey = new Map();

  assets.forEach(asset => {
    const key = normalizePatrimonioKey(asset.numeroPatrimonio);
    if (key) {
      if (!groupsByKey.has(key)) {
        groupsByKey.set(key, []);
      }
      groupsByKey.get(key).push(asset);
    }
  });

  const duplicateMap = new Map();
  let duplicateCount = 0;

  groupsByKey.forEach((items, key) => {
    if (items.length > 1) {
      duplicateCount += items.length;
      
      // Coleta os nomes dos setores envolvidos
      const sectorNames = items.map(it => {
        if (it.setorNome) return it.setorNome;
        const sec = sectors.find(s => s.id === it.setorId);
        return sec ? sec.name : 'Setor Indefinido';
      });
      const uniqueSectors = Array.from(new Set(sectorNames));

      items.forEach(item => {
        const otherItems = items.filter(it => it.id !== item.id);
        const itemSector = item.setorNome || sectors.find(s => s.id === item.setorId)?.name || 'Setor Indefinido';
        const otherSectors = otherItems.map(it => it.setorNome || sectors.find(s => s.id === it.setorId)?.name || 'Setor Indefinido');

        duplicateMap.set(item.id, {
          isDuplicate: true,
          key,
          totalOccurrences: items.length,
          allSectors: uniqueSectors,
          itemSector,
          otherSectors: Array.from(new Set(otherSectors)),
          conflictingAssets: otherItems
        });
      });
    }
  });

  return {
    duplicateMap,
    duplicateCount,
    hasDuplicates: duplicateCount > 0
  };
};

// Palavras-chave para detecção inteligente de equipamentos de Informática / TI
const TI_KEYWORDS = [
  'computador', 'computador desktop', 'desktop', 'notebook', 'laptop', 'macbook',
  'monitor', 'cpu', 'servidor', 'server', 'teclado', 'mouse', 'switch', 'roteador',
  'router', 'modem', 'nobreak', 'no-break', 'estabilizador', 'impressora', 'printer',
  'scanner', 'multifuncional', 'toner', 'dockstation', 'dock station', 'hub', 'hd externo',
  'ssd', 'placa de video', 'memoria ram', 'webcam', 'headset', 'fone de ouvido',
  'access point', 'ap wifi', 'firewall', 'rack', 'patch panel', 'tablet', 'ipad'
];

// Identifica se um bem pertence tipicamente à área de TI
export const isTiAsset = (asset) => {
  if (!asset) return false;
  
  // Verifica categoria
  if (asset.categoria && String(asset.categoria).toLowerCase().includes('inform')) {
    return true;
  }

  // Verifica descrição e modelo
  const textToSearch = `${asset.descricao || ''} ${asset.marca || ''} ${asset.modelo || ''} ${asset.observacoes || ''}`.toLowerCase();
  
  return TI_KEYWORDS.some(kw => textToSearch.includes(kw));
};
