import * as XLSX from 'xlsx';

export const exportAssetsToExcel = (assets, filename = 'patrimonios_export.xlsx') => {
  const data = assets.map(item => ({
    'Número Patrimônio': item.numeroPatrimonio,
    'Quantidade': item.quantidade || 1,
    'Descrição': item.descricao,
    'Categoria': item.categoria || '',
    'Setor': item.setorNome || '',
    'Localização Detalhada': item.localizacao || '',
    'Responsável': item.responsavel || '',
    'Data de Aquisição': item.dataAquisicao || '',
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
          const num = row['Número Patrimônio'] || row['Numero'] || row['Patrimonio'] || row['Tombamento'] || `4254${index}`;
          const qtde = parseInt(row['Quantidade'] || row['Qtde'] || row['Qtd'] || 1, 10);
          const desc = row['Descrição'] || row['Descricao'] || row['Nome'] || 'Item sem descrição';
          const setor = row['Setor'] || row['Setor Responsável'] || 'Geral';
          const local = row['Localização'] || row['Localizacao'] || row['Sala'] || '';
          const resp = row['Responsável'] || row['Responsavel'] || '';
          const dataAq = row['Data de Aquisição'] || row['Data'] || '';
          const ano = parseInt(row['Ano'] || row['Ano de Aquisição'] || new Date().getFullYear(), 10);
          const vOrig = parseFloat(row['Valor Original'] || row['Valor Original (R$)'] || row['Valor'] || 0);
          const vAtual = parseFloat(row['Valor Atual'] || row['Valor Atual (R$)'] || vOrig || 0);

          return {
            id: `import-${Date.now()}-${index}`,
            numeroPatrimonio: String(num).trim(),
            quantidade: isNaN(qtde) ? 1 : qtde,
            descricao: String(desc).trim(),
            categoria: row['Categoria'] || 'Outros Bens Permanentes',
            setorNome: setor,
            setorId: 'sec-foyer', // default or mapped
            localizacao: local,
            responsavel: resp,
            dataAquisicao: dataAq || `${ano}`,
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
