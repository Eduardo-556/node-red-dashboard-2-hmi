# node-red-dashboard-2-hmi

Build machine HMI screens for **Node-RED Dashboard 2.0** by dragging symbols onto a canvas. Wire one object (for example the output of `node-red-contrib-schneider-modbus-tags`) into the canvas and every symbol shows its own key. No SVG or Vue to write.

> **Status: prototype (0.0.x).** Two symbols (reel and tag) and the drag-and-drop editor. Not published to npm yet.

[Português](#português) · [English](#english)

---

## Português

### Como usa

1. Arraste o nó **hmi canvas** (categoria Dashboard 2) para o fluxo. Em **Show in**, escolha **Página inteira** (o canvas ocupa a página toda) ou **Grupo** (fica dentro de um grupo, como os outros widgets). Escolha também o tamanho da tela em pixels e o tema.
2. Monte a tela de um destes jeitos:
   - **Na janela do nó:** arraste os símbolos da barra para a tela. O botão **Tela cheia** abre o editor na tela toda.
   - **No próprio dashboard:** faça o Deploy e clique em **Editar no dashboard**. A página abre em outra aba, em modo de edição e com os valores reais. Arraste, mova, configure e clique em **Salvar e fazer Deploy**. Se o editor do Node-RED estiver aberto, ele avisa que o fluxo mudou no servidor; é só aceitar a atualização.
3. Clique num símbolo para escolher a chave do payload, posição, tamanho, rotação e opções do símbolo.
4. Ligue no canvas qualquer nó que mande um objeto, por exemplo `{ "rpm": 1450, "velocidade": 42.5 }`. Cada símbolo mostra a chave dele. As chaves vão se somando: uma mensagem só com `rpm` não apaga `velocidade`.
5. Para mandar um valor solto, use `msg.topic` como chave: `msg.topic = "temp"`, `msg.payload = 21.5`.

### Símbolos

| Símbolo | Mostra |
|---|---|
| Bobina | Ligada (valor ≠ 0, ou acima de um limite) ou parada. No tema Clássico ela gira. |
| Tag | Título, valor formatado e unidade. Com escala e faixa normal, mostra uma barra; fora da faixa, entra em alarme com indicador de prioridade. |

### Temas

- **ISA-101** (padrão): cinza e plano, cor só para condição anormal e alarme. Equipamento ligado fica cinza escuro, parado fica claro. O alarme usa cor, forma e número da prioridade.
- **Clássico**: escuro, no estilo dos painéis em SVG feitos à mão, com bobinas girando.

### Opções do canvas

| Opção | Para quê |
|---|---|
| Show in | Página inteira ou dentro de um grupo. |
| Screen | Tamanho da tela em pixels (o sistema de coordenadas dos símbolos). |
| Fit | **Caber na tela**: a tela inteira aparece sem rolar. **Largura toda**: ocupa a largura e a altura acompanha. |
| Offline after | Segundos sem dados até a tela esmaecer e mostrar SEM COMUNICAÇÃO (0 desliga). |
| Number format | Formato dos números, ex. `pt-BR` (1.450,5) ou `en-US` (1,450.5). |

### Exemplo

**Menu → Importar → Exemplos → node-red-dashboard-2-hmi → tela-basica**. Abre em `/dashboard/hmi`, ocupando a página inteira.

---

## English

1. Drop an **hmi canvas** node (Dashboard 2 category) into your flow. **Show in**: whole page (default) or a group. Pick the screen size in pixels and the theme.
2. Build the screen in the node's edit dialog (with a full-screen option), or deploy and click **Editar no dashboard** to edit it on the real dashboard page, with live values, then **Salvar e fazer Deploy**.
3. Click a symbol to set its payload key, position, size, rotation and options.
4. Wire any node that sends an object, e.g. `{ "rpm": 1450, "speed": 42.5 }`. Each symbol shows its key. Keys are merged, so a message with only `rpm` keeps `speed`. For a single value, use `msg.topic` as the key.

Themes: **ISA-101** (default; grey and flat, colour only for abnormal states and alarms, alarms coded by colour, shape and priority number) and **Classic** (dark, animated reels).

## Development

```
npm install
npm run build   # widget (resources/ui-hmi-canvas.umd.js) and editor library (resources/hmi-symbols.js)
npm test
```

The symbol library (`ui/symbols/`) and the editor (`ui/editor/`) are shared: the same code runs in the Node-RED dialog and on the dashboard page.

## License

MIT
