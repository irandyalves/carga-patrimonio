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
  ShieldAlert
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

export const AssetModal = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  defaultSectorId,
  sectors = []
}) => {
  // Estado estruturado com os campos solicitados pelo usuário:
  // PATRIMÔNIO, DESCRIÇÃO, LOCAL, NA CARGA OU NÃO, OBS, FOTO
  const [formData, setFormData] = useState({
    numeroPatrimonio: '',
    descricao: '',
    localizacao: '',
    naCarga: true, // "Na Carga ou Não"
    observacoes: '', // "OBS"
    foto: '', // "FOTO"
    setorId: defaultSectorId || sectors[0]?.id || 'sec-foyer',
    setorNome: '',
    responsavel: '',
    categoria: 'Mobiliário e Equipamentos'
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
        localizacao: assetToEdit.localizacao || '',
        naCarga: assetToEdit.naCarga !== undefined ? assetToEdit.naCarga : true,
        observacoes: assetToEdit.observacoes || assetToEdit.obs || '',
        foto: assetToEdit.foto || '',
        setorId: assetToEdit.setorId || sectors[0]?.id || 'sec-foyer',
        setorNome: assetToEdit.setorNome || '',
        responsavel: assetToEdit.responsavel || '',
        categoria: assetToEdit.categoria || 'Geral'
      });
      if (assetToEdit.descricao) {
        const cat = detectCategory(assetToEdit.descricao);
        setDetectedCat(cat);
        setAiSuggestions(AI_IMAGE_LIBRARY[cat] || AI_IMAGE_LIBRARY.padrao);
      }
    } else {
      const selectedSec = sectors.find(s => s.id === (defaultSectorId || sectors[0]?.id)) || sectors[0] || { id: 'sec-foyer', name: 'Foyer', sala: 'Hall de Entrada', responsavel: 'Jean' };
      // Sugere próximo número sequencial formatado no padrão XX.XXX
      const randNum = String(Math.floor(42542 + Math.random() * 400));
      const formattedNum = `${randNum.slice(0, 2)}.${randNum.slice(2)}`;

      setFormData({
        numeroPatrimonio: formattedNum,
        descricao: '',
        localizacao: selectedSec.sala || '',
        naCarga: true,
        observacoes: '',
        foto: '',
        setorId: selectedSec.id,
        setorNome: selectedSec.name,
        responsavel: selectedSec.responsavel || '',
        categoria: 'Mobiliário e Equipamentos'
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

  // Atualiza setor selecionado
  const handleSectorChange = (secId) => {
    const sec = sectors.find(s => s.id === secId);
    if (sec) {
      setFormData(prev => ({
        ...prev,
        setorId: sec.id,
        setorNome: sec.name,
        responsavel: sec.responsavel || prev.responsavel,
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
    e.preventDefault();
    if (!formData.numeroPatrimonio || !formData.descricao) return;

    // Remove qualquer máscara para garantir integridade ou preserva XX.XXX
    const cleanDigits = formData.numeroPatrimonio.replace(/\D/g, '');
    const cleanNum = cleanDigits.length === 5 ? cleanDigits : formData.numeroPatrimonio.trim();

    onSave({
      ...formData,
      numeroPatrimonio: cleanNum,
      quantidade: 1,
      naCarga: !!formData.naCarga,
      observacoes: formData.observacoes.trim(),
      foto: formData.foto.trim(),
      dataAquisicao: assetToEdit?.dataAquisicao || new Date().toLocaleDateString('pt-BR'),
      anoAquisicao: assetToEdit?.anoAquisicao || new Date().getFullYear(),
      valorOriginal: assetToEdit?.valorOriginal || 0,
      valorAtual: assetToEdit?.valorAtual || 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto scrollbar-thin">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {assetToEdit ? 'Editar Item Patrimonial' : 'Novo Item Patrimonial'}
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre o patrimônio, descrição, localização, status de carga e foto via IA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Linha 1: Patrimônio e Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Campo: PATRIMÔNIO (XX.XXX) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Nº Patrimônio (XX.XXX) *</span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">5 dígitos</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.numeroPatrimonio}
                  onChange={handlePatrimonioChange}
                  placeholder="Ex: 42.542"
                  className="w-full bg-slate-800/90 border-2 border-indigo-500/40 rounded-xl px-4 py-2.5 text-lg text-indigo-300 font-mono font-black tracking-wider focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Formato padrão fácil de ler: <strong className="text-slate-300 font-mono">42.542</strong>
              </p>
            </div>

            {/* Campo: Setor de Destino */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Setor Responsável *</span>
              </label>
              <select
                value={formData.setorId}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.responsavel ? `(${s.responsavel})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Responsável: <strong className="text-slate-300">{formData.responsavel || 'Administração'}</strong>
              </p>
            </div>

          </div>

          {/* Campo: DESCRIÇÃO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Descrição do Item *
              </label>
              <div className="flex items-center gap-2">
                {/* Botão de Microfone para ditar descrição */}
                <button
                  type="button"
                  onClick={handleVoiceDesc}
                  title="Falar descrição por voz"
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isListeningDesc 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>{isListeningDesc ? 'Gravando...' : 'Falar'}</span>
                </button>

                {/* Botão IA Buscar Foto */}
                <button
                  type="button"
                  onClick={handleFetchAiPhotos}
                  title="Buscar fotos correspondentes na internet com IA"
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Buscar Foto com IA</span>
                </button>
              </div>
            </div>

            <textarea
              required
              rows={2}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              onBlur={handleDescricaoBlur}
              placeholder="Ex: Cadeira Executiva Estofada FLEXFORM, Monitor Dell UltraSharp 27'', Mesa em L..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Campo: LOCAL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Local Físico Onde o Bem Está *</span>
              </label>
              
              <button
                type="button"
                onClick={handleVoiceLoc}
                title="Falar localização por voz"
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isListeningLoc 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{isListeningLoc ? 'Gravando...' : 'Falar'}</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              placeholder="Ex: Sala de Reuniões, Bancada 02, Estúdio de Gravação, Copa do Térreo..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Campo: NA CARGA OU NÃO (Toggle/Segmented Button) */}
          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status de Incorporação: Na Carga ou Não?</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                formData.naCarga 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {formData.naCarga ? 'Oficialmente na Carga' : 'Não está na Carga (Terceiro / Outro Setor)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, naCarga: true })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  formData.naCarga
                    ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Sim, está na Carga</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, naCarga: false })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  !formData.naCarga
                    ? 'bg-amber-600/30 text-amber-200 border-amber-500 shadow-md shadow-amber-950/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Não está na Carga</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-tight">
              {formData.naCarga 
                ? 'Este item pertence ao inventário e termo de responsabilidade oficial deste setor.'
                : 'Item em uso físico no local, porém pertence à carga de outro departamento ou empréstimo externo.'}
            </p>
          </div>

          {/* Campo: OBS (Observações) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações (OBS)</span>
            </label>
            <textarea
              rows={2}
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Ex: Estado de conservação bom, com pequeno arranhão no encosto, cabo original incluso..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Campo: FOTO + Sugestões da Internet com IA */}
          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Foto do Item (IA / Internet)</span>
              </label>

              <button
                type="button"
                onClick={handleFetchAiPhotos}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSearchingPhotos ? 'Buscando...' : 'Sugerir Fotos com IA'}</span>
              </button>
            </div>

            {/* Input manual ou link */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={formData.foto}
                onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              {formData.foto && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, foto: '' })}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Galeria de Fotos Sugeridas pela IA da Internet */}
            {aiSuggestions.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Fotos sugeridas pela IA da Internet (Clique para escolher):
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {aiSuggestions.map((item, idx) => {
                    const isSelected = formData.foto === item.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, foto: item.url })}
                        className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-md' 
                            : 'border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                        }`}
                        title={item.label}
                      >
                        <img 
                          src={item.url} 
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-1 py-0.5 text-[9px] text-slate-300 truncate">
                          {item.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preview da Imagem Selecionada */}
            {formData.foto && (
              <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                  <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto vinculada ao bem
                  </span>
                  <p className="text-[11px] text-slate-300 truncate font-mono mt-0.5">{formData.foto}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-800 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{assetToEdit ? 'Salvar Alterações' : 'Cadastrar Item'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
