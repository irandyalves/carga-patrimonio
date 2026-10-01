import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { parseCleanNumber } from '../utils/formatters';

// Dicionário Semântico de Campos do Sistema com Sinônimos e Variações
export const DB_FIELDS = [
  {
    key: 'numeroPatrimonio',
    label: 'Nº Patrimônio',
    required: true,
    synonyms: [
      'patrimonio', 'patrimônio', 'tombo', 'tombamento', 'nº patrimonio', 'nº patrimônio',
      'numero patrimonio', 'numero patrimônio', 'n_patrimonio', 'n_patrimônio', 'num_patrimonio',
      'codigo', 'código', 'id', 'cod', 'etiqueta', 'plaqueta', 'nº tombo', 'num tombo', 'tag'
    ]
  },
  {
    key: 'quantidade',
    label: 'Quantidade',
    required: false,
    synonyms: [
      'quantidade', 'qtde', 'qtd', 'unidades', 'unidade', 'quant', 'quant.', 'qty', 'num itens'
    ]
  },
  {
    key: 'descricao',
    label: 'Item / Descrição',
    required: true,
    synonyms: [
      'item', 'descricao', 'descrição', 'especificacao', 'especificação', 'bem', 'objeto',
      'descricao do bem', 'descrição do bem', 'denominacao', 'denominação', 'nome', 'produto',
      'material', 'descricao do item', 'desc'
    ]
  },
  {
    key: 'marca',
    label: 'Marca',
    required: false,
    synonyms: [
      'marca', 'fabricante', 'brand', 'marca/fabricante', 'fabric', 'fabr', 'manufaturador'
    ]
  },
  {
    key: 'modelo',
    label: 'Modelo',
    required: false,
    synonyms: [
      'modelo', 'model', 'tipo/modelo', 'tipo', 'versao', 'versão', 'referencia', 'referência'
    ]
  },
  {
    key: 'setorNome',
    label: 'Setor / Área',
    required: false,
    synonyms: [
      'setor', 'área', 'area', 'departamento', 'dep', 'depto', 'unidade', 'orgao', 'órgão',
      'divisao', 'divisão', 'lotacao', 'lotação', 'centro de custo', 'unidade gestora'
    ]
  },
  {
    key: 'localizacao',
    label: 'Localização',
    required: false,
    synonyms: [
      'localizacao', 'localização', 'local', 'sala', 'bloco', 'ambiente', 'local físico',
      'localizacao fisica', 'posto', 'posicao', 'posiçao', 'posição'
    ]
  },
  {
    key: 'observacao',
    label: 'Observação',
    required: false,
    synonyms: [
      'observacao', 'observação', 'observacoes', 'observações', 'obs', 'obs.', 'detalhes',
      'situacao', 'situação', 'estado', 'complemento', 'comentario', 'comentário', 'nota'
    ]
  },
  {
    key: 'responsavel',
    label: 'Responsável',
    required: false,
    synonyms: [
      'responsavel', 'responsável', 'detentor', 'usuario', 'usuário', 'custodiante',
      'servidor', 'nome responsavel', 'responsavel pelo setor', 'responsavel bem'
    ]
  },
  {
    key: 'dataAquisicao',
    label: 'Data de Aquisição',
    required: false,
    synonyms: [
      'aquisicao', 'aquisição', 'data aquisicao', 'data aquisição', 'data de aquisicao',
      'data de aquisição', 'dt_aquisicao', 'data', 'ano', 'ano aquisicao', 'dt aquisicao'
    ]
  },
  {
    key: 'valorOriginal',
    label: 'Valor Original (R$)',
    required: false,
    synonyms: [
      'valor original', 'valor de aquisicao', 'valor de aquisição', 'valor', 'preco', 'preço',
      'custo', 'vlr original', 'vl_original', 'vlr_aquisicao', 'vlr_original_bruto', 'valor histórico'
    ]
  },
  {
    key: 'valorAtual',
    label: 'Valor Atual (R$)',
    required: false,
    synonyms: [
      'valor atual', 'valor residual', 'valor liquido', 'valor líquido', 'vlr atual',
      'vl_atual', 'valor presente', 'valor contabil', 'valor contábil', 'liquido'
    ]
  },
  {
    key: 'depreciacao',
    label: 'Depreciação',
    required: false,
    synonyms: [
      'depreciacao', 'depreciação', 'deprec', 'taxa depreciacao', 'taxa de depreciacao',
      'valor depreciacao', 'depreciacao acumulada', 'depr', 'depr.', 'deprec acumulada'
    ]
  },
  {
    key: 'numeroSerie',
    label: 'Nº de Série',
    required: false,
    synonyms: [
      'serie', 'série', 'numero de serie', 'número de série', 'nº serie', 'nº série',
      'serial', 'sn', 's/n', 'serial number'
    ]
  }
];

// Normaliza string para comparação sem acento e caracteres especiais
const normalizeHeader = (str = '') => {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
};

// Mapeador Inteligente de Cabeçalhos
export const autoMatchColumns = (detectedHeaders = []) => {
  const mapping = {};

  detectedHeaders.forEach((header) => {
    const norm = normalizeHeader(header);
    if (!norm) {
      mapping[header] = { targetField: null, isAccepted: false, confidence: 0 };
      return;
    }

    let bestMatch = null;
    let highestConfidence = 0;

    for (const field of DB_FIELDS) {
      const fieldNorm = normalizeHeader(field.label);
      const keyNorm = normalizeHeader(field.key);

      // Match exato com label ou key
      if (norm === fieldNorm || norm === keyNorm) {
        bestMatch = field.key;
        highestConfidence = 100;
        break;
      }

      // Match exato com algum sinônimo
      for (const syn of field.synonyms) {
        const synNorm = normalizeHeader(syn);
        if (norm === synNorm) {
          bestMatch = field.key;
          highestConfidence = 95;
          break;
        }
        if (norm.includes(synNorm) || synNorm.includes(norm)) {
          if (highestConfidence < 75) {
            bestMatch = field.key;
            highestConfidence = 75;
          }
        }
      }
    }

    mapping[header] = {
      targetField: bestMatch,
      isAccepted: highestConfidence >= 70,
      confidence: highestConfidence
    };
  });

  return mapping;
};

// 1. Parser Excel (.xlsx, .xls)
export const parseExcelFile = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Planilha vazia ou sem dados legíveis.');
  }

  // Localiza a primeira linha com cabeçalhos reais (evita linhas de título em branco no topo)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, rawRows.length); i++) {
    const row = rawRows[i];
    const filledCols = (row || []).filter(c => String(c).trim().length > 0);
    if (filledCols.length >= 2) {
      headerIndex = i;
      break;
    }
  }

  const headers = (rawRows[headerIndex] || []).map((h, i) => String(h || '').trim() || `Coluna_${i + 1}`);
  const dataRows = [];

  for (let i = headerIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.every(cell => String(cell).trim() === '')) continue;
    const rowObj = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
    });
    dataRows.push(rowObj);
  }

  return { headers, rows: dataRows, totalRows: dataRows.length, fileType: 'excel' };
};

// 2. Parser CSV (.csv)
export const parseCsvFile = async (file) => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Arquivo CSV vazio.');
  }

  // Detecta delimitador (, ; \t |)
  const firstLine = lines[0];
  const delimiters = [';', '\t', ',', '|'];
  let bestDelim = ',';
  let maxCount = 0;

  delimiters.forEach(delim => {
    const count = (firstLine.match(new RegExp(`\\${delim}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelim = delim;
    }
  });

  const parseLine = (line) => {
    // Regex para respeitar campos com aspas
    const regex = new RegExp(`(?:^|${bestDelim === '\t' ? '\\t' : `\\${bestDelim}`})(?:"([^"]*(?:""[^"]*)*)"|([^"${bestDelim === '\t' ? '\\t' : `\\${bestDelim}`}]+)|)`, 'g');
    const cols = [];
    let match;
    while ((match = regex.exec(line))) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      const val = match[1] ? match[1].replace(/""/g, '"') : (match[2] || '');
      cols.push(val.trim());
    }
    return cols;
  };

  const headers = parseLine(lines[0]).map((h, i) => h || `Coluna_${i + 1}`);
  const dataRows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseLine(lines[i]);
    if (rawCols.every(c => !c)) continue;
    const rowObj = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = rawCols[colIdx] || '';
    });
    dataRows.push(rowObj);
  }

  return { headers, rows: dataRows, totalRows: dataRows.length, fileType: 'csv' };
};

// 3. Parser TXT (.txt - delimitado ou tabular)
export const parseTxtFile = async (file) => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Arquivo TXT vazio.');
  }

  // Verifica se é delimitado por tabulação, ponto e vírgula, barra vertical ou vírgula
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';
  else if (firstLine.includes(',')) delimiter = ',';
  else delimiter = /\s{2,}/; // múltiplos espaços

  const splitCols = (line) => {
    if (typeof delimiter === 'string') {
      return line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    }
    return line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
  };

  const headers = splitCols(lines[0]).map((h, i) => h || `Coluna_${i + 1}`);
  const dataRows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCols(lines[i]);
    if (cols.every(c => !c)) continue;
    const rowObj = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = cols[colIdx] || '';
    });
    dataRows.push(rowObj);
  }

  return { headers, rows: dataRows, totalRows: dataRows.length, fileType: 'txt' };
};

// 4. Parser Word (.docx com tabelas ou listas estruturadas)
export const parseWordDocxFile = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extrai HTML para ler tabelas de documentos Word com 100% de integridade
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const table = doc.querySelector('table');

  if (table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) throw new Error('Tabela vazia no documento Word.');

    const firstRowCells = Array.from(rows[0].querySelectorAll('th, td')).map(c => c.textContent.trim());
    const headers = firstRowCells.map((h, i) => h || `Coluna_${i + 1}`);
    const dataRows = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td')).map(c => c.textContent.trim());
      if (cells.every(c => !c)) continue;
      const rowObj = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = cells[colIdx] || '';
      });
      dataRows.push(rowObj);
    }

    return { headers, rows: dataRows, totalRows: dataRows.length, fileType: 'word' };
  }

  // Se não houver tag <table>, tenta extrair linhas de texto estruturadas
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Nenhuma tabela ou lista de patrimônios encontrada no documento Word.');
  }

  // Tenta quebrar por tabulação ou múltiplos espaços
  const splitLine = (l) => l.split(/\t| {2,}|;|\|/).map(c => c.trim()).filter(Boolean);
  const headers = splitLine(lines[0]).map((h, i) => h || `Coluna_${i + 1}`);
  const dataRows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (!cols.length) continue;
    const rowObj = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = cols[colIdx] || '';
    });
    dataRows.push(rowObj);
  }

  return { headers, rows: dataRows, totalRows: dataRows.length, fileType: 'word' };
};

// Parser mestre universal que detecta a extensão e chama o parser correto
export const parseAnyDocumentFile = async (file) => {
  const name = file.name.toLowerCase();

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseExcelFile(file);
  }
  if (name.endsWith('.csv')) {
    return parseCsvFile(file);
  }
  if (name.endsWith('.docx')) {
    return parseWordDocxFile(file);
  }
  if (name.endsWith('.txt')) {
    return parseTxtFile(file);
  }

  // Fallback para Excel
  return parseExcelFile(file);
};

// Conversor final das linhas brutas para o schema de Assets do sistema
export const buildFinalAssetsFromImport = ({
  rawRows = [],
  columnMapping = {},
  targetSector = null,
  allSectors = []
}) => {
  const timestamp = Date.now();

  return rawRows.map((row, index) => {
    const itemData = {};

    // Mapeia colunas aceitas
    Object.entries(columnMapping).forEach(([sourceCol, config]) => {
      if (config.isAccepted && config.targetField) {
        const rawVal = row[sourceCol];
        itemData[config.targetField] = rawVal !== undefined ? String(rawVal).trim() : '';
      }
    });

    // Trata valores numéricos e patrimônio
    const rawPatrimonio = itemData.numeroPatrimonio || `IMP-${timestamp.toString().slice(-4)}-${index + 1}`;
    const cleanNum = rawPatrimonio.replace(/\s+/g, ' ');
    const qtdeNum = parseInt(itemData.quantidade || '1', 10);
    const vOrigNum = parseCleanNumber(itemData.valorOriginal);
    const vAtualNum = itemData.valorAtual !== undefined && itemData.valorAtual !== ''
      ? parseCleanNumber(itemData.valorAtual)
      : (vOrigNum > 0 ? vOrigNum : 0);

    // Trata Depreciação: se for número/float, arredonda para 2 casas de centavos
    let cleanDepreciacao = itemData.depreciacao || '';
    if (cleanDepreciacao && !String(cleanDepreciacao).endsWith('%')) {
      const parsedDep = parseCleanNumber(cleanDepreciacao);
      if (parsedDep > 0) {
        cleanDepreciacao = parsedDep;
      }
    }

    // Setor: Usa o setor escolhido antes de tudo, ou tenta achar pelo nome do setor na planilha
    let resolvedSectorId = targetSector ? targetSector.id : 'sec-foyer';
    let resolvedSectorName = targetSector ? targetSector.name : 'Foyer';
    let resolvedResponsavel = targetSector ? targetSector.responsavel : (itemData.responsavel || '');

    if (!targetSector && itemData.setorNome) {
      const matchSec = allSectors.find(s => 
        s.name.toLowerCase().trim() === itemData.setorNome.toLowerCase().trim() ||
        itemData.setorNome.toLowerCase().includes(s.name.toLowerCase())
      );
      if (matchSec) {
        resolvedSectorId = matchSec.id;
        resolvedSectorName = matchSec.name;
        resolvedResponsavel = matchSec.responsavel || itemData.responsavel || '';
      } else {
        resolvedSectorName = itemData.setorNome;
      }
    }

    return {
      id: `pat-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      numeroPatrimonio: cleanNum,
      quantidade: isNaN(qtdeNum) || qtdeNum <= 0 ? 1 : qtdeNum,
      descricao: itemData.descricao || 'Item Importado',
      marca: itemData.marca || '',
      modelo: itemData.modelo || '',
      depreciacao: cleanDepreciacao,
      setorId: resolvedSectorId,
      setorNome: resolvedSectorName,
      localizacao: itemData.localizacao || '',
      observacao: itemData.observacao || '',
      responsavel: resolvedResponsavel,
      dataAquisicao: itemData.dataAquisicao || '',
      anoAquisicao: itemData.dataAquisicao ? parseInt(itemData.dataAquisicao.slice(-4), 10) || null : null,
      valorOriginal: vOrigNum,
      valorAtual: vAtualNum,
      numeroSerie: itemData.numeroSerie || '',
      status: 'ATIVO',
      baixado: false,
      conferidoEm: null,
      conferidoPor: null,
      cautelaAtual: null,
      historico: [
        {
          data: new Date().toLocaleString('pt-BR'),
          acao: 'Importado via Importador Inteligente',
          usuario: 'Importação'
        }
      ]
    };
  });
};
