/**
 * Utilitários de formatação para o Carga Patrimonial
 */

/**
 * Formata o número de patrimônio no formato amigável XX.XXX (facilita leitura)
 * Exemplos:
 * 42542 -> 42.542
 * 42661 -> 42.661
 * 52425 -> 52.425
 */
export const formatPatrimonio = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  const digits = str.replace(/\D/g, '');

  if (digits.length === 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length > 5) {
    const last5 = digits.slice(-5);
    const prefix = digits.slice(0, -5);
    return `${prefix ? prefix + '-' : ''}${last5.slice(0, 2)}.${last5.slice(2)}`;
  }

  return str;
};

/**
 * Retorna os últimos 5 dígitos já formatados como XX.XXX
 */
export const formatLast5Patrimonio = (val) => {
  if (!val) return '00.000';
  const str = String(val).trim();
  const digits = str.replace(/\D/g, '');
  const last5 = digits.length >= 5 ? digits.slice(-5) : digits.padStart(5, '0');
  return `${last5.slice(0, 2)}.${last5.slice(2)}`;
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

  if (str.includes(',') && str.includes('.')) {
    // Ex: 1.234,56 -> 1234.56
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // Ex: 1234,56 -> 1234.56
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 2) {
      // Ex: 1.234.567 -> 1234567
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

