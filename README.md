# The One Ring — A Journey Across Middle-earth

Uma landing page editorial em que o scroll é a linha do tempo de um filme. O vídeo
nunca toca: rolar para baixo avança os frames, rolar para cima volta.

React 19 · Vite 6 · TypeScript · GSAP 3.15 (ScrollTrigger, SplitText, ScrollToPlugin) · WebGL 1.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + bundle de produção
npm run preview  # serve o build
```

Requer Node 20.15+.

> **Viu uma versão “parada”?** Se o Windows estiver com *Configurações → Acessibilidade →
> Efeitos visuais → Efeitos de animação* desligado, o navegador reporta
> `prefers-reduced-motion: reduce` e o site entra, de propósito, na versão com movimento
> reduzido (sem trilha horizontal, sem parallax, sem cursor customizado). Para ver a
> experiência completa, ligue essa opção ou emule `no-preference` no DevTools
> (Rendering → Emulate CSS media feature).

---

## Sequência

| Seção | O que acontece |
|---|---|
| **Film** (`ScrollVideo` + `Hero`) | 600svh com palco sticky. Abertura “THE ONE RING”; o scroll controla o vídeo; 4 capítulos editoriais entram e saem; o último frame recebe a inscrição. |
| **The Journey** | Papel claro sobe sobre o último frame (clip-path + parallax). Grid de 12 colunas, números que contam, rota com um ponto dourado. |
| **Regions** | Desktop: scroll vertical → trilha horizontal (pin + `containerAnimation`); o papel escurece até Mordor. Mobile/reduced: pilha vertical. |
| **The Ring** | Pinado. Render em tempo real; a câmera aproxima, o anel gira, a luz vai de estúdio frio a fogo. O verso entra linha a linha. |
| **Specification** | Índice editorial: números grandes, linhas finas. |
| **Mordor** | A imagem abre de uma janela estreita; “MORDOR” mais largo que a tela; uma linha de calor que colapsa num ponto no escuro. |
| **Footer** | Índice, colofão e a marca cortada pela borda inferior. |

---

## Arquitetura

```
src/
  components/
    Navbar/          navbar + menu fullscreen (focus trap, Esc, inert)
    Hero/            composição de abertura (entrada por tempo)
    ScrollVideo/     seção do filme: vídeo, capítulos, timecode, cortina
    Journey/  Regions/  Ring/  Specs/  Mordor/  Footer/
    ScrollIndicator/ indicador lateral 01–05 + trilho de progresso
    Cursor/          cursor discreto (só ponteiro fino, sem reduced motion)
  hooks/
    useScrollVideo.ts   o motor do scrub
    useSurfaceTone.ts   navbar/indicador trocam de tom sobre papel ou tinta
    useMagnetic.ts  useMediaQuery.ts
  lib/
    gsap.ts     registro único de plugins
    reveal.ts   reveals reutilizáveis (linhas, caracteres, réguas, labels)
    media.ts    media queries compartilhadas por CSS e JS
    scroll.ts   navegação por âncora animada, com foco acompanhando
  data/         regions.ts, film.ts (capítulos calibrados), sections.ts
  styles/       globals.css (tokens, base, grão), typography.css
```

Cada componente cria suas animações dentro de `gsap.context()` (e `gsap.matchMedia()`
quando o layout muda por breakpoint) e reverte tudo no cleanup — ScrollTriggers,
SplitText e tweens. Nada que roda por frame passa por estado do React.

---

## O motor do scrub (`src/hooks/useScrollVideo.ts`)

```
scroll ──► progress ──► targetTime = duration × progress
                               │
gsap.ticker ── currentTime = lerp(currentTime, targetTime, smoothing)
                               │
                     um seek por vez, alinhado a um frame
```

1. **O scroll nunca escreve no vídeo.** O ScrollTrigger só registra o progresso; um único
   callback no `gsap.ticker` interpola e faz o seek. Escrever `currentTime` a cada evento
   de scroll enfileira seeks que o decoder não consegue honrar.
2. **Um seek em andamento por vez**, liberado no `seeked` (com watchdog de 250ms).
3. **Seeks caem em frames reais** (grade de 1/30s), um frame antes do fim.
4. O lerp é independente de frame-rate (60Hz e 120Hz se comportam igual).
5. `preload="metadata"` na primeira pintura; quando a página fica ociosa, passa a `auto`.
   O poster é o frame 0 do próprio arquivo, então a troca poster → vídeo é invisível.
6. iOS: um `play()/pause()` mudo no primeiro gesto destrava a pintura de frames.

### O vídeo é pré-processado

`public/videos/` é gerado a partir de `TheOneRing.mp4` (original com só 2 keyframes e o
`moov` no fim — inutilizável para scrub):

```bash
ffmpeg -i TheOneRing.mp4 -an -c:v libx264 -profile:v high -crf 22 \
  -g 5 -keyint_min 5 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart public/videos/one-ring.mp4

ffmpeg -i TheOneRing.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 24 \
  -g 5 -keyint_min 5 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart public/videos/one-ring-720.mp4

# posters = frame 0 de cada arquivo
ffmpeg -i public/videos/one-ring.mp4 -frames:v 1 -c:v libwebp -quality 78 public/images/poster.webp
ffmpeg -i public/videos/one-ring-720.mp4 -frames:v 1 -c:v libwebp -quality 78 public/images/poster-720.webp
```

Telas ≤ 900px recebem a versão 720p (escolhida uma vez, no mount).

### Calibragem dos capítulos

`CHAPTERS` em `src/data/film.ts` mapeia o progresso (0–1) para o que está na tela:

| Progresso | Filmagem |
|---|---|
| 0.00–0.07 | mapa vazio — o título de abertura fica aqui |
| 0.07–0.27 | o anel cai, pousa e fica deitado |
| 0.27–0.45 | fica de pé e começa a rolar |
| 0.45–0.70 | rola pelo mapa |
| 0.70–0.88 | o tom vermelho sobe perto de Mordor; o anel cai |
| 0.88–1.00 | em repouso, inscrição voltada para a câmera |

Se trocar o vídeo, refaça a partir de uma contact sheet:
`ffmpeg -i TheOneRing.mp4 -vf "fps=3,scale=320:-2,tile=6x5" -frames:v 1 sheet.png`

---

## Imagens

Não havia imagens no projeto. As das regiões e de Mordor são **recortes do mapa do
próprio filme**, extraídos com ffmpeg (ex.: `-ss 2.4 -vf crop=720:480:0:230`), e recebem o
tratamento de cor no CSS (quente, frio, palha, pedra, brasa). Passar o cursor sobre uma
imagem devolve a cor original.

### O anel

- Se existir `public/images/one-ring.png`, ele é usado (detectado em build-time no
  `vite.config.ts` — reinicie o dev server depois de adicionar).
- Senão, um **render WebGL em tempo real** (`src/components/Ring/ringRenderer.ts`):
  ray-marching de uma aliança de ouro polido, reflexão de estúdio, uma reflexão interna,
  AO e silhuetas suavizadas. Só renderiza perto da tela e reduz a resolução sozinho se
  os frames ficarem longos.
- Sem WebGL: um anel em CSS.

---

## Armadilhas do GSAP encontradas (e evitadas)

- **`invalidateOnRefresh` + `fromTo` com stagger**: após um `ScrollTrigger.refresh()`, só
  o primeiro alvo mantém o estado inicial. Use a flag apenas quando os *valores* do tween
  são funções (como o `x` da trilha horizontal); `start`/`end` em função já são
  reavaliados a cada refresh.
- **`transition: transform` no CSS de um alvo do GSAP** corrompe o valor final do tween.
  Hover em CSS vai num elemento interno.
- **GSAP ≥ 3.13 escreve `translate: none`** ao animar transforms: não centralize com a
  propriedade `translate` do CSS um elemento que o GSAP move.
- **Não anime `letter-spacing` em texto que quebra linha**: a linha extra some ao fim da
  animação e desloca todos os ScrollTriggers abaixo. O `revealChars` aproxima os
  caracteres com `transform`.
- **`matchMedia().add({ ... })`** só executa se *alguma* condição casar — por isso a
  coreografia do filme inclui `always: 'all'`.

---

## Acessibilidade

- `h1` real no hero; a camada de capítulos (que muda a cada frame) é `aria-hidden`, com o
  mesmo conteúdo numa lista para leitores de tela. Skip link “Skip the film”.
- Menu: `role="dialog"`, `aria-modal`, `inert` quando fechado, foco preso, `Esc` fecha e
  devolve o foco ao botão.
- Navegação por âncora anima o scroll e move o foco para a seção escolhida.
- `:focus-visible` em tudo que é interativo; contraste AA nas cores de texto.
- `prefers-reduced-motion: reduce`: o vídeo continua controlável pelo scroll (é o
  conteúdo), mas sem suavização; sem parallax, blur, trilha horizontal nem cursor
  customizado; textos aparecem com fade curto; o anel gira menos.

---

Projeto de estudo, não comercial. Inspirado em *The Lord of the Rings*, de J.R.R.
Tolkien; sem afiliação com o Tolkien Estate, Middle-earth Enterprises ou Warner Bros.
#   O n e R i n g L a n d i n g P a g e  
 