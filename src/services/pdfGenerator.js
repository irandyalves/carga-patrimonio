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

// 3. Relatório de Conferência & Auditoria de Setor
export const generateInventoryReportPDF = (sector, assets, stats) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 24, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`RELATÓRIO DE CONFERÊNCIA DE CARGA PATRIMONIAL`, pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Setor: ${sector ? sector.name : 'Todos os Setores'}  |  Data: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 19, { align: 'center' });

  // Summary box
  autoTable(doc, {
    startY: 30,
    head: [['TOTAL DE ITENS', 'CONFERIDOS', 'PENDENTES', 'EM CAUTELA', 'BAIXADOS']],
    body: [[
      stats.total,
      `${stats.conferidos} (${stats.pctConferido}%)`,
      stats.pendentes,
      stats.cautelas,
      stats.baixados
    ]],
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' },
    styles: { halign: 'center', fontStyle: 'bold', fontSize: 10, cellPadding: 3 }
  });

  const tableData = assets.map(a => [
    a.numeroPatrimonio,
    a.descricao,
    a.setorNome,
    a.localizacao,
    a.status === 'CONFERIDO' ? `Conferido (${a.conferidoEm || 'Sim'})` : (a.status === 'BAIXADO' ? 'Baixado' : (a.status === 'EM_CAUTELA' ? 'Em Cautela' : 'Pendente')),
    `R$ ${Number(a.valorAtual || a.valorOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Patrimônio', 'Descrição', 'Setor Oficial', 'Localização', 'Status Conferência', 'Valor Atual']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 60 },
      2: { cellWidth: 32 },
      3: { cellWidth: 30 },
      4: { cellWidth: 26 },
      5: { cellWidth: 20, halign: 'right' }
    }
  });

  doc.save(`Relatorio_Inventario_${sector ? sector.id : 'Geral'}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
