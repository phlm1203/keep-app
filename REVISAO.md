# Revisão e otimizações aplicadas

- Corrigido `quantity || 1` para `quantity ?? 1`, preservando valores zero no mapeamento (a validação de quantidade ainda deve ocorrer no formulário e banco).
- Respostas nulas de consultas de produtos e perdas passam a produzir listas vazias.
- Consulta de código de barras verifica o status HTTP antes de ler JSON.
- Provider da despensa deixa de ficar carregando indefinidamente sem usuário e limpa dados locais nessa situação.
- Estatísticas da despensa calculadas em uma única passagem.
- Configuração do Supabase exige URL HTTPS e valores não-placeholder.

## Pontos que ainda exigem validação

- Testar autenticação, CRUD, fotos, notificações e fluxo de convidado em aparelho real.
- Revisar políticas RLS e permissões do bucket no Supabase antes de produção.
- O armazenamento do convidado é em memória e não persiste ao fechar o aplicativo.
- Não foram executados testes de integração com Supabase nem build Expo neste ambiente.
- Arquivos originais não relacionados às alterações foram preservados.
