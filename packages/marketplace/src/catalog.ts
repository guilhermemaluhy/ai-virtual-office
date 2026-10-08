/** Product templates used by the simulated store: category → [name, typical unit cost in BRL]. */
export const CATALOG_TEMPLATES: readonly {
  category: string;
  items: readonly (readonly [name: string, costBrl: number])[];
}[] = [
  {
    category: 'Casa e Cozinha',
    items: [
      ['Jogo de Panelas Antiaderente 5 Peças', 120],
      ['Garrafa Térmica Inox 1L', 38],
      ['Organizador de Gaveta Modular', 18],
      ['Kit Potes Herméticos 10 Peças', 42],
      ['Escorredor de Louça Inox', 55],
      ['Tábua de Corte Bambu', 22],
      ['Mixer de Mão 400W', 75],
      ['Luminária de Mesa LED', 48],
    ],
  },
  {
    category: 'Eletrônicos',
    items: [
      ['Fone Bluetooth TWS', 45],
      ['Carregador Turbo USB-C 20W', 19],
      ['Cabo USB-C Reforçado 2m', 9],
      ['Caixa de Som Bluetooth à Prova d’Água', 70],
      ['Suporte Articulado para Celular', 16],
      ['Smartwatch Esportivo', 110],
      ['Hub USB 4 Portas', 24],
      ['Mouse Sem Fio Silencioso', 28],
    ],
  },
  {
    category: 'Pet Shop',
    items: [
      ['Cama Pet Lavável G', 60],
      ['Comedouro Duplo Inox', 25],
      ['Arranhador para Gatos com Torre', 95],
      ['Coleira Peitoral Ajustável', 20],
      ['Bebedouro Fonte Automática', 65],
      ['Brinquedo Mordedor Resistente', 11],
    ],
  },
  {
    category: 'Esporte e Lazer',
    items: [
      ['Tapete de Yoga Antiderrapante', 35],
      ['Kit Elásticos de Resistência', 22],
      ['Garrafa Squeeze 1L', 12],
      ['Corda de Pular com Contador', 15],
      ['Halter Emborrachado 5kg', 48],
      ['Mochila de Hidratação 2L', 58],
    ],
  },
  {
    category: 'Beleza e Cuidados',
    items: [
      ['Escova Secadora 1200W', 85],
      ['Kit Pincéis de Maquiagem 12 Peças', 26],
      ['Necessaire Organizadora', 17],
      ['Espelho de Mesa com LED', 40],
      ['Massageador Facial', 30],
    ],
  },
  {
    category: 'Ferramentas',
    items: [
      ['Parafusadeira a Bateria 12V', 140],
      ['Jogo de Chaves Combinadas 12 Peças', 65],
      ['Trena Laser 40m', 90],
      ['Kit Brocas 15 Peças', 23],
      ['Lanterna Tática Recarregável', 32],
      ['Alicate Universal Profissional', 27],
    ],
  },
];

export const VARIANTS: readonly string[] = ['Preto', 'Branco', 'Cinza', 'Azul', 'Rosa', 'Verde'];
