/** Último acesso em linguagem relativa para o painel de progresso da turma. */
export function relativeTime(iso: string | null): string {
  if (!iso) return 'nunca';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'nunca';

  const diffMs = Date.now() - then;
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);

  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 14) return 'há 1 semana';
  if (days < 30) return `há ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'há 1 mês';
  return `há ${Math.floor(days / 30)} meses`;
}
