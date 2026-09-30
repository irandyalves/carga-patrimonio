# 📦 CargaPatrimônio — Sistema Online de Gestão & Conferência de Patrimônio

Sistema moderno, responsivo e em tempo real para controle, auditoria e conferência de carga patrimonial para **10 setores e 10 responsáveis**, dimensionado para centenas a milhares de itens.

---

## 🚀 Principais Funcionalidades

### 1. 🏢 Gestão Setorial (10 Setores & 10 Responsáveis)
- Cada responsável tem visão imediata da **sua própria carga**.
- **Detecção de Bens de Outros Setores (Sobras):** Ao escanear ou localizar um bem de outra seção, o sistema exibe imediatamente um aviso informando o **setor proprietário e o responsável oficial**, com botão para **Transferência de Carga**.

### 2. 🛡️ Conferência / Inventário com Trava Anti-Desmarque Involuntário
- **Auditoria Rápida em Cards:** Ticar/conferir o bem com 1 clique registra instantaneamente a data, hora e o nome do conferente.
- **Trava de Segurança:** Para evitar toques acidentais em dispositivos móveis, o desmarque de um item já conferido **exige confirmação expressa**.
- **Banner de Status:** Exibição da data e responsável no topo de cada card auditado.
- **Barra de Progresso:** Percentual em tempo real de itens conferidos por setor com relatório de inventário em PDF.

### 3. 🎙️ Busca Multimodal (Texto, Voz e Câmera)
- **Busca por Voz em Português (pt-BR):** Clique no ícone de microfone e fale o número ou descrição (ex: *"1002"* ou *"Notebook Dell"*).
- **Leitor de Câmera (QR Code & Código de Barras):** Scanner de alta velocidade compatível com câmera traseira do smartphone e bipe sonoro de confirmação.

### 4. 🤝 Módulo de Empréstimos & Cautelas Online
- Emissão de termos de responsabilidade e cautela com dados completos do recebedor (nome, matrícula, contato, setor de destino, prazo).
- **Geração Instantânea de Termo de Cautela em PDF** pronto para assinatura física ou digital, acompanhado de QR Code individual.
- Controle de status: *Em Aberto*, *Atrasados* e *Devolvidos*, com botão de devolução rápida.

### 5. 🗄️ Módulo de Baixa Patrimonial com Documentação
- Registro de baixa por quebra, obsolescência, doação, leilão, extravio ou descarte ecológico.
- Campo rico para observações e parecer técnico.
- Anexo de múltiplos arquivos comprobatórios (**PDF, Word, Excel, laudos técnicos e fotos**) salvos no Firebase Storage.

### 6. 🏷️ Gerador de Folha de Etiquetas em PDF
- Geração de etiquetas em Folha A4 com QR Code de alta resolução, logotipo institucional, código do patrimônio, setor e descrição.

### 7. 📊 Importação e Exportação Excel (.xlsx / .csv)
- Importação em massa para alimentar a base de até 1.000 itens ou mais em segundos.
- Exportação da base completa e relatórios gerenciais para prestação de contas.

### 8. ☁️ Conexão Firebase (Firestore & Storage)
- Suporta conexão direta com **Firebase Firestore** e **Firebase Storage** ou operação em modo local persistente.
- Configuração simplificada pelo modal no cabeçalho do sistema.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **Vite** + **Tailwind CSS v4**
- **Lucide Icons**
- **Firebase SDK** (Firestore & Storage)
- **Html5-Qrcode** (Leitor de Câmera Mobile/PC)
- **Web Speech API** (Reconhecimento de Voz em PT-BR)
- **jsPDF & jsPDF-AutoTable** (Geração de Termos e Relatórios)
- **QRCode Generator**
- **SheetJS (xlsx)** (Importação/Exportação de Planilhas)
- **Canvas-Confetti** (Feedback visual de meta batida)

---

## 💻 Como Rodar o Projeto Localmente

```bash
# 1. Instalar dependências (já instaladas neste diretório)
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Gerar build de produção
npm run build
```

---

## 🌐 Conectar ao seu Firebase

1. Acesse o **[Firebase Console](https://console.firebase.google.com/)**.
2. Crie ou selecione o seu projeto.
3. Ative o **Firestore Database** e o **Firebase Storage**.
4. Em *Configurações do Projeto* > *Geral*, copie o objeto de configuração Web.
5. No sistema, clique no ícone de **Banco de Dados (Firebase)** no cabeçalho e cole suas chaves.

---

## 🐙 Publicação no GitHub

Para publicar no seu GitHub:
```bash
git init
git add .
git commit -m "feat: Sistema de Carga e Patrimonio completo com 10 setores, cautelas, voz e QR code"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```
