# LYNN Studio — Capacidades para agentes

Apresentação em português, com 10 slides, para alinhamento executivo e kick-off do piloto de geração assistida de tools e MCPs. Conteúdo de referência: 21/10/2026.

Revisada considerando as 28 páginas do anexo **Arquitetura LYNN Agent Engine** (V2). A tese passa a ser a criação de capacidades compatíveis com execução assíncrona e durável pelo Tool Service. As notas dos slides registram as fontes por página, as lacunas de contrato e os critérios propostos.

Principais ajustes: pacote com contrato/adaptador versionados, integração e manifesto de teste; consulta ponta a ponta como gate nas semanas 1–2; testes de isolamento, redelivery e recuperação; distinção entre outbox do Engine e efeitos no ERP; catálogo/publicação tratados como escopo a definir. A decisão final separa ganho da esteira, contribuição do REA e prontidão operacional na V2. As seis semanas não incluem a construção integral do Engine.

## Abrir

Abra `index.html` no navegador, mantendo os arquivos CSS/JavaScript e a pasta `assets` junto ao HTML. Para obter um único HTML autocontido:

```sh
npm run build
```

Abra `dist/index.html`. Esse arquivo incorpora CSS, JavaScript e imagens e funciona offline. Apenas os links de fontes levam a sites externos. O projeto não exige instalação de dependências.

Para servir localmente, use `npm run dev` e abra `http://127.0.0.1:4173`. Para conferir a versão autocontida, use `npm run preview` depois do build.

## Publicar na Vercel

Importe este diretório ou seu repositório como um projeto Vercel. A configuração `vercel.json` define:

- Framework: Other.
- Build Command: `npm run build`.
- Output Directory: `dist`.

A Vercel publicará apenas o HTML autocontido de `dist`. Não há backend nem variáveis de ambiente. A publicação ainda depende da importação e da execução do deploy na conta desejada.

Referência: [configuração de projeto da Vercel](https://vercel.com/docs/project-configuration).

## Apresentar e consultar

- Setas, Page Up e Page Down: navegar. Home e End: primeiro e último slide.
- I: índice. N: notas e fontes do slide. F: tela cheia. Esc: fechar painel.
- Em celular: leitura vertical do slide, botões de navegação e gesto horizontal para trocar de slide.
- Imprimir: gera os 10 slides em paisagem, com uma página por slide. Ative gráficos de fundo se o navegador não os preservar.
- Notas e fontes aprofundam o conteúdo sem acrescentar slides. O PDF de impressão contém a narrativa principal, sem os painéis de notas.

## Editar

`index.html` contém os slides e as notas em elementos `template.notes`. `styles.css` contém os layouts, modo de leitura móvel e impressão. `brand.css` aplica os logos originais fornecidos em `assets`. `deck.js` contém navegação, acessibilidade e ajuste de escala. `simulation.css` e `simulation.js` implementam a simulação do slide 6. Depois de editar, rode o build novamente.

Os anexos e a transcrição são fontes de contexto. O material apresenta uma proposta, não experimentos executados. Produtos participantes, alocações, seis semanas e meta de redução de 40% continuam sujeitos a definição e aceite.

## Simulação de REA no Protheus

O slide 6 mostra um notebook com três etapas interativas: rotina e fontes, investigação com REA e revisão da tool candidata. O recorte é FINA040 — Contas a Receber, do Protheus Financeiro. “Ampliar a tela” abre o protótipo em tamanho maior. Na impressão, aparece o contrato candidato.

A terceira etapa mostra o destino proposto no Tool Service, a referência a LYNN Secrets e o teste V2 pendente. A tela não apresenta uma execução real nem um Trace real.

A simulação usa dados fictícios e troca estados locais. Não executa REA ou Protheus nem afirma suporte comprovado a AdvPL/TL++. A referência a SE1 é evidência para análise, não acesso direto ao banco. “Tool Lab” é um nome ilustrativo.

O notebook foi gerado com a ferramenta integrada image_gen e salvo em `assets/notebook-rea.png`. O prompt completo está em `assets/notebook-rea.prompt.txt`. A tela é HTML editável. Os logos fornecidos foram preservados sem redesenho.
