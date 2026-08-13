import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { commonTexts } from "@/lib/texts"

interface StableTabsProps {
  className?: string
}

export function StableTabs({ className }: StableTabsProps) {
  return (
    <TabsList className={cn("w-full", className)}>
      <TabsTrigger value="usdt" className="flex-1">{commonTexts.stableTabs.usdt}</TabsTrigger>
      <TabsTrigger value="usdc" className="flex-1">{commonTexts.stableTabs.usdc}</TabsTrigger>
      <TabsTrigger value="coin" className="flex-1">{commonTexts.stableTabs.coin}</TabsTrigger>
    </TabsList>
  )
}
