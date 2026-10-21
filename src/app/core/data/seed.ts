/**
 * Gerador de dados de demonstração — TODOS os dados são fictícios.
 * Usa um PRNG com semente fixa (resultado reprodutível) e datas relativas a "hoje",
 * para o dashboard sempre parecer atual.
 */
import { Lead, OrigemLead, PreferenciaContato, StatusLead } from '../models/lead.model';
import { Cambio, Categoria, Combustivel, StatusVeiculo, Veiculo } from '../models/veiculo.model';
import { diasAPartirDeHoje, diasEntre } from '../utils/datas';
import { tituloVeiculo } from '../utils/rotulos';

function mulberry32(semente: number) {
  let a = semente;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ModeloBase {
  marca: string;
  modelo: string;
  versoes: string[];
  categoria: Categoria;
  motor: string;
  precoNovo: number;
  cambios: Cambio[];
  combustiveis: Combustivel[];
  portas: number;
}

const MODELOS: ModeloBase[] = [
  { marca: 'Volkswagen', modelo: 'Polo', versoes: ['Highline', 'Comfortline', 'Track'], categoria: 'Hatch', motor: '1.0 TSI', precoNovo: 112_000, cambios: ['Automático', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Chevrolet', modelo: 'Onix', versoes: ['Premier', 'LTZ', 'LT'], categoria: 'Hatch', motor: '1.0 Turbo', precoNovo: 108_000, cambios: ['Automático', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Hyundai', modelo: 'HB20', versoes: ['Platinum', 'Comfort', 'Sense'], categoria: 'Hatch', motor: '1.0 TGDI', precoNovo: 104_000, cambios: ['Automático', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Fiat', modelo: 'Argo', versoes: ['Trekking', 'Drive'], categoria: 'Hatch', motor: '1.3 Firefly', precoNovo: 96_000, cambios: ['CVT', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Peugeot', modelo: '208', versoes: ['GT', 'Allure', 'Active'], categoria: 'Hatch', motor: '1.0 Turbo 200', precoNovo: 118_000, cambios: ['CVT', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Toyota', modelo: 'Corolla', versoes: ['Altis Hybrid', 'XEi', 'GLi'], categoria: 'Sedã', motor: '2.0 Dynamic Force', precoNovo: 178_000, cambios: ['CVT'], combustiveis: ['Flex', 'Híbrido'], portas: 4 },
  { marca: 'Honda', modelo: 'Civic', versoes: ['Touring', 'EXL'], categoria: 'Sedã', motor: '2.0 i-VTEC', precoNovo: 189_000, cambios: ['CVT'], combustiveis: ['Flex', 'Gasolina'], portas: 4 },
  { marca: 'Volkswagen', modelo: 'Virtus', versoes: ['Exclusive', 'Highline', 'Comfortline'], categoria: 'Sedã', motor: '1.4 TSI', precoNovo: 132_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Chevrolet', modelo: 'Onix Plus', versoes: ['Premier', 'LTZ'], categoria: 'Sedã', motor: '1.0 Turbo', precoNovo: 116_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Nissan', modelo: 'Versa', versoes: ['Exclusive', 'Advance', 'Sense'], categoria: 'Sedã', motor: '1.6 16V', precoNovo: 122_000, cambios: ['CVT', 'Manual'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Honda', modelo: 'City', versoes: ['Touring', 'EXL', 'EX'], categoria: 'Sedã', motor: '1.5 i-VTEC', precoNovo: 128_000, cambios: ['CVT'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Jeep', modelo: 'Compass', versoes: ['Limited', 'Longitude', 'Série S'], categoria: 'SUV', motor: '1.3 T270', precoNovo: 199_000, cambios: ['Automático'], combustiveis: ['Flex', 'Diesel'], portas: 4 },
  { marca: 'Jeep', modelo: 'Renegade', versoes: ['Longitude', 'Sport', 'Trailhawk'], categoria: 'SUV', motor: '1.3 T270', precoNovo: 152_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Hyundai', modelo: 'Creta', versoes: ['Ultimate', 'Limited', 'Comfort'], categoria: 'SUV', motor: '1.0 TGDI', precoNovo: 148_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Volkswagen', modelo: 'T-Cross', versoes: ['Highline', 'Comfortline', 'Sense'], categoria: 'SUV', motor: '1.4 TSI', precoNovo: 156_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Chevrolet', modelo: 'Tracker', versoes: ['Premier', 'LTZ', 'LT'], categoria: 'SUV', motor: '1.2 Turbo', precoNovo: 146_000, cambios: ['Automático'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Toyota', modelo: 'Corolla Cross', versoes: ['XRX Hybrid', 'XRE', 'XR'], categoria: 'SUV', motor: '2.0 Dynamic Force', precoNovo: 196_000, cambios: ['CVT'], combustiveis: ['Flex', 'Híbrido'], portas: 4 },
  { marca: 'Honda', modelo: 'HR-V', versoes: ['Touring', 'EXL', 'EX'], categoria: 'SUV', motor: '1.5 Turbo', precoNovo: 172_000, cambios: ['CVT'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'Nissan', modelo: 'Kicks', versoes: ['Exclusive', 'Advance'], categoria: 'SUV', motor: '1.6 16V', precoNovo: 138_000, cambios: ['CVT'], combustiveis: ['Flex'], portas: 4 },
  { marca: 'BYD', modelo: 'Dolphin', versoes: ['GS', 'Plus'], categoria: 'Hatch', motor: 'Elétrico 95 cv', precoNovo: 149_000, cambios: ['Automático'], combustiveis: ['Elétrico'], portas: 4 },
  { marca: 'Toyota', modelo: 'Hilux', versoes: ['SRX', 'SRV', 'SR'], categoria: 'Picape', motor: '2.8 Turbodiesel', precoNovo: 289_000, cambios: ['Automático'], combustiveis: ['Diesel'], portas: 4 },
  { marca: 'Fiat', modelo: 'Toro', versoes: ['Ultra', 'Volcano', 'Freedom'], categoria: 'Picape', motor: '1.3 T270', precoNovo: 168_000, cambios: ['Automático'], combustiveis: ['Flex', 'Diesel'], portas: 4 },
  { marca: 'Chevrolet', modelo: 'S10', versoes: ['High Country', 'LTZ', 'LT'], categoria: 'Picape', motor: '2.8 Turbodiesel', precoNovo: 278_000, cambios: ['Automático'], combustiveis: ['Diesel'], portas: 4 },
  { marca: 'Ford', modelo: 'Ranger', versoes: ['Limited', 'XLT', 'XLS'], categoria: 'Picape', motor: '2.0 Bi-Turbo', precoNovo: 292_000, cambios: ['Automático'], combustiveis: ['Diesel'], portas: 4 },
  { marca: 'Fiat', modelo: 'Strada', versoes: ['Ranch', 'Volcano', 'Freedom'], categoria: 'Picape', motor: '1.3 Firefly', precoNovo: 112_000, cambios: ['CVT', 'Manual'], combustiveis: ['Flex'], portas: 2 },
];

export const CORES: { nome: string; hex: string; peso: number }[] = [
  { nome: 'Branco', hex: '#ECEEF1', peso: 5 },
  { nome: 'Preto', hex: '#22242A', peso: 4 },
  { nome: 'Prata', hex: '#A9AEB6', peso: 4 },
  { nome: 'Cinza', hex: '#5A6069', peso: 4 },
  { nome: 'Vermelho', hex: '#A3161D', peso: 2 },
  { nome: 'Azul', hex: '#24467F', peso: 2 },
  { nome: 'Verde', hex: '#3E5A48', peso: 1 },
  { nome: 'Bege', hex: '#C8B48E', peso: 1 },
];

const OPCIONAIS_COMUNS = [
  'Ar-condicionado digital', 'Direção elétrica', 'Central multimídia', 'Android Auto / Apple CarPlay',
  'Câmera de ré', 'Sensor de estacionamento', 'Piloto automático', 'Rodas de liga leve',
  'Bancos em couro', 'Chave presencial', 'Partida por botão', 'Carregador por indução',
  'Faróis full LED', 'Controle de estabilidade', '6 airbags', 'Retrovisores rebatíveis',
];
const OPCIONAIS_SUV = ['Teto solar panorâmico', 'Porta-malas elétrico', 'Frenagem autônoma', 'Alerta de ponto cego'];
const OPCIONAIS_PICAPE = ['Capota marítima', 'Tração 4x4', 'Protetor de caçamba', 'Estribo lateral', 'Engate'];

/** Sugestões exibidas no formulário administrativo de opcionais. */
export const SUGESTOES_OPCIONAIS = [...OPCIONAIS_COMUNS, ...OPCIONAIS_SUV, ...OPCIONAIS_PICAPE];

/** Marcas já cadastradas — alimentam o <datalist> do formulário. */
export const MARCAS_CONHECIDAS = ['BYD', 'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Mitsubishi', 'Nissan', 'Peugeot', 'Renault', 'Toyota', 'Volkswagen'];

const NOMES = ['Ana', 'Bruno', 'Camila', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Paula', 'Rafael', 'Sabrina', 'Thiago', 'Vanessa', 'Wesley', 'Juliana', 'Lucas', 'Mariana', 'Gustavo', 'Letícia', 'Rodrigo'];
const SOBRENOMES = ['Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Ferreira', 'Gomes', 'Lima', 'Machado', 'Nogueira', 'Oliveira', 'Pereira', 'Ribeiro', 'Santos', 'Teixeira', 'Vieira', 'Rocha', 'Moreira', 'Campos'];

const MENSAGENS = [
  'Olá! Ainda está disponível? Gostaria de agendar um test drive.',
  'Vocês aceitam meu carro como parte do pagamento?',
  'Qual a menor taxa de financiamento para 48 parcelas?',
  'Tenho interesse. Podem me ligar no fim da tarde?',
  'O carro tem manual e chave reserva?',
  'Consigo uma condição melhor pagando à vista?',
  'Gostaria de ver o carro no sábado de manhã.',
];

export interface DadosIniciais {
  veiculos: Veiculo[];
  leads: Lead[];
}

export function gerarDadosIniciais(): DadosIniciais {
  const rnd = mulberry32(2026);
  const inteiro = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
  const escolher = <T>(lista: readonly T[]): T => lista[Math.floor(rnd() * lista.length)];
  const embaralhar = <T>(lista: T[]): T[] => {
    const c = [...lista];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const corPonderada = () => {
    const total = CORES.reduce((s, c) => s + c.peso, 0);
    let r = rnd() * total;
    return CORES.find((c) => (r -= c.peso) < 0) ?? CORES[0];
  };

  const placas = new Set<string>();
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const novaPlaca = (): string => {
    let p: string;
    do {
      p = `${escolher([...'BCDEFGQ'])}${escolher([...letras])}${escolher([...letras])}${inteiro(0, 9)}${escolher([...letras])}${inteiro(10, 99)}`;
    } while (placas.has(p));
    placas.add(p);
    return p;
  };

  const anoAtual = new Date().getFullYear();
  const TOTAL = 46;
  const veiculos: Veiculo[] = [];

  for (let i = 0; i < TOTAL; i++) {
    const base = MODELOS[i % MODELOS.length];
    const idade = inteiro(0, 7);
    const anoFabricacao = anoAtual - idade;
    const anoModelo = idade > 0 && rnd() > 0.5 ? anoFabricacao + 1 : anoFabricacao;
    const km = idade === 0 ? inteiro(800, 9_000) : idade * inteiro(9_000, 16_000) + inteiro(0, 6_000);
    const depreciacao = Math.pow(0.9, idade) * (1 - Math.min(km, 160_000) / 900_000);
    const preco = Math.max(Math.round((base.precoNovo * depreciacao) / 1000) * 1000 - 10, 39_990);
    const cor = corPonderada();
    const opcionaisExtras =
      base.categoria === 'SUV' ? OPCIONAIS_SUV : base.categoria === 'Picape' ? OPCIONAIS_PICAPE : [];
    const opcionais = embaralhar([...OPCIONAIS_COMUNS, ...opcionaisExtras]).slice(0, inteiro(5, 10));
    const versao = escolher(base.versoes);

    veiculos.push({
      id: `v${String(i + 1).padStart(3, '0')}`,
      marca: base.marca,
      modelo: base.modelo,
      versao,
      categoria: base.categoria,
      anoFabricacao,
      anoModelo,
      km,
      preco,
      cambio: escolher(base.cambios),
      combustivel: escolher(base.combustiveis),
      cor: cor.nome,
      corHex: cor.hex,
      placa: novaPlaca(),
      portas: base.portas,
      motor: base.motor,
      opcionais,
      descricao:
        `${base.marca} ${base.modelo} ${versao} ${anoFabricacao}/${anoModelo}, ${cor.nome.toLowerCase()}, ` +
        `revisado e com laudo cautelar aprovado. Único dono, manual e chave reserva. ` +
        `Aceitamos seu usado na troca e financiamos em até 60x.`,
      destaque: false,
      status: 'disponivel',
      dataEntrada: diasAPartirDeHoje(-inteiro(2, 110)).toISOString(),
    });
  }

  // Vendas distribuídas nos últimos 6 meses (algumas no mês corrente) e algumas reservas.
  const hoje = new Date();
  const embaralhados = embaralhar(veiculos);
  const vendidos = embaralhados.slice(0, 14);
  vendidos.forEach((v, idx) => {
    const diasAtras = idx < 4 ? inteiro(0, Math.max(hoje.getDate() - 1, 0)) : inteiro(hoje.getDate(), 175);
    const dataVenda = diasAPartirDeHoje(-diasAtras, 15);
    v.status = 'vendido';
    v.dataVenda = dataVenda.toISOString();
    v.precoVenda = v.preco - inteiro(0, 4) * 500;
    v.dataEntrada = diasAPartirDeHoje(-(diasAtras + inteiro(8, 70))).toISOString();
  });
  embaralhados.slice(14, 18).forEach((v) => (v.status = 'reservado' as StatusVeiculo));
  embaralhados
    .slice(18)
    .sort((a, b) => b.anoModelo - a.anoModelo)
    .slice(0, 8)
    .forEach((v) => (v.destaque = true));

  // Leads
  const ativos = veiculos.filter((v) => v.status !== 'vendido');
  const statusPossiveis: StatusLead[] = ['novo', 'novo', 'novo', 'em-contato', 'em-contato', 'proposta', 'fechado', 'perdido'];
  const origens: OrigemLead[] = ['site', 'site', 'whatsapp', 'telefone', 'loja'];
  const preferencias: PreferenciaContato[] = ['whatsapp', 'telefone', 'email'];

  const leads: Lead[] = Array.from({ length: 26 }, (_, i) => {
    const nome = `${escolher(NOMES)} ${escolher(SOBRENOMES)}`;
    const status = escolher(statusPossiveis);
    const diasAtras = status === 'novo' ? inteiro(0, 6) : inteiro(3, 40);
    const veiculo = status === 'fechado' ? escolher(vendidos) : escolher(ativos);
    const criadoEm = diasAPartirDeHoje(-diasAtras, inteiro(8, 19)).toISOString();
    const usuarioEmail = nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(' ', '.');
    return {
      id: `l${String(i + 1).padStart(3, '0')}`,
      veiculoId: veiculo.id,
      veiculoTitulo: tituloVeiculo(veiculo),
      nome,
      telefone: `(16) 9${inteiro(8000, 9999)}-${inteiro(1000, 9999)}`,
      email: `${usuarioEmail}@exemplo.com`,
      mensagem: escolher(MENSAGENS),
      preferencia: escolher(preferencias),
      origem: escolher(origens),
      status,
      criadoEm,
      atualizadoEm: diasAPartirDeHoje(-Math.max(diasAtras - inteiro(0, 3), 0)).toISOString(),
    };
  }).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  // Garantia: nenhum lead "novo" mais antigo que o veículo.
  leads.forEach((l) => {
    const v = veiculos.find((x) => x.id === l.veiculoId);
    if (v && diasEntre(v.dataEntrada, l.criadoEm) < 0) l.criadoEm = v.dataEntrada;
  });

  return { veiculos, leads };
}
