import * as XLSX from 'xlsx';

export const exportAssetsToExcel = (assets, filename = 'patrimonios_export.xlsx') => {
  if (!assets || !assets.length) {
    assets = [];
  }

  const data = assets.map(item => {
    const isConferido = item.status === 'CONFERIDO' || Boolean(item.conferidoEm) || Boolean(item.conferido);
    const dataConferido = item.conferidoEm
      ? (typeof item.conferidoEm === 'string' && item.conferidoEm.includes('T')
          ? new Date(item.conferidoEm).toLocaleString('pt-BR')
          : String(item.conferidoEm))
      : '';

    return {
      'PATRIMÔNIO': item.numeroPatrimonio || '',
      'ITEM': item.descricao || '',
      'MARCA': item.marca || '',
      'MODELO': item.modelo || '',
      'LOCALIZAÇÃO': item.localizacao || '',
      'OBS': item.observacao || item.observacoes || item.obs || '',
      'CONFERIDO': isConferido ? 'SIM' : 'NÃO',
      'SETOR': item.setorNome || '',
      'QUANTIDADE': item.quantidade || 1,
      'VALOR ORIGINAL (R$)': item.valorOriginal !== undefined && item.valorOriginal !== null ? item.valorOriginal : 0,
      'VALOR ATUAL (R$)': item.valorAtual !== undefined && item.valorAtual !== null ? item.valorAtual : (item.valorOriginal || 0),
      'STATUS': item.status || (item.baixado ? 'BAIXADO' : 'ATIVO'),
      'CONFERIDO EM': dataConferido,
      'CONFERIDO POR': item.conferidoPor || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário de Patrimônio');

  // Modern auto-fit column widths with minimum comfortable spacing
  if (data.length > 0) {
    const minWidths = {
      'PATRIMÔNIO': 16,
      'ITEM': 36,
      'MARCA': 18,
      'MODELO': 18,
      'LOCALIZAÇÃO': 22,
      'OBS': 25,
      'CONFERIDO': 14,
      'SETOR': 20,
      'QUANTIDADE': 12,
      'VALOR ORIGINAL (R$)': 18,
      'VALOR ATUAL (R$)': 16,
      'STATUS': 14,
      'CONFERIDO EM': 20,
      'CONFERIDO POR': 20
    };

    const keys = Object.keys(data[0]);
    worksheet['!cols'] = keys.map(key => {
      const calculatedMax = Math.max(
        key.length,
        ...data.map(d => {
          const val = d[key];
          return val !== null && val !== undefined ? String(val).length : 0;
        })
      );
      const defaultMin = minWidths[key] || 15;
      return {
        wch: Math.min(Math.max(calculatedMax + 3, defaultMin), 60)
      };
    });

    // Add autofilter for all columns
    if (worksheet['!ref']) {
      worksheet['!autofilter'] = { ref: worksheet['!ref'] };
    }
  }

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
          const num = row['PATRIMÔNIO'] || row['PATRIMONIO'] || row['Número Patrimônio'] || row['Numero'] || row['Patrimonio'] || row['Tombamento'] || `4254${index}`;
          const desc = row['ITEM'] || row['Descrição'] || row['Descricao'] || row['Nome'] || 'Item sem descrição';
          const marca = row['MARCA'] || row['Marca'] || row['Fabricante'] || '';
          const modelo = row['MODELO'] || row['Modelo'] || '';
          const local = row['LOCALIZAÇÃO'] || row['LOCALIZACAO'] || row['Localização'] || row['Localizacao'] || row['Sala'] || '';
          const obs = row['OBS'] || row['OBSERVAÇÃO'] || row['OBSERVACOES'] || row['Observação'] || row['Observacao'] || row['Observações'] || '';
          const conferidoStr = String(row['CONFERIDO'] || row['Conferido'] || '').trim().toUpperCase();
          const isConferido = conferidoStr === 'SIM' || conferidoStr === 'S' || conferidoStr === 'TRUE' || conferidoStr === '1';

          const qtde = parseInt(row['QUANTIDADE'] || row['Quantidade'] || row['Qtde'] || row['Qtd'] || 1, 10);
          const setor = row['SETOR'] || row['Setor'] || row['Setor Responsável'] || 'Geral';
          const resp = row['Responsável'] || row['Responsavel'] || '';
          const dataAq = row['Data de Aquisição'] || row['Data'] || '';
          const ano = parseInt(row['Ano'] || row['Ano de Aquisição'] || new Date().getFullYear(), 10);
          const vOrig = parseFloat(row['VALOR ORIGINAL (R$)'] || row['Valor Original'] || row['Valor Original (R$)'] || row['Valor'] || 0);
          const vAtual = parseFloat(row['VALOR ATUAL (R$)'] || row['Valor Atual'] || row['Valor Atual (R$)'] || vOrig || 0);

          return {
            id: `import-${Date.now()}-${index}`,
            numeroPatrimonio: String(num).trim(),
            quantidade: isNaN(qtde) ? 1 : qtde,
            descricao: String(desc).trim(),
            marca: String(marca).trim(),
            modelo: String(modelo).trim(),
            observacoes: String(obs).trim(),
            categoria: row['Categoria'] || 'Outros Bens Permanentes',
            setorNome: setor,
            setorId: 'sec-foyer',
            localizacao: local,
            responsavel: resp,
            dataAquisicao: dataAq || `${ano}`,
            anoAquisicao: isNaN(ano) ? new Date().getFullYear() : ano,
            valorOriginal: isNaN(vOrig) ? 0 : vOrig,
            valorAtual: isNaN(vAtual) ? 0 : vAtual,
            status: isConferido ? 'CONFERIDO' : (row['STATUS'] || 'ATIVO'),
            baixado: false,
            conferidoEm: isConferido ? new Date().toISOString() : null,
            conferidoPor: isConferido ? 'Importação Excel' : null,
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
