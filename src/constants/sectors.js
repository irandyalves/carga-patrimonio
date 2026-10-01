export const SECTORS = [
  { id: 'sec-auditorio', name: 'Auditório', responsavel: 'Tadeu', email: 'tadeu@empresa.gov.br', sala: 'Auditório Principal', cor: 'indigo' },
  { id: 'sec-cadmi', name: 'CADMI', responsavel: 'Alex', email: 'alex.cadmi@empresa.gov.br', sala: 'Salão CADMI (4 Ilhas)', cor: 'orange' },
  { id: 'sec-copa-1piso', name: 'Copa 1º Piso', responsavel: 'Alex', email: 'alex@empresa.gov.br', sala: 'Copa 1º Andar', cor: 'teal' },
  { id: 'sec-copa-terreo', name: 'Copa Cozinha Térreo', responsavel: 'Alex', email: 'alex@empresa.gov.br', sala: 'Copa Térreo', cor: 'rose' },
  { id: 'sec-foyer', name: 'Foyer', responsavel: 'Alex', email: 'alex@empresa.gov.br', sala: 'Foyer de Entrada', cor: 'cyan' },
  { id: 'sec-lab-inovacao', name: 'Laboratório Inovação', responsavel: 'Ricardo Mello', email: 'ricardo.mello@empresa.gov.br', sala: 'Laboratório de Inovação', cor: 'emerald' },
  { id: 'sec-recepcao', name: 'Recepção', responsavel: 'Alex', email: 'alex@empresa.gov.br', sala: 'Recepção Térreo', cor: 'blue' },
  { id: 'sec-revista-jmu', name: 'Revista JMU', responsavel: 'Alexandre', email: 'alexandre@empresa.gov.br', sala: 'Redação Revista JMU', cor: 'pink' },
  { id: 'sec-sacadi', name: 'SACADI', responsavel: 'Alex', email: 'alex.sacadi@empresa.gov.br', sala: 'Salão SACADI (4 Ilhas)', cor: 'amber' },
  { id: 'sec-reunioes', name: 'Sala de Reuniões', responsavel: 'Alex', email: 'alex@empresa.gov.br', sala: 'Sala de Reuniões Principal', cor: 'violet' },
  { id: 'sec-studio', name: 'Studio', responsavel: 'Tadeu', email: 'tadeu@empresa.gov.br', sala: 'Studio de Gravação', cor: 'purple' },
  { id: 'sec-ti', name: 'TI', responsavel: 'Santana', email: 'santana.ti@empresa.gov.br', sala: 'Data Center & TI', cor: 'indigo' },
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
