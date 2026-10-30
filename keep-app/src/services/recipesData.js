// Receitas do app. Para trocar pelos textos oficiais do projeto, basta editar este arquivo.
// Cada ingrediente tem `keywords`: palavras que, se aparecerem no nome de um produto da
// despensa (sem acento/maiúscula), marcam o ingrediente como "disponível".
// Sal, água e temperos básicos ficam só no modo de preparo (não entram na comparação).
const ing = (id, name, ...keywords) => ({ id, name, keywords: keywords.length ? keywords : [name] });

const RECIPES = [
  {
    id: 'r1',
    title: 'Omelete de queijo e tomate',
    tempoPreparo: 10,
    rating: 4,
    description: 'Café da manhã ou jantar rápido, pronto em poucos minutos e com poucos ingredientes.',
    modoPreparo:
      '1. Bata os ovos com uma pitada de sal.\n2. Corte o tomate em cubos pequenos e o queijo em fatias finas.\n3. Aqueça uma frigideira antiaderente com um fio de óleo e despeje os ovos.\n4. Quando começar a firmar, distribua o queijo e o tomate sobre metade da omelete.\n5. Dobre ao meio, deixe mais 1 minuto e sirva quente.',
    ingredients: [ing('i1', '3 ovos', 'ovo'), ing('i2', '1 tomate', 'tomate'), ing('i3', '3 fatias de queijo', 'queijo', 'mussarela', 'muçarela'), ing('i4', 'Óleo ou azeite', 'óleo', 'azeite')],
  },
  {
    id: 'r2',
    title: 'Arroz e feijão caseiro',
    tempoPreparo: 50,
    rating: 5,
    description: 'O clássico brasileiro do dia a dia: arroz soltinho e feijão com tempero de alho e cebola.',
    modoPreparo:
      '1. Deixe o feijão de molho por 8 horas (ou use a pressão sem molho) e cozinhe até ficar macio.\n2. Refogue metade do alho e da cebola picados no óleo, junte o feijão com o caldo e tempere com sal.\n3. Em outra panela, refogue o restante do alho e da cebola, acrescente o arroz lavado e frite por 1 minuto.\n4. Cubra com água quente (duas medidas de água para uma de arroz), tampe e cozinhe em fogo baixo por cerca de 15 minutos.\n5. Deixe descansar tampado por 5 minutos e sirva.',
    ingredients: [ing('i1', '1 xícara de arroz', 'arroz'), ing('i2', '1 xícara de feijão', 'feijão', 'feijao'), ing('i3', '1 cebola', 'cebola'), ing('i4', '3 dentes de alho', 'alho'), ing('i5', 'Óleo', 'óleo')],
  },
  {
    id: 'r3',
    title: 'Macarrão ao molho de tomate',
    tempoPreparo: 25,
    rating: 4,
    description: 'Massa com molho caseiro simples, ótima para aproveitar tomates maduros.',
    modoPreparo:
      '1. Cozinhe o macarrão em água fervente com sal até ficar al dente e escorra.\n2. Refogue a cebola e o alho no azeite até dourar.\n3. Acrescente os tomates picados sem a pele, tampe e cozinhe em fogo baixo por 10 minutos, mexendo de vez em quando.\n4. Tempere com sal e pimenta e, se quiser, uma pitada de açúcar para tirar a acidez.\n5. Misture o molho ao macarrão e finalize com queijo ralado.',
    ingredients: [ing('i1', '250 g de macarrão', 'macarrão', 'macarrao', 'espaguete', 'penne'), ing('i2', '4 tomates maduros', 'tomate'), ing('i3', '1 cebola', 'cebola'), ing('i4', '2 dentes de alho', 'alho'), ing('i5', 'Azeite', 'azeite', 'óleo'), ing('i6', 'Queijo ralado (opcional)', 'queijo')],
  },
  {
    id: 'r4',
    title: 'Frango grelhado com legumes',
    tempoPreparo: 35,
    rating: 4,
    description: 'Refeição leve e completa, com peito de frango suculento e legumes salteados.',
    modoPreparo:
      '1. Tempere os filés de frango com suco de limão, alho amassado e sal e deixe por 15 minutos.\n2. Corte a cenoura em rodelas e o brócolis em buquês; cozinhe no vapor por 5 minutos.\n3. Grelhe o frango em frigideira quente com um fio de azeite, 5 minutos de cada lado.\n4. Salteie os legumes na mesma frigideira por 2 minutos para pegar sabor.\n5. Sirva o frango com os legumes e um pouco de limão por cima.',
    ingredients: [ing('i1', '2 filés de peito de frango', 'frango', 'peito de frango'), ing('i2', '1 limão', 'limão', 'limao'), ing('i3', '2 dentes de alho', 'alho'), ing('i4', '2 cenouras', 'cenoura'), ing('i5', '1 maço de brócolis', 'brócolis', 'brocolis'), ing('i6', 'Azeite', 'azeite', 'óleo')],
  },
  {
    id: 'r5',
    title: 'Panqueca de queijo e presunto',
    tempoPreparo: 30,
    rating: 4,
    description: 'Massa fininha que rende bem e aceita o recheio que você tiver em casa.',
    modoPreparo:
      '1. No liquidificador, bata 1 xícara de leite, 1 xícara de farinha de trigo, 2 ovos e uma pitada de sal até ficar homogêneo.\n2. Aqueça uma frigideira antiaderente untada e despeje uma concha da massa, espalhando bem.\n3. Doure dos dois lados e reserve; repita com o restante.\n4. Recheie cada panqueca com queijo e presunto e enrole.\n5. Leve ao fogo baixo por 2 minutos para o queijo derreter.',
    ingredients: [ing('i1', '1 xícara de leite', 'leite'), ing('i2', '1 xícara de farinha de trigo', 'farinha'), ing('i3', '2 ovos', 'ovo'), ing('i4', 'Queijo fatiado', 'queijo', 'mussarela', 'muçarela'), ing('i5', 'Presunto', 'presunto')],
  },
  {
    id: 'r6',
    title: 'Vitamina de banana com aveia',
    tempoPreparo: 5,
    rating: 5,
    description: 'Ideal para aproveitar bananas muito maduras antes que estraguem.',
    modoPreparo:
      '1. Descasque as bananas e coloque no liquidificador.\n2. Acrescente o leite gelado, a aveia e o mel.\n3. Bata por cerca de 1 minuto até ficar cremoso.\n4. Sirva na hora, com gelo se preferir.',
    ingredients: [ing('i1', '2 bananas maduras', 'banana'), ing('i2', '2 copos de leite', 'leite'), ing('i3', '2 colheres de aveia', 'aveia'), ing('i4', 'Mel (opcional)', 'mel')],
  },
  {
    id: 'r7',
    title: 'Salada de frutas',
    tempoPreparo: 15,
    rating: 4,
    description: 'Sobremesa fresca que aproveita as frutas da semana, antes de passarem do ponto.',
    modoPreparo:
      '1. Lave bem todas as frutas.\n2. Corte a maçã, a banana e o mamão em cubos e retire os gomos da laranja.\n3. Misture tudo em uma tigela com o suco de laranja.\n4. Leve à geladeira por 30 minutos e sirva gelada.',
    ingredients: [ing('i1', '1 maçã', 'maçã', 'maca'), ing('i2', '1 banana', 'banana'), ing('i3', '1/2 mamão', 'mamão', 'mamao'), ing('i4', '2 laranjas', 'laranja')],
  },
  {
    id: 'r8',
    title: 'Sanduíche natural',
    tempoPreparo: 10,
    rating: 3,
    description: 'Lanche rápido e leve com recheio de queijo, presunto e salada.',
    modoPreparo:
      '1. Passe uma camada fina de requeijão ou maionese em duas fatias de pão.\n2. Monte com queijo, presunto, folhas de alface e rodelas de tomate.\n3. Feche o sanduíche, corte ao meio e sirva.',
    ingredients: [ing('i1', '2 fatias de pão', 'pão', 'pao', 'pão de forma'), ing('i2', 'Queijo', 'queijo', 'mussarela', 'muçarela'), ing('i3', 'Presunto', 'presunto'), ing('i4', 'Alface', 'alface'), ing('i5', '1 tomate', 'tomate')],
  },
  {
    id: 'r9',
    title: 'Sopa de legumes',
    tempoPreparo: 40,
    rating: 4,
    description: 'Sopa quentinha e nutritiva, perfeita para usar legumes que estão perto de vencer.',
    modoPreparo:
      '1. Descasque e corte a batata, a cenoura e a abobrinha em cubos.\n2. Refogue a cebola e o alho no azeite até dourar.\n3. Junte os legumes, cubra com água e cozinhe por 25 minutos, até ficarem macios.\n4. Tempere com sal e pimenta; bata parte da sopa no liquidificador se quiser um caldo mais cremoso.\n5. Sirva quente, com um fio de azeite.',
    ingredients: [ing('i1', '2 batatas', 'batata'), ing('i2', '2 cenouras', 'cenoura'), ing('i3', '1 abobrinha', 'abobrinha'), ing('i4', '1 cebola', 'cebola'), ing('i5', '2 dentes de alho', 'alho'), ing('i6', 'Azeite', 'azeite', 'óleo')],
  },
  {
    id: 'r10',
    title: 'Bolo de cenoura',
    tempoPreparo: 55,
    rating: 5,
    description: 'Bolo fofinho de liquidificador, um clássico para o lanche da tarde.',
    modoPreparo:
      '1. Pré-aqueça o forno a 180 °C e unte uma forma.\n2. No liquidificador, bata 3 cenouras picadas, 3 ovos, 1/2 xícara de óleo e 2 xícaras de açúcar.\n3. Passe a mistura para uma tigela e acrescente 2 e 1/2 xícaras de farinha de trigo, mexendo bem.\n4. Adicione 1 colher (sopa) de fermento e misture delicadamente.\n5. Asse por cerca de 40 minutos, até que o palito saia limpo.\n6. Se quiser, cubra com calda de chocolate.',
    ingredients: [ing('i1', '3 cenouras', 'cenoura'), ing('i2', '3 ovos', 'ovo'), ing('i3', '2 xícaras de açúcar', 'açúcar', 'acucar'), ing('i4', '2 1/2 xícaras de farinha de trigo', 'farinha'), ing('i5', 'Óleo', 'óleo'), ing('i6', 'Fermento em pó', 'fermento')],
  },
];

export default RECIPES;
