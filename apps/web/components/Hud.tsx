import { MARKETPLACE_LABELS } from '@aivo/shared';
import { DEMO_MODE } from '../lib/api';
import { compactBrl, integer } from '../lib/format';
import type { DashboardSummaryDto } from '../lib/types';

export function Hud({
  summary,
  onOpenApprovals,
}: {
  summary: DashboardSummaryDto | null;
  onOpenApprovals: () => void;
}) {
  return (
    <header className="hud">
      <div className="hud__brand">
        <span className="hud__logo">🏢</span>
        <div>
          <div className="hud__title">AI Virtual Office</div>
          <div className="hud__subtitle">
            {DEMO_MODE ? 'Demonstração · loja fictícia' : 'Sua operação de marketplace'}
          </div>
        </div>
      </div>
      <div className="hud__kpis">
        {summary?.marketplaces.map((m) => (
          <div key={m.marketplace} className={`kpi kpi--${m.marketplace}`}>
            <div className="kpi__label">{MARKETPLACE_LABELS[m.marketplace]} · 30 dias</div>
            <div className="kpi__value">{compactBrl(m.revenue30dCents)}</div>
            <div className="kpi__hint">
              {integer(m.orders30d)} pedidos · {integer(m.activeListings)} anúncios ativos
            </div>
          </div>
        ))}
        {summary && (
          <div className="kpi kpi--stock">
            <div className="kpi__label">Estoque</div>
            <div className="kpi__value">{integer(summary.stock.outOfStock)} sem estoque</div>
            <div className="kpi__hint">{integer(summary.stock.lowStock)} com estoque baixo</div>
          </div>
        )}
        <button type="button" className="kpi kpi--approvals" onClick={onOpenApprovals}>
          <div className="kpi__label">Aprovações</div>
          <div className="kpi__value">{integer(summary?.pendingApprovals ?? 0)} pendentes</div>
          <div className="kpi__hint">Clique para decidir</div>
        </button>
      </div>
    </header>
  );
}
