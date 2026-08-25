import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { appTexts } from "@/lib/texts"
import { IsolatedLiqTab } from "@/components/calculator/IsolatedLiqTab"
import { CrossLiqTab } from "@/components/calculator/CrossLiqTab"
import { PnlTab } from "@/components/calculator/PnlTab"
import { TradingFeeTab } from "@/components/calculator/TradingFeeTab"
import { FundingFeeTab } from "@/components/calculator/FundingFeeTab"
import { SlippageTab } from "@/components/calculator/SlippageTab"
import { FundFlowPage } from "@/components/fund-flow/FundFlowPage"
import { GlossaryPage } from "@/components/glossary/GlossaryPage"
import {
  Calculator,
  ArrowLeftRight,
  TrendingUp,
  Receipt,
  Banknote,
  GripHorizontal,
  FileSpreadsheet,
  BookOpen,
  Menu,
  X,
} from "lucide-react"

const toolIcons: Record<string, ReactNode> = {
  iso: <Calculator className="h-4.5 w-4.5" />,
  cross: <ArrowLeftRight className="h-4.5 w-4.5" />,
  pnl: <TrendingUp className="h-4.5 w-4.5" />,
  fee: <Receipt className="h-4.5 w-4.5" />,
  funding: <Banknote className="h-4.5 w-4.5" />,
  slip: <GripHorizontal className="h-4.5 w-4.5" />,
  fundflow: <FileSpreadsheet className="h-4.5 w-4.5" />,
  glossary: <BookOpen className="h-4.5 w-4.5" />,
}

const toolComps: Record<string, ReactNode> = {
  iso: <IsolatedLiqTab />,
  cross: <CrossLiqTab />,
  pnl: <PnlTab />,
  fee: <TradingFeeTab />,
  funding: <FundingFeeTab />,
  slip: <SlippageTab />,
  fundflow: <FundFlowPage />,
  glossary: <GlossaryPage />,
}

interface Tool {
  key: string
  label: string
  description: string
  icon: ReactNode
  comp: ReactNode
}

const TOOLS: Tool[] = appTexts.tools.map(tool => ({
  key: tool.key,
  label: tool.label,
  description: tool.description,
  icon: toolIcons[tool.key],
  comp: toolComps[tool.key],
}))

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-inset ring-white/10">
        <Calculator className="h-4.5 w-4.5" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-bold tracking-tight text-foreground">
          {appTexts.brand.name} <span className="text-gradient">{appTexts.brand.product}</span>
        </div>
      </div>
    </div>
  )
}

function ToolButton({ tool, active, onSelect }: { tool: Tool; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active
          ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.28)]"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {tool.icon}
      <span className="truncate">{tool.label}</span>
      {active && <span className="ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
    </button>
  )
}

export default function App() {
  const [active, setActive] = useState("iso")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const tool = TOOLS.find(t => t.key === active) ?? TOOLS[0]
  const toolIndex = TOOLS.indexOf(tool)

  const select = (key: string) => {
    setActive(key)
    setDrawerOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-10">
          <Logo />
          <nav className="hidden flex-1 items-center gap-1 overflow-x-auto px-2 lg:flex scrollbar-none" aria-label="Tools">
            {TOOLS.map(t => (
              <ToolButton key={t.key} tool={t} active={active === t.key} onSelect={() => select(t.key)} />
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 font-mono text-xs text-muted-foreground lg:flex">
            <span className="text-foreground/70">{String(toolIndex + 1).padStart(2, "0")}</span>
            <span className="text-border">/</span>
            <span>{String(TOOLS.length).padStart(2, "0")}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => setDrawerOpen(true)} aria-label={appTexts.aria.openMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[20rem] max-w-[85%] flex-col border-r border-border bg-card animate-slide-up">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <Logo />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDrawerOpen(false)} aria-label={appTexts.aria.closeMenu}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Tools">
              {TOOLS.map(t => {
                const isActive = active === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => select(t.key)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.28)]"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")}>{t.icon}</span>
                    <span className="flex-1 truncate">{t.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                )
              })}
            </nav>
            
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-10 lg:pb-24 lg:pt-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="eyebrow">{appTexts.brand.name}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-mono text-xs text-muted-foreground/70">{String(toolIndex + 1).padStart(2, "0")} / {String(TOOLS.length).padStart(2, "0")}</span>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{tool.label}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{tool.description}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3.5 py-1.5 font-mono text-xs font-medium text-primary">
              {tool.icon}
              <span className="uppercase">{tool.key}</span>
            </span>
          </div>
        </div>
        <div className="mt-8 h-px bg-gradient-to-r from-primary/40 via-border/80 to-transparent lg:mt-10" />

        <div className="mt-8 lg:mt-10">{tool.comp}</div>
      </main>
    </div>
  )
}
