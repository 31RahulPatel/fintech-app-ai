import type { BedrockReport } from '../types/agent.types'
import type { MarketSnapshot } from '../services/marketData'

function list(items: string[], color: string): string {
  if (!items.length) return '<p style="color:#6b7280;font-size:14px;margin:0;">None flagged for this run.</p>'
  return `<ul style="margin:0;padding-left:18px;">${items
    .map((item) => `<li style="color:#111827;font-size:14px;line-height:1.6;margin-bottom:6px;"><span style="color:${color};font-weight:700;">•</span> ${item}</li>`)
    .join('')}</ul>`
}

export function buildReportEmail(agentName: string, report: BedrockReport, market: MarketSnapshot, generatedAt: string): { subject: string; html: string } {
  const instrumentsRows = market.instruments
    .map(
      (i) => `<tr>
        <td style="padding:10px 14px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${i.symbol}</td>
        <td style="padding:10px 14px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${i.price}</td>
        <td style="padding:10px 14px;font-size:13px;font-weight:700;color:${i.change >= 0 ? '#16a34a' : '#dc2626'};border-bottom:1px solid #e5e7eb;">${i.change >= 0 ? '+' : ''}${i.change}%</td>
      </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:#f97316;color:#fff;font-weight:800;font-size:18px;">₹</span>
        <div style="font-size:20px;font-weight:800;color:#f97316;margin-top:8px;">FintechOps</div>
      </div>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:32px;box-shadow:0 12px 32px rgba(17,24,39,0.08);">
        <h1 style="font-size:20px;margin:0 0 4px;color:#111827;">${agentName}</h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 24px;">Generated automatically on ${generatedAt}</p>

        <h2 style="font-size:15px;color:#111827;margin:0 0 10px;">Market Summary</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${instrumentsRows}</table>

        <h2 style="font-size:15px;color:#111827;margin:0 0 8px;">AI Analysis</h2>
        <p style="font-size:14px;line-height:1.6;color:#111827;margin:0 0 24px;">${report.summary}</p>
        <p style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 24px;">${report.analysis}</p>

        <h2 style="font-size:15px;color:#111827;margin:0 0 8px;">Risks</h2>
        <div style="margin-bottom:24px;">${list(report.risks, '#dc2626')}</div>

        <h2 style="font-size:15px;color:#111827;margin:0 0 8px;">Opportunities</h2>
        <div style="margin-bottom:24px;">${list(report.opportunities, '#16a34a')}</div>

        <h2 style="font-size:15px;color:#111827;margin:0 0 8px;">Suggested Actions</h2>
        <div>${list(report.suggestedActions, '#f97316')}</div>
      </div>

      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">Generated automatically by FintechOps AI Agent · Not personalized financial advice</p>
    </div>
  </body>
</html>`

  return { subject: `FintechOps · ${agentName} · ${generatedAt}`, html }
}
