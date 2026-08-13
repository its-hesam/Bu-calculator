import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { fundflowTexts } from "@/lib/texts"
import { reconstructFundFlow, exportToExcel, type FundFlowResult } from "@/lib/calculators"
import { Upload, Download, RotateCcw, Calculator, Loader2, FileSpreadsheet, ShieldAlert, FileDown, RefreshCcw } from "lucide-react"

export function FundFlowPage() {
  const t = fundflowTexts
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [frozen, setFrozen] = useState("")
  const [available, setAvailable] = useState("")
  const [result, setResult] = useState<FundFlowResult | null>(null)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  const process = async () => {
    setError("")
    setResult(null)
    setProcessing(true)
    try {
      const res = await reconstructFundFlow({
        file1,
        file2,
        frozen: parseFloat(frozen) || 0,
        available: parseFloat(available) || 0,
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic)
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setFile1(null)
    setFile2(null)
    setFrozen("")
    setAvailable("")
    setResult(null)
    setError("")
  }

  const handleDownload = () => {
    if (result) exportToExcel(result.rows)
  }

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<FileSpreadsheet className="h-4 w-4" />}>
          <div className="space-y-4">
            <FileInput label={t.files.file1.label} hint={t.files.file1.hint} file={file1} onFile={setFile1} />
            <FileInput label={t.files.file2.label} hint={t.files.file2.hint} file={file2} onFile={setFile2} />
            <div className="grid gap-3.5">
              <FormField label={t.fields.frozen}>
                <Input type="number" step="0.00000001" value={frozen} onChange={e => setFrozen(e.target.value)} />
              </FormField>
              <FormField label={t.fields.available}>
                <Input type="number" step="0.00000001" value={available} onChange={e => setAvailable(e.target.value)} />
              </FormField>
            </div>
          </div>
        </SectionCard>
      }
      action={
        <Button onClick={process} size="full" className="gap-2" disabled={processing}>
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {t.calculate}
        </Button>
      }
      errors={error && (
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}
      result={result && (
        <div className="space-y-5 animate-slide-up">
          <div className="stagger-1 overflow-hidden rounded-xl border border-primary/25 bg-primary/[0.03]">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><FileDown className="h-4 w-4 text-primary" /> {t.scriptHeading}</h2>
            </div>
            <div className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-muted-foreground">
              {result.reportText.split("\n").map((line, i) => (
                <span key={i}>
                  {line.startsWith("<strong>") ? (
                    <strong>{line.replace(/<\/?strong>/g, "")}</strong>
                  ) : (
                    line
                  )}
                  {i < result.reportText.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>

          <div className="stagger-2">
            <p className="eyebrow">{t.summaryHeading}</p>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/80 bg-border/70 md:grid-cols-4">
              <SummaryCard label={t.summary.current} value={result.currentBalance.toFixed(4)} />
              <SummaryCard label={t.summary.oldest} value={result.oldestBalance.toFixed(4)} />
              <SummaryCard label={t.summary.count} value={String(result.txCount)} />
              <SummaryCard label={t.summary.netChange} value={(result.oldestBalance - result.currentBalance).toFixed(4)} />
            </div>
          </div>

          <div className="stagger-3 overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><RefreshCcw className="h-4 w-4 text-primary" /> {t.tableHeading}</h2>
            </div>
            <div className="max-h-[550px] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-card">
                    <TableHead>{t.table.time}</TableHead>
                    <TableHead>{t.table.type}</TableHead>
                    <TableHead>{t.table.currency}</TableHead>
                    <TableHead>{t.table.contract}</TableHead>
                    <TableHead className="text-right">{t.table.amount}</TableHead>
                    <TableHead className="text-right">{t.table.balance}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((r, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell>{r.time}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell>{r.contract}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.amount}</TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">{r.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="stagger-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="full" className="gap-2 sm:flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4" /> {t.download}
            </Button>
            <Button variant="outline" size="full" className="gap-2 sm:flex-1" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> {t.newCalculation}
            </Button>
          </div>

          <div className="stagger-5">
            <TemplateCards
              variant="fundFlow"
              params={{
                current: result.currentBalance.toFixed(4),
                oldest: result.oldestBalance.toFixed(4),
                count: String(result.txCount),
                netChange: (result.oldestBalance - result.currentBalance).toFixed(4),
              }}
            />
          </div>
        </div>
      )}
    />
  )
}

function FileInput({ label, hint, file, onFile }: { label: string; hint: string; file: File | null; onFile: (f: File | null) => void }) {
  return (
    <FormField label={label} hint={hint}>
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/50 p-5 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.04]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
          <Upload className="h-5 w-5" />
        </div>
        <span className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-primary/90">
          {file ? file.name : fundflowTexts.files.prompt}
        </span>
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => onFile(e.target.files?.[0] ?? null)} />
      </label>
    </FormField>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface/60 p-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  )
}
