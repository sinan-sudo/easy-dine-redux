import { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

type RestaurantTable = Tables<"restaurant_tables">;

interface FloorMapProps {
  tables: RestaurantTable[];
  reservedTableIds: string[];
  pendingTableIds: string[];
  selectedTableId: string | null;
  onSelectTable: (table: RestaurantTable) => void;
  partySize: number;
}

function Chair({
  angle,
  distance,
  hovered,
  tableShape,
}: {
  angle: number;
  distance: number;
  hovered: boolean;
  tableShape: "round" | "square";
}) {
  const rad = (angle * Math.PI) / 180;
  const restDist = distance;
  const hoverDist = distance + 6;
  const currentDist = hovered ? hoverDist : restDist;

  const x = Math.cos(rad) * currentDist;
  const y = Math.sin(rad) * currentDist;

  return (
    <motion.div
      className="absolute w-[14px] h-[14px] rounded-full border-2 border-muted-foreground/30 bg-secondary/80"
      style={{
        left: "50%",
        top: "50%",
      }}
      animate={{
        x: x - 7,
        y: y - 7,
        scale: hovered ? 1.15 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.6,
      }}
    />
  );
}

function TableUnit({
  table,
  status,
  isSelected,
  isSelectable,
  onSelect,
}: {
  table: RestaurantTable;
  status: "available" | "reserved" | "pending";
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const capacity = table.capacity;
  const isRound = capacity <= 4;
  const tableSize = capacity <= 2 ? 48 : capacity <= 4 ? 56 : capacity <= 6 ? 64 : 72;
  const chairDistance = tableSize / 2 + 12;

  const chairs = Array.from({ length: capacity }, (_, i) => {
    const angle = (360 / capacity) * i - 90;
    return <Chair key={i} angle={angle} distance={chairDistance} hovered={hovered} tableShape={isRound ? "round" : "square"} />;
  });

  const statusColors = {
    available: {
      bg: "bg-emerald/10",
      border: "border-emerald/40",
      text: "text-emerald",
      glow: "shadow-[0_0_20px_-4px_hsl(var(--emerald)/0.3)]",
    },
    pending: {
      bg: "bg-amber-warning/10",
      border: "border-amber-warning/40",
      text: "text-amber-warning",
      glow: "shadow-[0_0_20px_-4px_hsl(var(--amber-warning)/0.3)]",
    },
    reserved: {
      bg: "bg-rose/10",
      border: "border-rose/40",
      text: "text-rose",
      glow: "",
    },
  };

  const colors = statusColors[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`relative flex items-center justify-center cursor-${isSelectable ? "pointer" : "not-allowed"}`}
          style={{
            width: tableSize + 50,
            height: tableSize + 50,
          }}
          onMouseEnter={() => isSelectable && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => isSelectable && onSelect()}
          whileTap={isSelectable ? { scale: 0.95 } : {}}
        >
          {/* Chairs */}
          {chairs}

          {/* Selection glow ring */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className={`absolute ${isRound ? "rounded-full" : "rounded-xl"} border-2 border-primary`}
                style={{
                  width: tableSize + 10,
                  height: tableSize + 10,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Table surface */}
          <motion.div
            className={`
              absolute flex flex-col items-center justify-center
              ${isRound ? "rounded-full" : "rounded-xl"}
              ${colors.bg} ${colors.border} border-2
              ${isSelected ? "border-primary glow-gold" : ""}
              ${!isSelectable && status !== "reserved" && status !== "pending" ? "opacity-40" : ""}
              transition-colors duration-300
            `}
            style={{
              width: tableSize,
              height: tableSize,
            }}
            animate={{
              scale: hovered && isSelectable ? 1.08 : 1,
              boxShadow: hovered && isSelectable
                ? "0 8px 30px -8px hsl(var(--primary) / 0.25)"
                : "0 2px 10px -4px hsl(0 0% 0% / 0.2)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className={`font-heading text-sm font-bold ${isSelected ? "text-primary" : colors.text}`}>
              {table.table_number}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {capacity} seats
            </span>
          </motion.div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="glass-card border-border/50 px-3 py-2">
        <p className="font-heading font-semibold text-sm">Table for {capacity} people</p>
        <p className={`text-xs mt-0.5 ${colors.text}`}>
          {status === "available" ? "Available" : status === "pending" ? "Pending reservation" : "Reserved"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function FloorMap({
  tables,
  reservedTableIds,
  pendingTableIds,
  selectedTableId,
  onSelectTable,
  partySize,
}: FloorMapProps) {
  const getTableStatus = (table: RestaurantTable) => {
    if (reservedTableIds.includes(table.id)) return "reserved";
    if (pendingTableIds.includes(table.id)) return "pending";
    return "available";
  };

  const isSelectable = (table: RestaurantTable) => {
    const status = getTableStatus(table);
    return status === "available" && table.capacity >= partySize;
  };

  const availableCount = tables.filter(t => getTableStatus(t) === "available").length;
  const pendingCount = tables.filter(t => getTableStatus(t) === "pending").length;
  const reservedCount = tables.filter(t => getTableStatus(t) === "reserved").length;

  // Sort tables for layout: smaller tables first row, larger second row
  const sortedTables = [...tables].sort((a, b) => a.capacity - b.capacity);

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-xl font-semibold">Select Your Table</h3>
          <p className="text-xs text-muted-foreground mt-1">Choose from our available seating</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-warning inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose inline-block" /> Reserved
          </span>
        </div>
      </div>

      {/* Floor plan area */}
      <div className="relative w-full bg-muted/20 rounded-2xl border border-border/30 p-8 overflow-hidden min-h-[400px]">
        {/* Decorative elements */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-[2px] bg-muted-foreground/20 rounded" />
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-body">Entrance</span>
          <div className="w-8 h-[2px] bg-muted-foreground/20 rounded" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-[2px] bg-muted-foreground/20 rounded" />
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-body">Kitchen</span>
          <div className="w-8 h-[2px] bg-muted-foreground/20 rounded" />
        </div>

        {/* Window pattern on left */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-8 rounded-full bg-primary/10" />
          ))}
        </div>

        {/* Tables grid */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-8 pb-8">
          {sortedTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <TableUnit
                table={table}
                status={getTableStatus(table)}
                isSelected={selectedTableId === table.id}
                isSelectable={isSelectable(table)}
                onSelect={() => onSelectTable(table)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-6 mt-4 text-xs text-muted-foreground justify-center">
        <span className="text-emerald font-semibold">{availableCount} Available</span>
        <span className="text-amber-warning font-semibold">{pendingCount} Pending</span>
        <span className="text-rose font-semibold">{reservedCount} Reserved</span>
      </div>
    </div>
  );
}
