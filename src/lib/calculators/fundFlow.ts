import * as XLSX from "xlsx"
import { fundflowTexts } from "@/lib/texts"

export interface FundFlowRow {
  time: string
  type: string
  currency: string
  contract: string
  amount: number
  timeKey: number
  parsed: boolean
}

export interface ProcessedRow {
  time: string
  type: string
  currency: string
  contract: string
  amount: number
  balanceBefore: number
  balanceAfter: number
}

export interface FundFlowInputs {
  files: File[]
  frozen: number
  available: number
}

export interface FundFlowResult {
  rows: ProcessedRow[]
  txCount: number
  fileCount: number
  rawCount: number
  duplicateCount: number
  unparsedCount: number
  oldestBalance: number
  currentBalance: number
  finalBalance: number
  netChange: number
  reconciled: boolean
  balanceDiff: number
  currencies: string[]
  reportText: string
}

export async function reconstructFundFlow(input: FundFlowInputs): Promise<FundFlowResult> {
  const files = (input.files || []).filter(Boolean)
  if (files.length === 0) {
    throw new Error(fundflowTexts.errors.noFile)
  }

  const fileArrays = await Promise.all(files.map(readExcel))
  const rawCount = fileArrays.reduce((s, a) => s + a.length, 0)
  const normalized = fileArrays.flat().map(normalizeRow)
  const { unique, removed } = dedupRows(normalized)
  const unparsedCount = unique.filter(r => !r.parsed).length

  if (unique.length === 0) {
    throw new Error(fundflowTexts.errors.noValid)
  }

  const sorted = sortRows(unique)
  const currencies = [...new Set(sorted.map(r => r.currency))]

  const currentBalance = (input.frozen || 0) + (input.available || 0)

  let b = currentBalance
  for (let i = sorted.length - 1; i >= 0; i--) {
    b = Number((b - sorted[i].amount).toFixed(8))
  }
  const oldestBalance = b

  const rows: ProcessedRow[] = []
  let balance = oldestBalance
  for (const r of sorted) {
    const before = Number(balance.toFixed(8))
    balance = Number((balance + r.amount).toFixed(8))
    rows.push({
      time: convertUTC8(r.time),
      type: r.type,
      currency: r.currency,
      contract: r.contract || "-",
      amount: r.amount,
      balanceBefore: before,
      balanceAfter: balance,
    })
  }

  const finalBalance = rows.length ? rows[rows.length - 1].balanceAfter : currentBalance
  const balanceDiff = Number((currentBalance - finalBalance).toFixed(8))
  const reconciled = Math.abs(balanceDiff) < 0.00000001
  const netChange = Number((currentBalance - oldestBalance).toFixed(8))

  const reportText = generateReport({
    finalBalance,
    txCount: rows.length,
    fileCount: files.length,
    duplicateCount: removed,
    oldest: oldestBalance,
    netChange,
  })

  return {
    rows,
    txCount: rows.length,
    fileCount: files.length,
    rawCount,
    duplicateCount: removed,
    unparsedCount,
    oldestBalance,
    currentBalance,
    finalBalance,
    netChange,
    reconciled,
    balanceDiff,
    currencies,
    reportText,
  }
}

function readExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
        resolve(json)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error(fundflowTexts.errors.readFailed))
    reader.readAsArrayBuffer(file)
  })
}

function normalizeRow(r: Record<string, unknown>): FundFlowRow {
  const rawTime = String(
    (r["时间"] as string) ?? (r["Time"] as string) ?? (r["Transaction Time"] as string) ?? "",
  )
  const timeKey = parseTime(rawTime)
  return {
    time: rawTime,
    type: String((r["类型"] as string) ?? (r["Type"] as string) ?? "Unknown"),
    currency: String((r["币种"] as string) ?? (r["Currency"] as string) ?? "USDT").toUpperCase(),
    contract: String((r["合约"] as string) ?? (r["Contract"] as string) ?? ""),
    amount: parseFloat(String((r["金额"] as string) ?? (r["Amount"] as string) ?? "").replace(/,/g, "")) || 0,
    timeKey: timeKey ?? 0,
    parsed: timeKey !== null,
  }
}

function parseTime(dateStr: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr.replace(" ", "T"))
  return isNaN(d.getTime()) ? null : d.getTime()
}

function dedupRows(rows: FundFlowRow[]): { unique: FundFlowRow[]; removed: number } {
  const seen = new Set<string>()
  const unique: FundFlowRow[] = []
  for (const r of rows) {
    const key = `${r.time.trim()}|${r.type.trim()}|${r.currency.toUpperCase()}|${r.contract.trim()}|${r.amount}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(r)
  }
  return { unique, removed: rows.length - unique.length }
}

function sortRows(rows: FundFlowRow[]): FundFlowRow[] {
  return rows.sort((a, b) => {
    const ak = a.parsed ? a.timeKey : Number.POSITIVE_INFINITY
    const bk = b.parsed ? b.timeKey : Number.POSITIVE_INFINITY
    return ak - bk
  })
}

function convertUTC8(dateStr: string): string {
  if (!dateStr) return "N/A"
  const d = new Date(dateStr.replace(" ", "T"))
  if (isNaN(d.getTime())) return dateStr
  d.setHours(d.getHours() + 8)
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC+8"
}

function generateReport(data: { finalBalance: number; txCount: number; fileCount: number; duplicateCount: number; oldest: number; netChange: number }): string {
  return fundflowTexts.report({
    finalBalance: data.finalBalance.toFixed(4),
    txCount: data.txCount,
    fileCount: data.fileCount,
    duplicateCount: data.duplicateCount,
    oldest: data.oldest.toFixed(4),
    netChange: data.netChange.toFixed(4),
  })
}

export function exportToExcel(rows: ProcessedRow[]): void {
  const ex = fundflowTexts.export
  const data = rows.map((r, i) => ({
    [ex.colIndex]: i + 1,
    [ex.colTime]: r.time,
    [ex.colType]: r.type,
    [ex.colCurrency]: r.currency,
    [ex.colContract]: r.contract,
    [ex.colAmount]: r.amount,
    [ex.colBefore]: r.balanceBefore,
    [ex.colAfter]: r.balanceAfter,
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, ex.sheetName)
  XLSX.writeFile(wb, ex.fileName)
}
