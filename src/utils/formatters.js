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
 * Formata moeda para padrão Real Brasileiro BRL
 */
export const formatCurrency = (val) => {
  const num = Number(val || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
