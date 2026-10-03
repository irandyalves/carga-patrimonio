import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

export const exportAssetsToExcel = async (assets, filename = 'patrimonios_export.xlsx') => {
  if (!assets || !assets.length) {
    assets = [];
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Carga Patrimônio';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Inventário de Bens', {
    views: [{ state: 'frozen', ySplit: 1 }] // Congela cabeçalho na rolagem
  });

  // Definir Colunas com larguras mínimas modernas
  worksheet.columns = [
    { header: 'PATRIMÔNIO', key: 'patrimonio', width: 18 },
    { header: 'ITEM', key: 'item', width: 44 },
    { header: 'MARCA', key: 'marca', width: 22 },
    { header: 'MODELO', key: 'modelo', width: 22 },
    { header: 'LOCALIZAÇÃO', key: 'localizacao', width: 26 },
    { header: 'OBS', key: 'obs', width: 28 },
    { header: 'CONFERIDO', key: 'conferido', width: 16 },
    { header: 'SETOR', key: 'setor', width: 22 },
    { header: 'QUANTIDADE', key: 'quantidade', width: 14 },
    { header: 'VALOR ORIGINAL (R$)', key: 'valorOriginal', width: 22 },
    { header: 'VALOR ATUAL (R$)', key: 'valorAtual', width: 20 },
    { header: 'STATUS', key: 'status', width: 16 },
    { header: 'CONFERIDO EM', key: 'conferidoEm', width: 22 },
    { header: 'CONFERIDO POR', key: 'conferidoPor', width: 22 }
  ];

  // Estilização do Cabeçalho Moderno (Azul Escuro / Slate Profissional com Texto Branco)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' } // Branco
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF475569' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF475569' } }
    };
  });

  // Linhas Zebradas (Alternadas: Linha Clara / Linha Cinza Suave)
  assets.forEach((item, index) => {
    const isConferido = item.status === 'CONFERIDO' || Boolean(item.conferidoEm) || Boolean(item.conferido);
    const dataConferido = item.conferidoEm
      ? (typeof item.conferidoEm === 'string' && item.conferidoEm.includes('T')
          ? new Date(item.conferidoEm).toLocaleString('pt-BR')
          : String(item.conferidoEm))
      : '';

    const rowData = {
      patrimonio: item.numeroPatrimonio || '',
      item: item.descricao || '',
      marca: item.marca || '',
      modelo: item.modelo || '',
      localizacao: item.localizacao || '',
      obs: item.observacao || item.observacoes || item.obs || '',
      conferido: isConferido ? 'SIM' : 'NÃO',
      setor: item.setorNome || '',
      quantidade: item.quantidade || 1,
      valorOriginal: item.valorOriginal !== undefined && item.valorOriginal !== null ? Number(item.valorOriginal) : 0,
      valorAtual: item.valorAtual !== undefined && item.valorAtual !== null ? Number(item.valorAtual) : (Number(item.valorOriginal) || 0),
      status: item.status || (item.baixado ? 'BAIXADO' : 'ATIVO'),
      conferidoEm: dataConferido,
      conferidoPor: item.conferidoPor || ''
    };

    const row = worksheet.addRow(rowData);
    row.height = 22;

    const isEven = index % 2 === 0;
    // Linha Par: Branco (#FFFFFF) / Linha Ímpar: Fundo Suave (#F8FAFC)
    const rowBgColor = isEven ? 'FFFFFFFF' : 'FFF1F5F9';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBgColor }
      };
      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF1E293B' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alinhamentos e Formatação por Coluna
      if ([1, 7, 9, 12, 13].includes(colNumber)) {
        // PATRIMONIO, CONFERIDO, QUANTIDADE, STATUS, CONFERIDO EM
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([10, 11].includes(colNumber)) {
        // VALORES MONETÁRIOS
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = 'R$ #,##0.00;[Red]-R$ #,##0.00;"R$ 0,00"';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Destaque visual com cor na coluna CONFERIDO
      if (colNumber === 7) {
        if (isConferido) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } }; // Verde Escuro
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFECFDF5' : 'FFD1FAE5' } // Fundo Verde Menta Claro
          };
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: false, color: { argb: 'FF64748B' } }; // Cinza Neutro
        }
      }
    });
  });

  // Habilitar AutoFiltro em toda a tabela
  if (assets.length > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: assets.length + 1, column: worksheet.columns.length }
    };
  }

  // Ajuste inteligente das larguras de coluna com base no conteúdo
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(Math.max(maxLength + 4, column.width || 14), 60);
  });

  // Gerar e disparar download no navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
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
