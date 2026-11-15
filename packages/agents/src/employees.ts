import {
  AUTONOMY_LEVELS,
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLES,
  type AiModel,
  type AutonomyLevel,
  type EmployeeRole,
} from '@aivo/shared';

/**
 * Static definition of one of the six employees (docs/FUNCIONARIOS.md). Hiring an
 * employee copies this into the `employees` table; the owner can then change the
 * prompt, schedule, budget and autonomy in the database without a deploy.
 */
export interface EmployeeDefinition {
  /** Stable slug used as `employees.id`. */
  id: string;
  role: EmployeeRole;
  /** Persona name shown in the office. */
  name: string;
  title: string;
  model: AiModel;
  goal: string;
  /** Short description for the owner (plain Portuguese). */
  summary: string;
  /** Whether the role can ever write to the store (prices, listings, answers). */
  touchesStore: boolean;
  /** Highest autonomy level the role may ever reach (rule 4). */
  maxAutonomy: AutonomyLevel;
  /** Development phase in which the employee is hired. */
  phase: number;
  /** Cron expressions (America/Sao_Paulo) proposed for the first hire. */
  defaultSchedule: string[];
  /** Tools the role is allowed to use (least privilege, rule 9). Filled per phase. */
  allowedTools: string[];
}

const define = (
  partial: Omit<EmployeeDefinition, 'title'> & Partial<Pick<EmployeeDefinition, 'title'>>,
): EmployeeDefinition => ({ title: EMPLOYEE_ROLE_LABELS[partial.role], ...partial });

/** The six employees, in hiring order. */
export const EMPLOYEES: readonly EmployeeDefinition[] = [
  define({
    id: 'analista-estoque',
    role: 'analista_estoque',
    name: 'Helena',
    model: 'claude-haiku-5-5',
    goal: 'Manter o estoque certo: nem ruptura, nem produto parado.',
    summary:
      'Lê vendas e estoque no Bling por canal. Sugere a compra do estoque comum para 15 dias e a do Full para 45 dias, separada por marketplace e agrupada por fornecedor. Aponta candidatos a Full (12+ vendas em 30 dias no estoque comum), produtos parados e risco de ruptura.',
    touchesStore: false,
    maxAutonomy: 'simulacao',
    phase: 4,
    defaultSchedule: ['0 8 * * *', '0 17 * * *'],
    allowedTools: [
      'bling.produtos.ler',
      'bling.estoque.ler',
      'bling.pedidos.ler',
      'relatorio.gravar',
    ],
  }),
  define({
    id: 'gestor',
    role: 'gestor',
    name: 'Ricardo',
    model: 'claude-sonnet-5-5',
    goal: 'Fazer a equipe render e manter o dono informado em poucas linhas.',
    summary:
      'Reunião diária com a equipe, distribui tarefas, revisa o trabalho e manda um relatório diário ao dono, em horários configuráveis. Só ele dispara os outros; o dono pode chamar qualquer um direto.',
    touchesStore: false,
    maxAutonomy: 'simulacao',
    phase: 6,
    defaultSchedule: ['30 8 * * 1-6'],
    allowedTools: ['tarefas.criar', 'tarefas.ler', 'relatorios.ler', 'relatorio.gravar'],
  }),
  define({
    id: 'catalogo-anuncios',
    role: 'catalogo_anuncios',
    name: 'Marina',
    model: 'claude-haiku-5-5',
    goal: 'Todo produto ativo anunciado e bem apresentado nos dois canais.',
    summary:
      'Confere se todo produto ativo está anunciado no Mercado Livre e na Shopee, aponta anúncios com problema (foto, título, ficha técnica) e propõe correções.',
    touchesStore: true,
    maxAutonomy: 'aprovacao',
    phase: 10,
    defaultSchedule: ['0 9 * * 1-5'],
    allowedTools: [],
  }),
  define({
    id: 'preco-margem',
    role: 'preco_margem',
    name: 'Daniel',
    model: 'claude-sonnet-5-5',
    goal: 'Vender com margem real dentro da faixa que o dono definiu.',
    summary:
      'Calcula a margem real por anúncio (taxas e frete de cada canal), sugere preço e entrada em promoções dentro da faixa de margem do dono. Preço nunca abaixo do piso de margem cadastrado por produto.',
    touchesStore: true,
    maxAutonomy: 'autonomo',
    phase: 8,
    defaultSchedule: ['0 7 * * *'],
    allowedTools: [],
  }),
  define({
    id: 'sac',
    role: 'sac',
    name: 'Júlia',
    model: 'claude-sonnet-5-5',
    goal: 'Responder clientes rápido, no tom da loja, sem prometer o que não pode.',
    summary:
      'Escreve rascunhos de resposta a perguntas, reclamações e devoluções. Sempre com aprovação do dono no início.',
    touchesStore: true,
    maxAutonomy: 'autonomo',
    phase: 9,
    defaultSchedule: ['*/30 8-22 * * *'],
    allowedTools: [],
  }),
  define({
    id: 'analista-mercado',
    role: 'analista_mercado',
    name: 'Pedro',
    model: 'claude-haiku-5-5',
    goal: 'Avisar cedo quando um concorrente muda preço, frete ou reputação.',
    summary:
      'Acompanha preço, reputação e frete dos concorrentes nos produtos principais e avisa mudanças relevantes.',
    touchesStore: false,
    maxAutonomy: 'simulacao',
    phase: 10,
    defaultSchedule: ['0 10 * * 1-5'],
    allowedTools: [],
  }),
];

export const getEmployeeDefinition = (id: string): EmployeeDefinition | undefined =>
  EMPLOYEES.find((employee) => employee.id === id);

export const employeesByPhase = (phase: number): EmployeeDefinition[] =>
  EMPLOYEES.filter((employee) => employee.phase <= phase);

/** Autonomy transitions climb one level at a time and never above the role's maximum. */
export function canPromote(
  definition: EmployeeDefinition,
  from: AutonomyLevel,
  to: AutonomyLevel,
): boolean {
  const rank = (level: AutonomyLevel) => AUTONOMY_LEVELS.indexOf(level);
  return rank(to) === rank(from) + 1 && rank(to) <= rank(definition.maxAutonomy);
}

/** Sanity check used by tests: exactly one definition per role. */
export const ROLES_COVERED: readonly EmployeeRole[] = EMPLOYEE_ROLES;
