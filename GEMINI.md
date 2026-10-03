# Diretrizes do Projeto: Carga Patrimônio

## Regras de Sincronização com Git / GitHub

1. **Atualizar o GitHub (`upload do PC para o Git`):**
   - Quando o usuário disser *"atualize o github"*, *"suba para o git"*, *"envie pro github"* ou similar:
   - Executar de forma direta e combinada em um único comando:
     `git add -A; git commit -m "update: sincronizacao automatica"; git push`
   - Se houver mensagem específica de commit informada pelo usuário, utilize-a no lugar de `"update: sincronizacao automatica"`.

2. **Atualizar o PC Local (`download do Git para o PC`):**
   - Quando o usuário disser *"atualize o pc local com o que está no git"*, *"puxe do github"*, *"atualize do git"* ou similar:
   - Executar de forma direta e combinada em um único comando:
     `git fetch --all --prune; git pull`

3. **Execução Direta:**
   - Execute os comandos sem quebrar em múltiplos passos intermediários para evitar pedidos desnecessários de confirmação.
