export const SECTORS = [
  { id: 'sec-ti', name: 'Tecnologia da Informação (TI)', responsavel: 'Carlos Silva', email: 'carlos.ti@empresa.com.br', sala: 'Bloco A - Sala 101', cor: 'indigo' },
  { id: 'sec-adm', name: 'Administrativo', responsavel: 'Mariana Souza', email: 'mariana.adm@empresa.com.br', sala: 'Bloco A - Sala 102', cor: 'blue' },
  { id: 'sec-fin', name: 'Financeiro / Contabilidade', responsavel: 'Roberto Mendes', email: 'roberto.fin@empresa.com.br', sala: 'Bloco A - Sala 103', cor: 'emerald' },
  { id: 'sec-rh', name: 'Recursos Humanos (RH)', responsavel: 'Fernanda Lima', email: 'fernanda.rh@empresa.com.br', sala: 'Bloco A - Sala 104', cor: 'pink' },
  { id: 'sec-almox', name: 'Almoxarifado Central', responsavel: 'João Pereira', email: 'joao.almox@empresa.com.br', sala: 'Galpão 01', cor: 'amber' },
  { id: 'sec-op', name: 'Operações e Logística', responsavel: 'André Santos', email: 'andre.op@empresa.com.br', sala: 'Galpão 02', cor: 'orange' },
  { id: 'sec-jur', name: 'Jurídico & Compliance', responsavel: 'Dra. Beatriz Ramos', email: 'beatriz.jur@empresa.com.br', sala: 'Bloco B - Sala 201', cor: 'purple' },
  { id: 'sec-mkt', name: 'Marketing & Comunicação', responsavel: 'Lucas Rocha', email: 'lucas.mkt@empresa.com.br', sala: 'Bloco B - Sala 202', cor: 'cyan' },
  { id: 'sec-eng', name: 'Engenharia & Manutenção', responsavel: 'Eng. Paulo Vieira', email: 'paulo.eng@empresa.com.br', sala: 'Oficina Central', cor: 'teal' },
  { id: 'sec-dir', name: 'Diretoria Executiva', responsavel: 'Dra. Helena Martins', email: 'helena.dir@empresa.com.br', sala: 'Bloco Executivo - Cobertura', cor: 'rose' },
];

export const CATEGORIES = [
  'Equipamentos de Informática',
  'Mobiliário em Geral',
  'Aparelhos Eletroeletrônicos',
  'Veículos e Transporte',
  'Ferramentas e Máquinas',
  'Equipamentos de Comunicação',
  'Instrumentos e Medição',
  'Outros Bens Permanentes',
];

export const STATUS = {
  ATIVO: { id: 'ATIVO', label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CONFERIDO: { id: 'CONFERIDO', label: 'Conferido', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  EM_CAUTELA: { id: 'EM_CAUTELA', label: 'Em Cautela / Empréstimo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  EM_MANUTENCAO: { id: 'EM_MANUTENCAO', label: 'Em Manutenção', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  BAIXADO: { id: 'BAIXADO', label: 'Baixado / Desincorporado', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
};
