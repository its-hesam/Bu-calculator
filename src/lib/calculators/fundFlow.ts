import * as XLSX from "xlsx"
import { fundflowTexts } from "@/lib/texts"

export interface FundFlowRow {
  time: string
  type: string
  currency: string
  contract: string
  amount: number
}

export interface ReconstructedRow {
  time: string
  type: string
  currency: string
  contract: string
  amount: number
  balance: number
}

export interface FundFlowInputs {
  file1: File | null
  file2: File | null
  frozen: number
  available: number
}

export interface FundFlowResult {
  rows: ReconstructedRow[]
  currentBalance: number
  oldestBalance: number
  txCount: number
  latestTx: ReconstructedRow
  reportText: string
}

export async function reconstructFundFlow(input: FundFlowInputs): Promise<FundFlowResult> {
  const rows1 = input.file1 ? await readExcel(input.file1) : []
  const rows2 = input.file2 ? await readExcel(input.file2) : []
  const merged = [...rows1, ...rows2]

  if (merged.length === 0) {
    throw new Error(fundflowTexts.errors.noFile)
  }

  let rows = normalizeRows(merged)
  rows = sortRows(rows)

  const frozen = input.frozen || 0
  const available = input.available || 0
  let balance = frozen + available
  const startBalance = balance

  const reconstructed: ReconstructedRow[] = []

  rows.forEach((row) => {
    balance = Number((balance - row.amount).toFixed(8))
    reconstructed.push({
      time: convertUTC8(row.time),
      type: row.type,
      currency: row.currency,
      contract: row.contract || "-",
      amount: row.amount,
      balance,
    })
  })

  const latestTx = reconstructed[0] || {
    time: "N/A", type: "N/A", currency: "USDT", contract: "-", amount: 0, balance: 0,
  }
  const finalOldest = reconstructed[reconstructed.length - 1]?.balance ?? balance

  const reportText = generateReport(
    startBalance,
    balance,
    rows.length,
    {
      time: rows[0]?.time ?? "",
      type: rows[0]?.type ?? "N/A",
      amount: rows[0]?.amount ?? 0,
    },
    finalOldest,
  )

  return {
    rows: reconstructed,
    currentBalance: startBalance,
    oldestBalance: balance,
    txCount: rows.length,
    latestTx: latestTx as ReconstructedRow,
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

function normalizeRows(rows: Record<string, unknown>[]): FundFlowRow[] {
  return rows.map((r) => ({
    time: String((r["时间"] as string) ?? (r["Time"] as string) ?? (r["Transaction Time"] as string) ?? ""),
    type: String((r["类型"] as string) ?? (r["Type"] as string) ?? "Unknown"),
    currency: String((r["币种"] as string) ?? (r["Currency"] as string) ?? "USDT"),
    contract: String((r["合约"] as string) ?? (r["Contract"] as string) ?? ""),
    amount: parseFloat(String((r["金额"] as string) ?? (r["Amount"] as string) ?? "").replace(/,/g, "")) || 0,
  }))
}

function sortRows(rows: FundFlowRow[]): FundFlowRow[] {
  return rows.sort(
    (a, b) => new Date(b.time.replace(" ", "T")).getTime() - new Date(a.time.replace(" ", "T")).getTime(),
  )
}

function convertUTC8(dateStr: string): string {
  if (!dateStr) return "N/A"
  const d = new Date(dateStr.replace(" ", "T"))
  if (isNaN(d.getTime())) return dateStr
  d.setHours(d.getHours() + 8)
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC+8"
}

function generateReport(
  current: number,
  oldest: number,
  txCount: number,
  latestTx: { time: string; type: string; amount: number },
  _finalOldest: number,
): string {
  return fundflowTexts.report({
    current: current.toFixed(4),
    txCount,
    latestType: latestTx.type || "N/A",
    latestAmount: String(latestTx.amount || 0),
    latestTime: convertUTC8(latestTx.time),
    oldest: oldest.toFixed(4),
  })
}

export function exportToExcel(rows: ReconstructedRow[]): void {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, fundflowTexts.export.sheetName)
  XLSX.writeFile(wb, fundflowTexts.export.fileName)
}