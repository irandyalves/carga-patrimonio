import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Tag, 
  Building2, 
  MapPin, 
  Image as ImageIcon, 
  Sparkles, 
  Mic, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  Check, 
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Users,
  User,
  UserPlus
} from 'lucide-react';
import { formatPatrimonio } from '../utils/formatters';

// Biblioteca Inteligente de Fotos em Alta Resolução por Categoria / Palavra-Chave
const AI_IMAGE_LIBRARY = {
  cadeira: [
    { url: 'https://images.unsplash.com/photo-1580481077195-c99732155d88?w=600&auto=format&fit=crop&q=80', label: 'Cadeira Ergonômica Giratória' },
    { url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80', label: 'Cadeira Executiva em Couro' },
    { url: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=600&auto=format&fit=crop&q=80', label: 'Cadeira Operacional Mesh' },
    { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&auto=format&fit=crop&q=80', label: 'Cadeira Estofada Flexform' }
  ],
  monitor: [
    { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', label: 'Monitor UltraSharp 27"' },
    { url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=80', label: 'Monitor Widescreen Setup' },
    { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', label: 'Monitor Desktop Office' },
    { url: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&auto=format&fit=crop&q=80', label: 'Monitor 40" Profissional' }
  ],
  notebook: [
    { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', label: 'Notebook Corporativo Dell' },
    { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80', label: 'Notebook Slim Core i7' },
    { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80', label: 'Laptop Trabalho de Campo' },
    { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', label: 'Estação Móvel de Trabalho' }
  ],
  mesa: [
    { url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80', label: 'Mesa de Escritório em L' },
    { url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&auto=format&fit=crop&q=80', label: 'Mesa Corporativa com Gavetas' },
    { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80', label: 'Mesa Reuniões 8 Lugares' },
    { url: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=600&auto=format&fit=crop&q=80', label: 'Bancada Modular de Trabalho' }
  ],
  geladeira: [
    { url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80', label: 'Refrigerador Frost Free Inox' },
    { url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80', label: 'Frigobar Copa Escritório' },
    { url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80', label: 'Geladeira Duplex Copa' },
    { url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80', label: 'Eletrodoméstico Copa' }
  ],
  cafeteira: [
    { url: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=600&auto=format&fit=crop&q=80', label: 'Cafeteira Elétrica Express' },
    { url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80', label: 'Micro-ondas Inox 32L' },
    { url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', label: 'Purificador e Bebedouro de Água' },
    { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', label: 'Equipamento de Copa' }
  ],
  ar: [
    { url: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=600&auto=format&fit=crop&q=80', label: 'Ar Condicionado Split Inverter' },
    { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80', label: 'Climatizador de Ambiente' },
    { url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80', label: 'Unidade Split 24000 BTUs' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80', label: 'Controle de Climatização' }
  ],
  tv: [
    { url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80', label: 'Smart TV 55" 4K UHD' },
    { url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80', label: 'Painel Display Reunião' },
    { url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80', label: 'Monitor Display Sala 65"' },
    { url: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=80', label: 'Painel Corporativo' }
  ],
  camera: [
    { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80', label: 'Câmera Gravação Estúdio 4K' },
    { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', label: 'Microfone Condensador Profissional' },
    { url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80', label: 'Mesa de Som e Áudio Digital' },
    { url: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600&auto=format&fit=crop&q=80', label: 'Kit Iluminação Softbox Studio' }
  ],
  armario: [
    { url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80', label: 'Armário Alto em Madeira 2 Portas' },
    { url: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=600&auto=format&fit=crop&q=80', label: 'Arquivo de Aço 4 Gavetas' },
    { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80', label: 'Estante Modular para Processos' },
    { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80', label: 'Armário Baixo com Chave' }
  ],
  sofa: [
    { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80', label: 'Sofá Recepção Couro Sintético' },
    { url: 'https://images.unsplash.com/photo-1493663284041-c4e38266e168?w=600&auto=format&fit=crop&q=80', label: 'Poltrona de Espera Foyer' },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80', label: 'Conjunto de Assentos Convivência' },
    { url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&auto=format&fit=crop&q=80', label: 'Longarina Recepção' }
  ],
  padrao: [
    { url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80', label: 'Equipamento Patrimonial Geral' },
    { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', label: 'Monitor e Computador Escritório' },
    { url: 'https://images.unsplash.com/photo-1580481077195-c99732155d88?w=600&auto=format&fit=crop&q=80', label: 'Mobiliário de Escritório' },
    { url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80', label: 'Estação de Trabalho' }
  ]
};

// Detector de categoria a partir do texto
const detectCategory = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('cadeira') || t.includes('poltrona') || t.includes('assento') || t.includes('flexform')) return 'cadeira';
  if (t.includes('monitor') || t.includes('tela') || t.includes('display') || t.includes('ultrasharp')) return 'monitor';
  if (t.includes('notebook') || t.includes('laptop') || t.includes('computador') || t.includes('dell latitude')) return 'notebook';
  if (t.includes('mesa') || t.includes('estação') || t.includes('bancada') || t.includes('escrivaninha')) return 'mesa';
  if (t.includes('geladeira') || t.includes('frigobar') || t.includes('refrigerador')) return 'geladeira';
  if (t.includes('cafe') || t.includes('cafeteira') || t.includes('microondas') || t.includes('micro-ondas') || t.includes('bebedouro') || t.includes('purificador')) return 'cafeteira';
  if (t.includes('ar ') || t.includes('split') || t.includes('condicionado') || t.includes('clima')) return 'ar';
  if (t.includes('tv') || t.includes('televis') || t.includes('smart tv') || t.includes('painel')) return 'tv';
  if (t.includes('camera') || t.includes('câmera') || t.includes('microfone') || t.includes('som') || t.includes('audio') || t.includes('estudio')) return 'camera';
  if (t.includes('armario') || t.includes('armário') || t.includes('arquivo') || t.includes('gavet') || t.includes('estante')) return 'armario';
  if (t.includes('sofa') || t.includes('sofá') || t.includes('longarina')) return 'sofa';
  return 'padrao';
};

// Formatador inteligente de telefone ou ramal interno
const formatPhoneOrRamal = (value = '') => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  // Ramal interno curto (até 5 dígitos)
  if (digits.length <= 5 && !value.includes('(')) {
    return digits;
  }
  // Telefone fixo (8 dígitos sem DDD)
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  // Celular (9 dígitos sem DDD)
  if (digits.length === 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  // Fixo com DDD (10 dígitos)
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Celular com DDD (11 dígitos ou mais)
  if (digits.length >= 11) {
    const d = digits.slice(0, 11);
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  // Digitação intermediária
  if (digits.length > 2 && digits.length < 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length >= 7 && digits.length < 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
};

export const AssetModal = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  defaultSectorId,
  sectors = [],
  servidores = [],
  onOpenServidoresModal
}) => {
  // Estado estruturado com os campos solicitados pelo usuário
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    descricao: '',
    marca: '',
    modelo: '',
    depreciacao: '',
    localizacao: '',
    naCarga: true,
    observacoes: '',
    foto: '',
    setorId: defaultSectorId || sectors[0]?.id || 'sec-foyer',
    setorNome: '',
    responsavel: '',
    telefone: '',
    categoria: 'Mobiliário e Equipamentos',
    servidorId: '',
    servidorNome: '',
    servidorTelefone: ''
  });

  // Estados de IA para busca de fotos na internet
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [detectedCat, setDetectedCat] = useState('');
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);

  // Estados de microfone para descrição e localização
  const [isListeningDesc, setIsListeningDesc] = useState(false);
  const [isListeningLoc, setIsListeningLoc] = useState(false);

  useEffect(() => {
    if (assetToEdit) {
      const formattedNum = formatPatrimonio(assetToEdit.numeroPatrimonio || '');
      setFormData({
        numeroPatrimonio: formattedNum || assetToEdit.numeroPatrimonio || '',
        descricao: assetToEdit.descricao || '',
        marca: assetToEdit.marca || '',
        modelo: assetToEdit.modelo || '',
        depreciacao: assetToEdit.depreciacao || '',
        localizacao: assetToEdit.localizacao || '',
        naCarga: assetToEdit.naCarga !== undefined ? assetToEdit.naCarga : true,
        observacoes: assetToEdit.observacoes || assetToEdit.obs || '',
        foto: assetToEdit.foto || '',
        setorId: assetToEdit.setorId || sectors[0]?.id || 'sec-foyer',
        setorNome: assetToEdit.setorNome || '',
        responsavel: assetToEdit.responsavel || '',
        telefone: assetToEdit.telefone || assetToEdit.ramal || '',
        categoria: assetToEdit.categoria || 'Geral',
        servidorId: assetToEdit.servidorId || '',
        servidorNome: assetToEdit.servidorNome || '',
        servidorTelefone: assetToEdit.servidorTelefone || ''
      });
      if (assetToEdit.descricao) {
        const cat = detectCategory(assetToEdit.descricao);
        setDetectedCat(cat);
        setAiSuggestions(AI_IMAGE_LIBRARY[cat] || AI_IMAGE_LIBRARY.padrao);
      }
    } else {
      const selectedSec = sectors.find(s => s.id === (defaultSectorId || sectors[0]?.id)) || sectors[0] || { id: 'sec-foyer', name: 'Foyer', sala: 'Hall de Entrada', responsavel: 'Jean' };
      const randNum = String(Math.floor(42542 + Math.random() * 400));
      const formattedNum = `${randNum.slice(0, 2)}.${randNum.slice(2)}`;

      setFormData({
        numeroPatrimonio: formattedNum,
        descricao: '',
        marca: '',
        modelo: '',
        depreciacao: '',
        localizacao: selectedSec.sala || '',
        naCarga: true,
        observacoes: '',
        foto: '',
        setorId: selectedSec.id,
        setorNome: selectedSec.name,
        responsavel: selectedSec.responsavel || '',
        telefone: selectedSec.telefone || selectedSec.ramal || '',
        categoria: 'Mobiliário e Equipamentos',
        servidorId: '',
        servidorNome: '',
        servidorTelefone: ''
      });
      setAiSuggestions([]);
      setDetectedCat('');
    }
  }, [assetToEdit, defaultSectorId, isOpen, sectors]);

  // Formata o número ao digitar no padrão XX.XXX
  const handlePatrimonioChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 5);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    setFormData(prev => ({ ...prev, numeroPatrimonio: formatted }));
  };

  // Formata telefone ou ramal com máscara inteligente
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhoneOrRamal(raw);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  // Atualiza setor selecionado
  const handleSectorChange = (secId) => {
    const sec = sectors.find(s => s.id === secId);
    if (sec) {
      setFormData(prev => ({
        ...prev,
        setorId: sec.id,
        setorNome: sec.name,
        responsavel: sec.responsavel || prev.responsavel,
        telefone: sec.telefone || sec.ramal || prev.telefone || '',
        localizacao: prev.localizacao || sec.sala || ''
      }));
    }
  };

  // IA: Buscar fotos na internet com base na descrição
  const handleFetchAiPhotos = () => {
    setIsSearchingPhotos(true);
    const cat = detectCategory(formData.descricao);
    setDetectedCat(cat);
    const list = AI_IMAGE_LIBRARY[cat] || AI_IMAGE_LIBRARY.padrao;
    setAiSuggestions(list);

    // Se o campo de foto ainda estiver vazio, já seleciona a primeira foto automaticamente!
    if (!formData.foto && list.length > 0) {
      setFormData(prev => ({ ...prev, foto: list[0].url }));
    }

    setTimeout(() => {
      setIsSearchingPhotos(false);
    }, 400);
  };

  // Quando o usuário terminar de digitar uma descrição relevante, sugere fotos
  const handleDescricaoBlur = () => {
    if (formData.descricao.trim().length >= 4 && aiSuggestions.length === 0) {
      handleFetchAiPhotos();
    }
  };

  // Microfone para Descrição
  const handleVoiceDesc = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      setIsListeningDesc(true);

      recognition.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) {
          const cap = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setFormData(prev => ({ ...prev, descricao: cap }));
          const cat = detectCategory(cap);
          setDetectedCat(cat);
          setAiSuggestions(AI_IMAGE_LIBRARY[cat] || AI_IMAGE_LIBRARY.padrao);
        }
        setIsListeningDesc(false);
      };

      recognition.onerror = () => setIsListeningDesc(false);
      recognition.onend = () => setIsListeningDesc(false);
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningDesc(false);
    }
  };

  // Microfone para Localização
  const handleVoiceLoc = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      setIsListeningLoc(true);

      recognition.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) {
          const cap = transcript.charAt(0).toUpperCase() + transcript.slice(1);
          setFormData(prev => ({ ...prev, localizacao: cap }));
        }
        setIsListeningLoc(false);
      };

      recognition.onerror = () => setIsListeningLoc(false);
      recognition.onend = () => setIsListeningLoc(false);
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningLoc(false);
    }
  };

  // Submissão do Formulário
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.numeroPatrimonio || !formData.descricao) return;

    // Remove qualquer máscara para garantir integridade ou preserva XX.XXX
    const cleanDigits = formData.numeroPatrimonio.replace(/\D/g, '');
    const cleanNum = cleanDigits.length === 5 ? cleanDigits : formData.numeroPatrimonio.trim();

    onSave({
      ...formData,
      numeroPatrimonio: cleanNum,
      quantidade: 1,
      naCarga: !!formData.naCarga,
      responsavel: (formData.responsavel || '').trim(),
      telefone: (formData.telefone || '').trim(),
      observacoes: (formData.observacoes || '').trim(),
      foto: (formData.foto || '').trim(),
      dataAquisicao: assetToEdit?.dataAquisicao || new Date().toLocaleDateString('pt-BR'),
      anoAquisicao: assetToEdit?.anoAquisicao || new Date().getFullYear(),
      valorOriginal: assetToEdit?.valorOriginal || 0,
      valorAtual: assetToEdit?.valorAtual || 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative max-h-[96vh] flex flex-col justify-between">
        
        {/* Botão Fechar no Topo */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Formulário Principal Compacto */}
        <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
          
          {/* Linha 1: Nº Patrimônio (Sem bordas, Bold 30% maior, Edição direta, Enter salva) e Setor à direita */}
          <div className="pr-10 flex items-center gap-3 pt-0.5">
            {/* Nº Patrimônio */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Nº Patrimônio <span className="text-indigo-400 font-mono text-[9px]">(Enter salva)</span>
              </label>
              <input
                type="text"
                required
                maxLength={7}
                value={formData.numeroPatrimonio}
                onChange={handlePatrimonioChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                placeholder="42.542"
                title="Clique para editar o número do patrimônio. Pressione Enter para salvar."
                className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-indigo-400 text-2xl font-black font-mono text-indigo-300 tracking-wider px-0 py-0.5 focus:outline-none transition-all placeholder-indigo-400/40"
              />
            </div>

            {/* List Box do Setor */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Setor Responsável
              </label>
              <select
                value={formData.setorId}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.responsavel ? `(${s.responsavel})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 2: Responsável à esquerda e Telefone/Ramal (com máscara inteligente) à direita */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Responsável
              </label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                placeholder="Nome do responsável"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center justify-between">
                <span>Telefone / Ramal</span>
                <span className="text-[9px] text-slate-500 font-normal">Máscara / Ramal</span>
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="Ramal (2450) ou (XX) 9XXXX-XXXX"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono placeholder-slate-600"
              />
            </div>
          </div>

          {/* Servidor / Pessoa onde o item está alocado */}
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Servidor / Pessoa (Onde o bem está alocado)</span>
              </label>
              <span className="text-[9.5px] text-cyan-400 font-medium">Ex: Mesa da Tais</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <select
                  value={formData.servidorId || (formData.servidorNome ? `custom-${formData.servidorNome}` : '')}
                  onChange={(e) => {
                    const selId = e.target.value;
                    if (!selId) {
                      setFormData(prev => ({
                        ...prev,
                        servidorId: '',
                        servidorNome: '',
                        servidorTelefone: ''
                      }));
                      return;
                    }
                    const s = servidores.find(item => item.id === selId);
                    if (s) {
                      setFormData(prev => {
                        const newLoc = s.mesa ? `Mesa da ${s.nome} (${s.mesa})` : `Mesa da ${s.nome}`;
                        return {
                          ...prev,
                          servidorId: s.id,
                          servidorNome: s.nome,
                          servidorTelefone: s.telefone || prev.servidorTelefone,
                          localizacao: prev.localizacao && !prev.localizacao.toLowerCase().includes('mesa') ? prev.localizacao : newLoc,
                          telefone: prev.telefone || s.telefone || ''
                        };
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">Nenhum servidor selecionado (Uso geral)</option>
                  {servidores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome} {s.mesa ? `(${s.mesa})` : ''} {s.telefone ? `• Tel: ${s.telefone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={formData.servidorNome || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = servidores.find(s => s.nome.toLowerCase() === val.toLowerCase());
                    setFormData(prev => ({
                      ...prev,
                      servidorNome: val,
                      servidorId: matched ? matched.id : '',
                      servidorTelefone: matched ? (matched.telefone || prev.servidorTelefone) : prev.servidorTelefone
                    }));
                  }}
                  placeholder="Ou digite o nome do servidor..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />

                {onOpenServidoresModal && (
                  <button
                    type="button"
                    onClick={onOpenServidoresModal}
                    title="Cadastrar ou gerenciar servidores"
                    className="p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold shrink-0 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Linha 3: Marca e Modelo */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ex: Dell, Cisco, Flexform..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Modelo
              </label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ex: Optiplex, RV260W, Plus..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Linha 4: Descrição do Item */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Descrição do Item <span className="text-indigo-400">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleVoiceDesc}
                  title="Falar descrição por voz"
                  className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isListeningDesc 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Mic className="w-2.5 h-2.5" />
                  <span>{isListeningDesc ? 'Ouvindo...' : 'Falar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchAiPhotos}
                  title="Buscar fotos com IA"
                  className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  <span>Foto IA</span>
                </button>
              </div>
            </div>

            <textarea
              required
              rows={2}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              onBlur={handleDescricaoBlur}
              placeholder="Ex: Cadeira Executiva Estofada FLEXFORM, Monitor Dell UltraSharp..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Linha 5: Local Físico e Depreciação */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>Local Físico</span>
                </label>
                <button
                  type="button"
                  onClick={handleVoiceLoc}
                  title="Falar localização por voz"
                  className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isListeningLoc 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Mic className="w-2.5 h-2.5" />
                  <span>{isListeningLoc ? 'Ouvindo...' : 'Falar'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                placeholder="Ex: Sala de Reuniões, Bancada 02..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Depreciação
              </label>
              <input
                type="text"
                value={formData.depreciacao}
                onChange={(e) => setFormData({ ...formData, depreciacao: e.target.value })}
                placeholder="Ex: 90.0%"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          {/* Linha 6: Na Carga ou Não (Segmented Toggle Compacto) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status na Carga:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, naCarga: true })}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  formData.naCarga
                    ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Na Carga</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, naCarga: false })}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  !formData.naCarga
                    ? 'bg-amber-600/30 text-amber-200 border-amber-500 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Fora da Carga</span>
              </button>
            </div>
          </div>

          {/* Linha 7: Observações e Foto (Compacto) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                OBS / Observações
              </label>
              <input
                type="text"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Detalhes ou conservação..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Link da Foto (ou IA)
              </label>
              <input
                type="url"
                value={formData.foto}
                onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-1.5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{assetToEdit ? 'Salvar Alterações (Enter)' : 'Cadastrar Item (Enter)'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
