import * as XLSX from 'xlsx';

export const exportAssetsToExcel = (assets, filename = 'patrimonios_export.xlsx') => {
  const data = assets.map(item => ({
    'Número Patrimônio': item.numeroPatrimonio,
    'Descrição': item.descricao,
    'Categoria': item.categoria || '',
    'Setor': item.setorNome || '',
    'Localização Detalhada': item.localizacao || '',
    'Responsável': item.responsavel || '',
    'Ano de Aquisição': item.anoAquisicao || '',
    'Valor Original (R$)': item.valorOriginal || 0,
    'Valor Atual (R$)': item.valorAtual || item.valorOriginal || 0,
    'Status': item.status || 'ATIVO',
    'Baixado': item.baixado ? 'SIM' : 'NÃO',
    'Conferido Em': item.conferidoEm || '',
    'Conferido Por': item.conferidoPor || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patrimônios');

  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {});
  worksheet['!cols'] = maxProps.map(key => ({
    wch: Math.max(key.length, ...data.map(d => String(d[key] || '').length)) + 2
  }));

  XLSX.writeFile(workbook, filename);
};

export const importAssetsFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        const mappedAssets = rawJson.map((row, index) => {
          const num = row['Número Patrimônio'] || row['Numero'] || row['Patrimonio'] || row['Tombamento'] || `PAT-${1000 + index}`;
          const desc = row['Descrição'] || row['Descricao'] || row['Nome'] || 'Item sem descrição';
          const setor = row['Setor'] || row['Setor Responsável'] || 'Geral';
          const local = row['Localização'] || row['Localizacao'] || row['Sala'] || '';
          const resp = row['Responsável'] || row['Responsavel'] || '';
          const ano = parseInt(row['Ano'] || row['Ano de Aquisição'] || new Date().getFullYear(), 10);
          const vOrig = parseFloat(row['Valor Original'] || row['Valor Original (R$)'] || row['Valor'] || 0);
          const vAtual = parseFloat(row['Valor Atual'] || row['Valor Atual (R$)'] || vOrig || 0);

          return {
            id: `import-${Date.now()}-${index}`,
            numeroPatrimonio: String(num).trim(),
            descricao: String(desc).trim(),
            categoria: row['Categoria'] || 'Outros Bens Permanentes',
            setorNome: setor,
            setorId: 'sec-ti', // default or mapped
            localizacao: local,
            responsavel: resp,
            anoAquisicao: isNaN(ano) ? new Date().getFullYear() : ano,
            valorOriginal: isNaN(vOrig) ? 0 : vOrig,
            valorAtual: isNaN(vAtual) ? 0 : vAtual,
            status: 'ATIVO',
            baixado: false,
            conferidoEm: null,
            conferidoPor: null,
            cautelaAtual: null,
            historico: [
              { data: new Date().toLocaleString('pt-BR'), acao: 'Importado via planilha Excel', usuario: 'Importador XLSX' }
            ]
          };
        });

        resolve(mappedAssets);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
