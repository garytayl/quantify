"use client";

import { useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useTradingStore } from "@/lib/store/use-trading-store";
import type { JournalEntry } from "@/types";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const { journal, addJournalEntry } = useTradingStore();
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [strategy, setStrategy] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [notes, setNotes] = useState("");

  const winRate =
    journal.length > 0
      ? (journal.filter((e) => e.profitLoss > 0).length / journal.length) * 100
      : 0;
  const avgReturn =
    journal.length > 0
      ? journal.reduce((s, e) => s + e.profitLoss, 0) / journal.length
      : 0;
  const pnls = journal.map((e) => e.profitLoss);
  const maxDrawdown = (() => {
    let peak = 0;
    let dd = 0;
    let run = 0;
    for (const p of pnls) {
      run += p;
      if (run > peak) peak = run;
      if (peak - run > dd) dd = peak - run;
    }
    return dd;
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    if (Number.isNaN(entry) || Number.isNaN(exit)) return;
    addJournalEntry({
      ticker: ticker || "—",
      strategy: strategy || "—",
      entryPrice: entry,
      exitPrice: exit,
      profitLoss: (exit - entry) * 100,
      notes,
      entryDate: new Date().toISOString().slice(0, 10),
      exitDate: new Date().toISOString().slice(0, 10),
    });
    setTicker("");
    setStrategy("");
    setEntryPrice("");
    setExitPrice("");
    setNotes("");
    setOpen(false);
  }

  const columns: ColumnDef<JournalEntry>[] = [
    { accessorKey: "ticker", header: "Ticker" },
    { accessorKey: "strategy", header: "Strategy" },
    { accessorKey: "entryPrice", header: "Entry", cell: (c) => (c.getValue() as number).toFixed(2) },
    { accessorKey: "exitPrice", header: "Exit", cell: (c) => (c.getValue() as number).toFixed(2) },
    {
      accessorKey: "profitLoss",
      header: "P/L",
      cell: (c) => {
        const v = c.getValue() as number;
        return (
          <span className={v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {v >= 0 ? "+" : ""}{v.toFixed(0)}
          </span>
        );
      },
    },
    { accessorKey: "notes", header: "Notes" },
  ];

  const table = useReactTable({
    data: journal,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <AppShell>
      <div className="min-w-0 space-y-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Trade Journal</h1>
            <p className="text-muted-foreground text-sm">Log trades and track performance.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Log Trade</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Trade</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ticker</Label>
                    <Input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="SPY" />
                  </div>
                  <div className="space-y-2">
                    <Label>Strategy</Label>
                    <Input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Bull Put Spread" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entry price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="1.35"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exit price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 @xl/main:grid-cols-3">
          <KpiCard title="Win Rate" value={`${winRate.toFixed(0)}%`} />
          <KpiCard title="Average Return" value={`$${avgReturn.toFixed(0)}`} />
          <KpiCard title="Max Drawdown" value={`$${maxDrawdown.toFixed(0)}`} />
        </div>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>All logged trades.</CardDescription>
          </CardHeader>
          <CardContent>
            {journal.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No trades yet. Log your first trade above.</p>
            ) : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>{h.column.columnDef.header as string}</TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
