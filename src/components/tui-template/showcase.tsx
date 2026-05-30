import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"

// Import modular showcase sections
import { StyleSection } from "@/components/tui-template/style-section"
import { ComponentsSection, type LogMessage } from "@/components/tui-template/components-section"
import { TelemetrySection } from "@/components/tui-template/telemetry-section"
import { TacticalWidgets } from "@/components/tui-template/tactical-widgets"

import {
  RiTerminalBoxLine,
  RiMoonLine,
  RiSunLine,
  RiCpuLine,
  RiPulseLine,
  RiTimeLine,
  RiExternalLinkLine,
  RiFolderShieldLine,
} from "@remixicon/react"

const telemetryBaseline = [
  { time: "00:00", cpu: 32, ram: 45, network: 12 },
  { time: "04:00", cpu: 45, ram: 50, network: 25 },
  { time: "08:00", cpu: 85, ram: 65, network: 95 },
  { time: "12:00", cpu: 65, ram: 60, network: 45 },
  { time: "16:00", cpu: 55, ram: 58, network: 38 },
  { time: "20:00", cpu: 92, ram: 75, network: 110 },
  { time: "24:00", cpu: 40, ram: 55, network: 20 },
]

export function TuiShowcase() {
  const { theme, setTheme } = useTheme()
  
  // Master Logging state (used by drawer logs inside Tab 2)
  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString(),
      type: "SYSTEM",
      message: "SYSTEM_INIT: TEMPLATE-TUI interface successfully mounted.",
    },
    {
      id: "preset",
      timestamp: new Date().toLocaleTimeString(),
      type: "SUCCESS",
      message: "THEME: Custom preset 'buG04wd' verified and loaded.",
    },
  ])

  // Interactive Counter / State
  const [clickCount, setClickCount] = useState(0)

  // Dynamic telemetry data state (passed to Tab 3)
  const [currentTelemetryData, setCurrentTelemetryData] = useState(telemetryBaseline)

  // Color Accent Theme State
  type AccentTheme = "monochrome" | "amber" | "green" | "rose" | "blue"
  const [accent, setAccent] = useState<AccentTheme>("monochrome")

  // Synchronize accent colors on theme (light/dark) changes
  useEffect(() => {
    const colors = {
      monochrome: {
        light: { primary: "oklch(0.205 0 0)", primaryForeground: "oklch(0.985 0 0)" },
        dark: { primary: "oklch(0.922 0 0)", primaryForeground: "oklch(0.205 0 0)" }
      },
      amber: {
        light: { primary: "oklch(0.65 0.20 75)", primaryForeground: "oklch(0.05 0 0)" },
        dark: { primary: "oklch(0.75 0.22 80)", primaryForeground: "oklch(0.05 0 0)" }
      },
      green: {
        light: { primary: "oklch(0.60 0.24 145)", primaryForeground: "oklch(0.985 0 0)" },
        dark: { primary: "oklch(0.70 0.25 150)", primaryForeground: "oklch(0.05 0 0)" }
      },
      rose: {
        light: { primary: "oklch(0.55 0.22 25)", primaryForeground: "oklch(0.985 0 0)" },
        dark: { primary: "oklch(0.65 0.23 25)", primaryForeground: "oklch(0.985 0 0)" }
      },
      blue: {
        light: { primary: "oklch(0.55 0.20 250)", primaryForeground: "oklch(0.985 0 0)" },
        dark: { primary: "oklch(0.65 0.21 250)", primaryForeground: "oklch(0.985 0 0)" }
      }
    }

    const currentMode = theme === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme

    const activeColors = colors[accent][currentMode as "light" | "dark"]
    const root = document.documentElement
    root.style.setProperty("--primary", activeColors.primary)
    root.style.setProperty("--primary-foreground", activeColors.primaryForeground)
    
    // Log the update if manually triggered
    const isInitialRender = logs.length === 2 && logs[0].id === "init" && logs[1].id === "preset"
    if (!isInitialRender) {
      addLog(`ACCENT_THEME loaded: ${accent.toUpperCase()} [Mode: ${currentMode.toUpperCase()}]`, "SUCCESS")
    }
  }, [theme, accent])

  const addLog = (message: string, type: LogMessage["type"] = "ACTION") => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    setLogs((prev) => [...prev, newLog].slice(-100)) // Keep last 100 logs
  }

  // Watch theme change
  useEffect(() => {
    addLog(`Theme set to ${theme.toUpperCase()}`, "SYSTEM")
  }, [theme])

  // Theme keydown listener for "D" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }
      if (e.key.toLowerCase() === "d") {
        setTheme(theme === "dark" ? "light" : "dark")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [theme, setTheme])

  // Logs clearing handler
  const handleClearLogs = () => {
    setLogs([
      {
        id: "clear",
        timestamp: new Date().toLocaleTimeString(),
        type: "SYSTEM",
        message: "SYSTEM: Terminal logs cleared by operator.",
      },
    ])
  }

  // Telemetry handlers
  const handleSimulateSpike = () => {
    addLog("TELEMETRY: Initiating CPU load spike sequence...", "WARN")
    setCurrentTelemetryData(prev => 
      prev.map((item, idx) => 
        idx === 5 
          ? { ...item, cpu: 99 } 
          : idx === 6 
            ? { ...item, cpu: 95 }
            : item
      )
    )
    setTimeout(() => {
      addLog("TELEMETRY: Workload peak recorded at 99%. Systems cooling active.", "SUCCESS")
    }, 1500)
  }

  const handleSimulateNetworkBurst = () => {
    addLog("TELEMETRY: Simulating heavy network packet burst...", "SYSTEM")
    setCurrentTelemetryData(prev => 
      prev.map((item, idx) => 
        idx === 6 
          ? { ...item, network: 145 } 
          : item
      )
    )
    setTimeout(() => {
      addLog("TELEMETRY: Network throughput peak recorded at 145 Mb/s.", "SUCCESS")
    }, 1000)
  }

  const handleResetTelemetry = () => {
    setCurrentTelemetryData(telemetryBaseline)
    addLog("TELEMETRY: Metrics baseline restored by operator.", "SUCCESS")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-mono transition-colors duration-200">
        
        {/* TOP SYSTEM STATUS BAR */}
        <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <RiTerminalBoxLine className="size-4 text-primary animate-pulse translate-y-[-0.5px] shrink-0" />
              <span className="font-bold tracking-wider text-foreground">TEMPLATE-TUI</span>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block size-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ONLINE [PRESET: <span className="text-primary font-bold">buG04wd</span>]
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick statistics */}
              <div className="hidden md:flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <RiCpuLine className="size-3.5" /> CPU: 12%
                </span>
                <span className="flex items-center gap-1">
                  <RiPulseLine className="size-3.5 text-rose-500 animate-pulse" /> RAM: 1.2 GB
                </span>
                <span className="flex items-center gap-1">
                  <RiTimeLine className="size-3.5" /> UP: 02h 45m
                </span>
              </div>

              <Separator orientation="vertical" className="hidden md:block h-3 bg-border" />

              {/* Color Accent Selector */}
              <div className="flex items-center gap-1 border-r border-border/80 pr-3 mr-1">
                <span className="text-[9px] text-muted-foreground mr-1 uppercase select-none">ACCENT:</span>
                {(["monochrome", "amber", "green", "rose", "blue"] as const).map((ac) => {
                  const dotColor = 
                    ac === "monochrome" ? "bg-foreground" :
                    ac === "amber" ? "bg-amber-500" :
                    ac === "green" ? "bg-emerald-500" :
                    ac === "rose" ? "bg-rose-500" : "bg-blue-500"
                  return (
                    <button
                      key={ac}
                      type="button"
                      title={`Switch accent to ${ac}`}
                      onClick={() => setAccent(ac)}
                      className={cn(
                        "size-3.5 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                        accent === ac ? "border-foreground scale-110" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                      )}
                    >
                      <span className={cn("size-2 rounded-full", dotColor)}></span>
                    </button>
                  )
                })}
              </div>

              {/* Theme Selector */}
              <div className="flex items-center gap-1">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="icon-xs"
                  title="Light Mode"
                  onClick={() => setTheme("light")}
                >
                  <RiSunLine className="size-3" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="icon-xs"
                  title="Dark Mode"
                  onClick={() => setTheme("dark")}
                >
                  <RiMoonLine className="size-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground ml-1.5 hidden sm:inline select-none">
                  (Press <kbd className="px-1 border border-border bg-muted text-foreground/80">D</kbd> anywhere)
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* HERO TITLE BLOCK */}
        <section className="border-b border-border bg-gradient-to-b from-card/30 to-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/50 text-primary uppercase font-bold text-[10px]">
                  Kitchen Sink
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  RADIX-UI + SHADCN
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                System Interface Design Showcase
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Explore the complete design language of your custom <span className="font-semibold text-foreground">buG04wd</span> theme preset.
                Built around monospaced fonts, sharp borders, and high-fidelity terminal interactions, customized for retro-brutalist dashboard interfaces.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN INTERACTIVE CONTAINER */}
        <main className="max-w-7xl mx-auto p-4 flex flex-col gap-4">

          {/* MASTER TABS & SHOWCASES */}
          <div className="w-full flex flex-col">
            <Tabs defaultValue="style" className="w-full flex flex-col gap-4" onValueChange={(val) => addLog(`Page section switched to: ${val.toUpperCase()}`, "SYSTEM")}>
              
              {/* MAIN MENU DIVIDER TAB LIST */}
              <TabsList className="w-full border p-[3px] bg-muted flex rounded-none h-auto items-center">
                <TabsTrigger value="style" className="flex-1 py-1.5 font-bold tracking-wider uppercase">
                  01_STYLE &amp; PALETTE
                </TabsTrigger>
                <TabsTrigger value="components" className="flex-1 py-1.5 font-bold tracking-wider uppercase">
                  02_SHOWCASE_COMPONENTS
                </TabsTrigger>
                <TabsTrigger value="telemetry" className="flex-1 py-1.5 font-bold tracking-wider uppercase">
                  03_SYSTEM_TELEMETRY
                </TabsTrigger>
                <TabsTrigger value="widgets" className="flex-1 py-1.5 font-bold tracking-wider uppercase">
                  04_TACTICAL_WIDGETS
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: TYPOGRAPHY & COLOR PALETTE */}
              <TabsContent value="style" className="outline-none">
                <StyleSection />
              </TabsContent>

              {/* TAB 2: SHOWCASE COMPONENTS */}
              <TabsContent value="components" className="outline-none">
                <ComponentsSection 
                  logs={logs}
                  clickCount={clickCount}
                  setClickCount={setClickCount}
                  addLog={addLog}
                  handleClearLogs={handleClearLogs}
                />
              </TabsContent>

              {/* TAB 3: SYSTEM TELEMETRY GRAPHS */}
              <TabsContent value="telemetry" className="outline-none">
                <TelemetrySection 
                  currentTelemetryData={currentTelemetryData}
                  handleSimulateSpike={handleSimulateSpike}
                  handleSimulateNetworkBurst={handleSimulateNetworkBurst}
                  handleResetTelemetry={handleResetTelemetry}
                />
              </TabsContent>

              {/* TAB 4: TACTICAL DASHBOARD WIDGETS */}
              <TabsContent value="widgets" className="outline-none">
                <TacticalWidgets addLog={addLog} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* BOTTOM FOOTER */}
        <footer className="border-t border-border bg-card/40 mt-8 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              <span>TEMPLATE-TUI &copy; {new Date().getFullYear()}. All core matrices verified.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1" onClick={(e) => { e.preventDefault(); addLog("Clicked external documentation link."); }}>
                Docs <RiExternalLinkLine className="size-3" />
              </a>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1" onClick={(e) => { e.preventDefault(); addLog("Clicked system manifesto file."); }}>
                System Manifest <RiFolderShieldLine className="size-3" />
              </a>
            </div>
          </div>
        </footer>

      </div>
    </TooltipProvider>
  )
}
