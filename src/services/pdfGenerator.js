import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// 1. Termo de Cautela / Empréstimo
export const generateCautelaPDF = async (cautela, asset) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE RESPONSABILIDADE E CAUTELA DE BEM PATRIMONIAL', pageWidth / 2, 18, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Identificador da Cautela: #${cautela.id.toUpperCase()}  |  Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 38);

  // Generate QR Code Data URL for the asset
  const qrDataUrl = await QRCode.toDataURL(`PATRIMONIO:${asset.numeroPatrimonio}|CAUTELA:${cautela.id}`, { width: 120, margin: 1 });
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 45, 32, 32, 32);

  // Asset Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 46, pageWidth - 65, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 46, pageWidth - 65, 38, 3, 3, 'D');

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patrimônio Nº: ${asset.numeroPatrimonio}`, 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Descrição: ${asset.descricao}`, 18, 61, { maxWidth: pageWidth - 75 });
  doc.text(`Setor de Origem: ${cautela.setorOrigem || asset.setorNome}`, 18, 72);
  doc.text(`Valor de Referência: R$ ${Number(asset.valorAtual || asset.valorOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 18, 78);

  // Borrower Data Table
  autoTable(doc, {
    startY: 90,
    head: [['DADOS DO RESPONSÁVEL PELA RETIRADA (CAUTELADO)', 'DETALHES']],
    body: [
      ['Nome Completo:', cautela.responsavelRetirada],
      ['Documento / Matrícula:', cautela.documento || 'Não informado'],
      ['Telefone / WhatsApp:', cautela.telefone || 'Não informado'],
      ['Setor de Destino / Aplicação:', cautela.setorDestino],
      ['Data / Hora da Retirada:', cautela.dataRetirada],
      ['Previsão de Devolução:', cautela.dataPrevistaDevolucao],
      ['Finalidade do Empréstimo:', cautela.finalidade || 'Uso operacional / institucional'],
      ['Observações / Acessórios:', cautela.observacoes || 'Nenhuma observação informada']
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.5 },
    columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } }
  });

  // Terms and conditions
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TERMOS E CONDIÇÕES DO EMPRÉSTIMO:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const terms = [
    '1. O responsável declara ter recebido o bem patrimonial acima discriminado em perfeito estado de funcionamento e conservação.',
    '2. Compromete-se a zelar pelo mesmo e utilizá-lo estritamente para as finalidades autorizadas.',
    '3. Em caso de dano, extravio, roubo ou furto, o signatário deverá comunicar imediatamente o setor responsável para as providências cabíveis.',
    '4. A devolução deverá ocorrer até a data prevista, mediante conferência e baixa deste termo.'
  ];
  let currentY = finalY + 5;
  terms.forEach(term => {
    doc.text(term, 14, currentY, { maxWidth: pageWidth - 28 });
    currentY += 5;
  });

  // Signatures
  const signY = currentY + 25;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, signY, 90, signY);
  doc.line(pageWidth - 90, signY, pageWidth - 20, signY);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Assinatura do Responsável pela Guarda (Origem)', 55, signY + 5, { align: 'center' });
  doc.text('Assinatura do Recebedor (Cautelado)', pageWidth - 55, signY + 5, { align: 'center' });

  doc.save(`Termo_Cautela_${asset.numeroPatrimonio}_${cautela.id}.pdf`);
};

// 2. Folha de Etiquetas de Patrimônio em PDF com QR Code
export const generateLabelsPDF = async (assets) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cols = 3;
  const rows = 7;
  const labelWidth = 60;
  const labelHeight = 35;
  const marginX = (210 - (cols * labelWidth)) / (cols + 1);
  const marginY = (297 - (rows * labelHeight)) / (rows + 1);

  let currentItem = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const pageIndex = Math.floor(currentItem / (cols * rows));
    const slotOnPage = currentItem % (cols * rows);

    if (slotOnPage === 0 && pageIndex > 0) {
      doc.addPage();
    }

    const col = slotOnPage % cols;
    const row = Math.floor(slotOnPage / cols);

    const x = marginX + col * (labelWidth + marginX);
    const y = marginY + row * (labelHeight + marginY);

    // Draw label border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, labelWidth, labelHeight, 2, 2, 'D');

    // Label Header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x + 1, y + 1, labelWidth - 2, 6, 1, 1, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTROLE DE PATRIMÔNIO', x + (labelWidth / 2), y + 5, { align: 'center' });

    // QR Code
    const qrDataUrl = await QRCode.toDataURL(`PAT:${asset.numeroPatrimonio}`, { width: 80, margin: 0 });
    doc.addImage(qrDataUrl, 'PNG', x + 3, y + 9, 20, 20);

    // Asset Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(asset.numeroPatrimonio, x + 25, y + 13);

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Setor: ${asset.setorNome.substring(0, 22)}`, x + 25, y + 17);
    
    // Description truncated
    const descLines = doc.splitTextToSize(asset.descricao, labelWidth - 27);
    doc.text(descLines.slice(0, 3), x + 25, y + 21);

    // Footer
    doc.setFontSize(4.5);
    doc.setTextColor(148, 163, 184);
    doc.text('USO INSTITUCIONAL - NÃO REMOVER', x + (labelWidth / 2), y + labelHeight - 2, { align: 'center' });

    currentItem++;
  }

  doc.save(`Etiquetas_Patrimonio_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Helper para formatar texto em Title Case (apenas a primeira letra maiúscula)
const formatTitleCase = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().replace(/(?:^|\s|-|\/)\S/g, char => char.toUpperCase());
};

// 3. Relatório de Conferência & Auditoria de Setor
export const generateInventoryReportPDF = (sector, assets, stats, selectedColumns = null, orderedColumnIds = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho em linha única e alinhado verticalmente ao centro (fonte 7.5pt)
  const headerHeight = 9;
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  const setorText = sector ? formatTitleCase(sector.name) : 'Todos os Setores';
  const dataHoraText = new Date().toLocaleString('pt-BR');
  const headerFullText = `RELATÓRIO DE CONFERÊNCIA DE CARGA PATRIMONIAL  |  Setor: ${setorText}  |  Data: ${dataHoraText}`;

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(headerFullText, pageWidth / 2, headerHeight / 2, { align: 'center', baseline: 'middle' });

  // Summary box compacta em linha única (números na frente do texto)
  autoTable(doc, {
    startY: 11,
    margin: { left: 10, right: 10, bottom: 12 },
    head: [[
      `TOTAL DE ITENS: ${stats.total}`,
      `CONFERIDOS: ${stats.conferidos} (${stats.pctConferido}%)`,
      `PENDENTES: ${stats.pendentes}`,
      `EM CAUTELA: ${stats.cautelas}`,
      `BAIXADOS: ${stats.baixados}`
    ]],
    theme: 'plain',
    headStyles: { 
      fillColor: [241, 245, 249], 
      textColor: [15, 23, 42], 
      fontStyle: 'bold', 
      halign: 'center', 
      fontSize: 7.2, 
      cellPadding: { top: 1.6, right: 1, bottom: 1.6, left: 1 } 
    }
  });

  // Configuração das colunas ativas selecionadas pelo usuário
  const cols = selectedColumns || {
    patrimonio: true,
    descricao: true,
    setorNome: true,
    responsavel: true,
    localizacao: true,
    status: true,
    valorAtual: true
  };

  const ALL_COLS_DEF_MAP = {
    patrimonio: { id: 'patrimonio', header: 'Patrimônio', baseWidth: 17, fontSize: 7.4, fontStyle: 'bold', halign: 'right', getValue: a => a.numeroPatrimonio },
    descricao: { id: 'descricao', header: 'Descrição do item', baseWidth: 76, fontSize: 5.1, fontStyle: 'normal', halign: 'left', isFlex: true, getValue: a => a.descricao }, // Fonte reduzida em 20%
    setorNome: { id: 'setorNome', header: 'Setor Oficial', baseWidth: 21, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => formatTitleCase(a.setorNome) },
    responsavel: { id: 'responsavel', header: 'Resp. Carga', baseWidth: 20, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => formatTitleCase(a.responsavel || (sector && sector.id === a.setorId ? sector.responsavel : '') || '-') },
    localizacao: { id: 'localizacao', header: 'Onde Está', baseWidth: 18, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => formatTitleCase(a.localizacao || '-') },
    marca: { id: 'marca', header: 'Marca', baseWidth: 16, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => formatTitleCase(a.marca || '-') },
    modelo: { id: 'modelo', header: 'Modelo', baseWidth: 16, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => a.modelo || '-' },
    dataAquisicao: { id: 'dataAquisicao', header: 'Data Aquisição', baseWidth: 17, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => a.dataAquisicao || a.anoAquisicao || '-' },
    status: { id: 'status', header: 'Status', baseWidth: 18, fontSize: 5.8, fontStyle: 'normal', halign: 'center', getValue: a => a.status === 'CONFERIDO' ? 'Conferido' : (a.status === 'BAIXADO' ? 'Baixado' : (a.status === 'EM_CAUTELA' ? 'Em Cautela' : 'Pendente')) },
    valorOriginal: { id: 'valorOriginal', header: 'Valor Original', baseWidth: 19, fontSize: 6.0, fontStyle: 'normal', halign: 'right', getValue: a => `R$ ${Number(a.valorOriginal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    valorAtual: { id: 'valorAtual', header: 'Valor Atual', baseWidth: 20, fontSize: 6.0, fontStyle: 'normal', halign: 'right', getValue: a => `R$ ${Number(a.valorAtual || a.valorOriginal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    depreciacao: { id: 'depreciacao', header: 'Depreciação', baseWidth: 16, fontSize: 5.5, fontStyle: 'normal', halign: 'center', getValue: a => a.depreciacao ? (String(a.depreciacao).includes('%') ? a.depreciacao : `${a.depreciacao}%`) : '-' }
  };

  // Respeita a ordem exata definida pelo usuário via Drag & Drop
  const defaultOrder = [
    'patrimonio', 'descricao', 'setorNome', 'responsavel', 'localizacao', 
    'status', 'valorAtual', 'marca', 'modelo', 'dataAquisicao', 'valorOriginal', 'depreciacao'
  ];
  const orderSeq = (Array.isArray(orderedColumnIds) && orderedColumnIds.length > 0) ? orderedColumnIds : defaultOrder;

  // Filtra apenas as colunas marcadas como ativas mantendo a ordem exata
  const activeColDefs = orderSeq
    .filter(id => cols[id] && ALL_COLS_DEF_MAP[id])
    .map(id => ALL_COLS_DEF_MAP[id]);

  const tableHeaders = activeColDefs.map(c => c.header);

  // Calcula larguras exatas para preencher 190 mm (área útil da folha A4 com margens de 10 mm)
  const totalAvailableWidth = 190;
  const fixedWidthSum = activeColDefs.filter(c => !c.isFlex).reduce((acc, c) => acc + c.baseWidth, 0);
  const flexCol = activeColDefs.find(c => c.isFlex);

  let finalColStyles = {};
  if (flexCol && totalAvailableWidth - fixedWidthSum >= 35) {
    const flexWidth = totalAvailableWidth - fixedWidthSum;
    activeColDefs.forEach((c, idx) => {
      finalColStyles[idx] = {
        cellWidth: c.isFlex ? flexWidth : c.baseWidth,
        fontSize: c.fontSize,
        fontStyle: c.fontStyle,
        halign: c.halign
      };
    });
  } else {
    // Se muitas colunas forem ativadas, faz distribuição proporcional exata de 190mm
    const baseSum = activeColDefs.reduce((acc, c) => acc + (c.isFlex ? 55 : c.baseWidth), 0) || 1;
    activeColDefs.forEach((c, idx) => {
      const assigned = ((c.isFlex ? 55 : c.baseWidth) / baseSum) * totalAvailableWidth;
      finalColStyles[idx] = {
        cellWidth: Number(assigned.toFixed(1)),
        fontSize: c.fontSize,
        fontStyle: c.fontStyle,
        halign: c.halign
      };
    });
  }

  const tableData = assets.map(a => activeColDefs.map(c => c.getValue(a)));

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    margin: { left: 10, right: 10, bottom: 12 },
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [51, 65, 85], 
      textColor: 255, 
      fontStyle: 'bold', 
      fontSize: 7.2,
      cellPadding: { top: 2, right: 1.2, bottom: 2, left: 1.2 }
    },
    styles: { 
      font: 'helvetica', 
      fontSize: 6.4,
      cellPadding: { top: 1.8, right: 1.0, bottom: 1.8, left: 1.0 },
      overflow: 'linebreak'
    },
    columnStyles: finalColStyles
  });

  // Numeração de Página e Rodapé Institucional em todas as páginas geradas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Linha sutil divisória do rodapé
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.line(10, pageHeight - 7, pageWidth - 10, pageHeight - 7);

    // Textos do rodapé
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Carga Patrimonial  •  ${sector ? formatTitleCase(sector.name) : 'Todos os Setores'}`, 10, pageHeight - 3.5);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 10, pageHeight - 3.5, { align: 'right' });
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateFormatted = `${day}-${month}-${year}`;
  const sectorTitle = sector ? formatTitleCase(sector.name).replace(/[/\\?%*:|"<>]/g, '_').trim() : 'Geral';
  const fileName = `${sectorTitle}_relatório_${dateFormatted}.pdf`;

  doc.save(fileName);
};
