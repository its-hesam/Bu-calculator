import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { templates, templateMeta, commonTexts, type TemplateVariant } from "@/lib/texts"
import { cn } from "@/lib/utils"
import { Copy, Check, RotateCcw, Users, UserRound } from "lucide-react"

export interface TemplateCardsProps {
  params: Record<string, string>
  variant: TemplateVariant
}

function resolve(body: string, params: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k in params ? params[k] : `{{${k}}}`))
}

const cardIcons = {
  colleague: <Users className="h-4.5 w-4.5" />,
  user: <UserRound className="h-4.5 w-4.5" />,
}

export function TemplateCards({ params, variant }: TemplateCardsProps) {
  const cards = ["colleague", "user"] as const

  return (
    <section className="space-y-4 animate-slide-up">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">{commonTexts.responsesEyebrow}</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">{commonTexts.templateHeading}</h3>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{commonTexts.copyHint}</p>
      </div>
      <div className="space-y-4">
        {cards.map((card, i) => (
          <TemplateCard
            key={card}
            index={i + 1}
            title={templateMeta[card].title}
            subtitle={templateMeta[card].subtitle}
            icon={cardIcons[card]}
            body={templates[variant][card]}
            params={params}
            featured={card === "colleague"}
          />
        ))}
      </div>
    </section>
  )
}

function TemplateCard({ index, title, subtitle, icon, body, params, featured }: { index: number; title: string; subtitle: string; icon: ReactNode; body: string; params: Record<string, string>; featured: boolean }) {
  const initial = resolve(body, params)
  const [value, setValue] = useState(initial)
  const { copied, copy } = useCopyToClipboard()

  useEffect(() => {
    setValue(resolve(body, params))
  }, [body, params])

  const copyButton = (size: "sm" | "default") => (
    <Button variant={featured ? "green" : "outline"} size={size} className="gap-1.5" onClick={() => copy(value)}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? commonTexts.copied : commonTexts.copy}
    </Button>
  )

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", featured ? "border-primary/25" : "border-border/80")}>
      <div className={cn("flex items-center gap-3 border-b px-5 py-4", featured ? "border-primary/15 bg-primary/[0.04]" : "border-border/60 bg-muted/20")}>
        <span className="font-mono text-xs font-semibold text-muted-foreground/60">{String(index).padStart(2, "0")}</span>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", featured ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25" : "bg-muted/50 text-muted-foreground")}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold tracking-tight text-foreground">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        </div>
        <div className="hidden sm:block">{copyButton("sm")}</div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <textarea
          rows={7}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full flex-1 resize-y rounded-lg border border-input bg-input/40 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50"
          placeholder={commonTexts.messagePlaceholder}
        />
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(params).map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
            >
              <span className="text-primary">{"{{"}{k}{"}}"}</span>
              <span className="max-w-[160px] truncate">{v}</span>
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-xs" onClick={() => setValue(initial)}>
            <RotateCcw className="h-3.5 w-3.5" /> {commonTexts.reset}
          </Button>
          <div className="sm:hidden">{copyButton("sm")}</div>
        </div>
      </div>
    </div>
  )
}
