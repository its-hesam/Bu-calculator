import type { ReactNode } from "react"
import { SectionCard } from "@/components/shared/SectionCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { glossaryTexts } from "@/lib/texts"
import { BookOpen, CalendarClock } from "lucide-react"

function renderCell(content: string): ReactNode {
  if (!content) return "—"
  const lines = content.split("\n")
  if (lines.length <= 1) return content
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

export function GlossaryPage() {
  const t = glossaryTexts
  return (
    <div className="space-y-5 animate-slide-up">
      <SectionCard title={t.title} description={t.updated} icon={<BookOpen className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-muted-foreground">{t.intro}</p>
      </SectionCard>

      {t.sections.map(section => (
        <SectionCard key={section.title} title={section.title} icon={<CalendarClock className="h-4 w-4" />}>
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-card">
                  <TableHead className="w-52">{t.columns.term}</TableHead>
                  <TableHead>{t.columns.definition}</TableHead>
                  <TableHead className="w-56">{t.columns.notes}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="align-top text-[13px] font-semibold text-foreground/90">{row.term}</TableCell>
                    <TableCell className="align-top text-[13px] leading-relaxed">{renderCell(row.definition)}</TableCell>
                    <TableCell className="align-top text-[13px] leading-relaxed text-muted-foreground">{renderCell(row.note)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      ))}
    </div>
  )
}