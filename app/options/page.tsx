"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
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
import { mockOptionChains } from "@/lib/market/mock-data";
import type { OptionContract } from "@/types";
import { cn } from "@/lib/utils";

type Ticker = keyof typeof mockOptionChains;

export default function OptionsPage() {
  const [ticker, setTicker] = useState<Ticker>("SPY");
  const [type, setType] = useState<"call" | "put">("call");
  const [sorting, setSorting] = useState<SortingState>([{ id: "strike", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const data = useMemo(() => {
    return mockOptionChains[ticker].filter((c) => c.type === type);
  }, [ticker, type]);

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
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              Build Spread
            </Button>
            <Button size="sm" variant="ghost">
              Add to Strategy
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
            <div className="flex flex-wrap items-center gap-4">
              <select
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
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
                >
                  Calls
                </Button>
                <Button
                  size="sm"
                  variant={type === "put" ? "default" : "outline"}
                  onClick={() => setType("put")}
                >
                  Puts
                </Button>
              </div>
              <Input
                placeholder="Filter..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="overflow-auto rounded-md border border-border/50">
              <Table>
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn(cell.column.id === "actions" && "w-0")}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
