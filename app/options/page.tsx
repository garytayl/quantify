"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OptionContract } from "@/types";
import { cn } from "@/lib/utils";

type Ticker = "SPY" | "QQQ" | "IWM";

const TICKERS: Ticker[] = ["SPY", "QQQ", "IWM"];

function OptionsPageContent() {
  const searchParams = useSearchParams();
  const tickerParam = searchParams.get("ticker")?.toUpperCase();
  const initialTicker = TICKERS.includes(tickerParam as Ticker) ? (tickerParam as Ticker) : "SPY";
  const [ticker, setTicker] = useState<Ticker>(initialTicker);
  const [type, setType] = useState<"call" | "put">("call");
  const [chain, setChain] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: "strike", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/options/chain?ticker=${ticker}`)
      .then((res) => res.json())
      .then((data: OptionContract[]) => {
        setChain(Array.isArray(data) ? data : []);
      })
      .catch(() => setChain([]))
      .finally(() => setLoading(false));
  }, [ticker]);

  const data = useMemo(() => {
    return chain.filter((c) => c.type === type);
  }, [chain, type]);

  const columns: ColumnDef<OptionContract>[] = useMemo(
    () => [
      { accessorKey: "strike", header: "Strike", cell: (c) => `$${c.getValue() as number}` },
      { accessorKey: "bid", header: "Bid", cell: (c) => (c.getValue() as number).toFixed(2) },
      { accessorKey: "ask", header: "Ask", cell: (c) => (c.getValue() as number).toFixed(2) },
      {
        accessorKey: "delta",
        header: "Delta",
        cell: (c) => ((c.getValue() as number) * 100).toFixed(0) + "Δ",
      },
      {
        accessorKey: "iv",
        header: "IV",
        cell: (c) => ((c.getValue() as number) * 100).toFixed(1) + "%",
      },
      { accessorKey: "volume", header: "Volume", cell: (c) => (c.getValue() as number).toLocaleString() },
      { accessorKey: "openInterest", header: "Open Int.", cell: (c) => (c.getValue() as number).toLocaleString() },
      {
        id: "actions",
        header: "",
        cell: () => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" asChild>
              <Link href="/scanner">Build Spread</Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/scanner">Add to Strategy</Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <AppShell>
      <div className="space-y-4 px-4 lg:px-6">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Options Chain</CardTitle>
            <CardDescription>
              Strike, bid, ask, delta, IV, volume, open interest. Sort and filter, then build spreads or add to strategy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <select
                className="border-input bg-background h-10 min-h-[44px] rounded-md border px-3 text-base sm:h-9 sm:min-h-0 sm:text-sm"
                value={ticker}
                onChange={(e) => setTicker(e.target.value as Ticker)}
              >
                <option value="SPY">SPY</option>
                <option value="QQQ">QQQ</option>
                <option value="IWM">IWM</option>
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={type === "call" ? "default" : "outline"}
                  onClick={() => setType("call")}
                  className="min-h-[44px] min-w-[44px] touch-manipulation sm:min-h-0 sm:min-w-0"
                >
                  Calls
                </Button>
                <Button
                  size="sm"
                  variant={type === "put" ? "default" : "outline"}
                  onClick={() => setType("put")}
                  className="min-h-[44px] min-w-[44px] touch-manipulation sm:min-h-0 sm:min-w-0"
                >
                  Puts
                </Button>
              </div>
              <Input
                placeholder="Filter..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="min-h-[44px] w-full touch-manipulation sm:min-h-0 sm:max-w-xs"
              />
            </div>
            <div className="overflow-x-auto rounded-md border border-border/50 overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <p className="text-muted-foreground mb-1.5 text-xs sm:hidden">Scroll → for more columns</p>
              <Table className="min-w-[640px]">
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id} className="whitespace-nowrap">
                          {h.column.columnDef.header as string}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                        Loading chain…
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                        No options for this ticker.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className={cn(cell.column.id === "actions" && "w-0")}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function OptionsPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center px-4">
          <p className="text-muted-foreground">Loading options…</p>
        </div>
      </AppShell>
    }>
      <OptionsPageContent />
    </Suspense>
  );
}
