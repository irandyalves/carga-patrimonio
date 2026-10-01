/**
 * Utilitários de formatação para o Carga Patrimonial
 */

/**
 * Formata o número de patrimônio retirando o prefixo de 5 dígitos quando existir,
 * mantendo e formatando apenas os últimos 4 ou 5 dígitos:
 * Exemplos:
 * 0000044892 -> 44.892
 * 2024044892 -> 44.892
 * 202404892  -> 4.892
 * 42542      -> 42.542
 * 4892       -> 4.892
 */
export const formatPatrimonio = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  const digits = str.replace(/\D/g, '');

  if (!digits) return str;

  // Se tiver mais de 5 dígitos (ex: 9 ou 10 dígitos com prefixo de 5 dígitos), remove os 5 primeiros
  let useful = digits;
  if (digits.length > 5) {
    useful = digits.length >= 9 ? digits.slice(5) : digits.slice(-5);
  }

  if (useful.length === 5) {
    return `${useful.slice(0, 2)}.${useful.slice(2)}`;
  }

  if (useful.length === 4) {
    return `${useful.slice(0, 1)}.${useful.slice(1)}`;
  }

  return useful;
};

/**
 * Retorna os últimos 4 ou 5 dígitos já formatados como XX.XXX ou X.XXX
 */
export const formatLast5Patrimonio = (val) => {
  return formatPatrimonio(val);
};

/**
 * Converte e formata data de aquisição para data amigável (DD/MM/AAAA ou AAAA).
 * Se for número com decimais/moeda (ex: 2819.99), descarta pois não é data.
 * Se for número serial do Excel (ex: 44562), converte para data legível.
 */
export const formatDisplayDate = (val) => {
  if (val === null || val === undefined || val === '' || val === '---') return '---';
  
  const str = String(val).trim();
  if (!str) return '---';

  // Se tiver casas decimais (ex: 2819.99 ou 656.58), é um valor financeiro, não é data!
  if (str.includes('.') && str.split('.')[1] && str.split('.')[1].length === 2 && !str.includes('/')) {
    return '---';
  }
  if (str.includes(',') && str.split(',')[1] && str.split(',')[1].length === 2) {
    return '---';
  }

  // Se for formato ISO tipo 2024-11-22 ou 2024-11-22T...
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.slice(0, 10).split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Se for formato DD-MM-AAAA
  if (/^\d{2}-\d{2}-\d{4}/.test(str)) {
    const parts = str.slice(0, 10).split('-');
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }

  // Se já estiver no formato DD/MM/AAAA ou DD/MM/AA
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) {
    return str;
  }

  // Se for apenas o ano (ex: 2021, 2024)
  if (/^\d{4}$/.test(str)) {
    const year = parseInt(str, 10);
    if (year >= 1950 && year <= 2050) return str;
  }

  // Se for número serial do Excel (ex: 42000 a 55000)
  const num = Number(str);
  if (!isNaN(num) && num >= 25000 && num <= 65000 && Number.isInteger(num)) {
    const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }
  }

  return str;
};

/**
 * Converte qualquer valor numérico ou string bruta para float com arredondamento exato em centavos (2 casas)
 */
export const parseCleanNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.round(val * 100) / 100;
  }
  let str = String(val).trim().replace(/[R$\s]/g, '');
  if (!str) return 0;

  // Se tiver vírgula E ponto
  if (str.includes(',') && str.includes('.')) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Padrão Brasileiro: 1.234,56 ou 1.234.567,89 (pontos = milhar, vírgula = decimal)
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão Internacional / Excel: 1,234.56 ou 1,234,567.89 (vírgulas = milhar, ponto = decimal)
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Apenas vírgula: ex: 1234,56
    const parts = str.split(',');
    if (parts.length > 2) {
      // Múltiplas vírgulas (milhares americano): 1,234,567
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  } else if (str.includes('.')) {
    // Apenas ponto: ex: 1234.56 ou 1.234.567
    const parts = str.split('.');
    if (parts.length > 2) {
      // Múltiplos pontos (milhares brasileiro): 1.234.567
      str = str.replace(/\./g, '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
};

/**
 * Formata moeda para padrão Real Brasileiro BRL forçando exatamente 2 casas decimais (centavos)
 */
export const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return 'R$ 0,00';
  const num = parseCleanNumber(val);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Formata valor de depreciação (se porcentagem mantém %, se número formata em moeda com 2 casas)
 */
export const formatDepreciacao = (val) => {
  if (val === null || val === undefined || val === '' || val === 0 || val === '0') return '---';
  const str = String(val).trim();
  if (str.endsWith('%')) return str;

  const num = parseCleanNumber(val);
  if (num === 0) return str || '---';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

