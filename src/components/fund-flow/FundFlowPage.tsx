import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { Stat, MetricGrid } from "@/components/shared/Stat"
import { ResultHero } from "@/components/shared/ResultHero"
import { TemplateCards } from "@/components/shared/TemplateCards"
import { ToolLayout } from "@/components/shared/ToolLayout"
import { fundflowTexts } from "@/lib/texts"
import { reconstructFundFlow, exportToExcel, fmt, type FundFlowResult } from "@/lib/calculators"
import {
  Upload,
  Download,
  RotateCcw,
  Calculator,
  Loader2,
  FileSpreadsheet,
  ShieldAlert,
  FileDown,
  RefreshCcw,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

export function FundFlowPage() {
  const t = fundflowTexts
  const [files, setFiles] = useState<File[]>([])
  const [frozen, setFrozen] = useState("")
  const [available, setAvailable] = useState("")
  const [result, setResult] = useState<FundFlowResult | null>(null)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [page, setPage] = useState(0)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles(prev => [...prev, ...Array.from(list)])
  }
  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i))

  const process = async () => {
    setError("")
    setResult(null)
    setPage(0)
    setProcessing(true)
    try {
      const res = await reconstructFundFlow({
        files,
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
    setFiles([])
    setFrozen("")
    setAvailable("")
    setResult(null)
    setError("")
    setPage(0)
  }

  const handleDownload = () => {
    if (result) exportToExcel(result.rows)
  }

  const pageSize = t.pageSize
  const pageCount = result ? Math.max(1, Math.ceil(result.rows.length / pageSize)) : 0
  const safePage = result ? Math.min(page, pageCount - 1) : 0
  const slice = result ? result.rows.slice(safePage * pageSize, safePage * pageSize + pageSize) : []

  return (
    <ToolLayout
      form={
        <SectionCard title={t.section.title} description={t.section.description} icon={<FileSpreadsheet className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="space-y-2">
              {files.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                  {t.files.empty}
                </p>
              )}
              {files.map((f, i) => (
                <FileRow key={`${f.name}-${i}`} index={i + 1} file={f} onRemove={() => removeFile(i)} />
              ))}
              <FileDropZone onFiles={addFiles} />
            </div>
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
          <ResultHero
            eyebrow={t.scriptHeading}
            title={t.summary.finalBalance}
            value={`${fmt(result.finalBalance, 4)} USDT`}
            tone="success"
            sub={`Verified from ${result.txCount} transaction(s) across ${result.fileCount} file(s) · ${result.duplicateCount} duplicate(s) removed`}
          />

          {(result.unparsedCount > 0 || result.currencies.length > 1 || !result.reconciled) && (
            <div className="space-y-2">
              {!result.reconciled && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{t.warnings.reconcile(fmt(result.balanceDiff, 4))}</AlertDescription>
                </Alert>
              )}
              {result.unparsedCount > 0 && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{t.warnings.unparsed(result.unparsedCount)}</AlertDescription>
                </Alert>
              )}
              {result.currencies.length > 1 && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{t.warnings.currencies(result.currencies.join(", "))}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div>
            <p className="eyebrow">{t.summaryHeading}</p>
            <MetricGrid className="mt-3 sm:grid-cols-3">
              <Stat label={t.summary.finalBalance} value={`${fmt(result.finalBalance, 4)} USDT`} tone="success" icon={<FileDown className="h-4 w-4" />} />
              <Stat label={t.summary.count} value={fmt(result.txCount, 0)} icon={<RefreshCcw className="h-4 w-4" />} />
              <Stat label={t.summary.files} value={String(result.fileCount)} icon={<FileSpreadsheet className="h-4 w-4" />} />
              <Stat label={t.summary.duplicates} value={fmt(result.duplicateCount, 0)} tone={result.duplicateCount > 0 ? "warning" : "success"} icon={<AlertTriangle className="h-4 w-4" />} />
              <Stat label={t.summary.oldest} value={`${fmt(result.oldestBalance, 4)} USDT`} icon={<RotateCcw className="h-4 w-4" />} />
              <Stat label={t.summary.netChange} value={`${result.netChange >= 0 ? "+" : ""}${fmt(result.netChange, 4)} USDT`} tone={result.netChange >= 0 ? "success" : "danger"} icon={<Upload className="h-4 w-4" />} />
            </MetricGrid>
          </div>

          <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary/[0.03]">
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

          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90"><RefreshCcw className="h-4 w-4 text-primary" /> {t.tableHeading}</h2>
              <span className="font-mono text-xs text-muted-foreground">{result.txCount} rows</span>
            </div>
            <div className="max-h-[550px] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-card">
                    <TableHead>{t.table.index}</TableHead>
                    <TableHead>{t.table.time}</TableHead>
                    <TableHead>{t.table.type}</TableHead>
                    <TableHead>{t.table.currency}</TableHead>
                    <TableHead>{t.table.contract}</TableHead>
                    <TableHead className="text-right">{t.table.amount}</TableHead>
                    <TableHead className="text-right">{t.table.before}</TableHead>
                    <TableHead className="text-right">{t.table.after}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slice.map((r, i) => (
                    <TableRow key={safePage * pageSize + i} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">{safePage * pageSize + i + 1}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell>{r.contract}</TableCell>
                      <TableCell className={`text-right font-mono tabular-nums ${r.amount >= 0 ? "text-success" : "text-destructive"}`}>{r.amount >= 0 ? "+" : ""}{fmt(r.amount, 4)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{fmt(r.balanceBefore, 4)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">{fmt(r.balanceAfter, 4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, result.txCount)} of {result.txCount}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" /> {t.pagination.prev}
                </Button>
                <span className="font-mono text-xs text-muted-foreground">Page {safePage + 1} / {pageCount}</span>
                <Button variant="outline" size="sm" className="gap-1" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
                  {t.pagination.next} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="full" className="gap-2 sm:flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4" /> {t.download}
            </Button>
            <Button variant="outline" size="full" className="gap-2 sm:flex-1" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> {t.newCalculation}
            </Button>
          </div>

          <TemplateCards
            variant="fundFlow"
            params={{
              finalBalance: fmt(result.finalBalance, 4),
              count: String(result.txCount),
              fileCount: String(result.fileCount),
              duplicates: String(result.duplicateCount),
              oldest: fmt(result.oldestBalance, 4),
              netChange: `${result.netChange >= 0 ? "+" : ""}${fmt(result.netChange, 4)}`,
            }}
          />
        </div>
      )}
    />
  )
}

function FileRow({ index, file, onRemove }: { index: number; file: File; onRemove: () => void }) {
  const t = fundflowTexts
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-surface/50 px-3 py-2.5">
      <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{file.name}</span>
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">#{index}</span>
      <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-muted-foreground hover:text-destructive" onClick={onRemove}>
        <X className="h-3.5 w-3.5" /> {t.files.remove}
      </Button>
    </div>
  )
}

function FileDropZone({ onFiles }: { onFiles: (list: FileList | null) => void }) {
  const t = fundflowTexts
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/50 p-5 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.04]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
        <Plus className="h-5 w-5" />
      </div>
      <span className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-primary/90">{t.files.add}</span>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
    </button>
  )
}
