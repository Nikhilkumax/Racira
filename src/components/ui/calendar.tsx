"use client";

import * as React from "react";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import type { CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

// ─── Custom Caption: single-row ‹ Month▼ Year▼ › ─────────────────────────────
function CleanCaption({ displayMonth }: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  const { fromYear, toYear } = useDayPicker();

  const month = displayMonth.getMonth();   // 0-indexed
  const year  = displayMonth.getFullYear();

  const startYear = fromYear ?? 1900;
  const endYear   = toYear   ?? year + 10;
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    goToMonth(new Date(year, parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    goToMonth(new Date(parseInt(e.target.value), month, 1));
  };

  return (
    <div className="calendar-header">
      {/* Prev arrow */}
      <button
        type="button"
        className="cal-nav-btn"
        aria-label="Go to previous month"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        ‹
      </button>

      {/* Month dropdown */}
      <select
        className="cal-select"
        aria-label="Select month"
        value={month}
        onChange={handleMonthChange}
      >
        {MONTHS.map((m, i) => (
          <option key={m} value={i}>{m}</option>
        ))}
      </select>

      {/* Year dropdown */}
      <select
        className="cal-select"
        aria-label="Select year"
        value={year}
        onChange={handleYearChange}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Next arrow */}
      <button
        type="button"
        className="cal-nav-btn"
        aria-label="Go to next month"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        ›
      </button>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("calendar-popup", className)}
      // Use "buttons" layout so DayPicker sets up the navigation context;
      // our custom Caption component fully replaces the header.
      captionLayout="buttons"
      classNames={{
        months: "flex flex-col sm:flex-row",
        month: "space-y-1",
        // Hide the default caption wrapper — our CleanCaption already wraps it
        caption: "",
        caption_label: "hidden",
        // Hide default nav buttons — our CleanCaption handles navigation
        nav: "hidden",
        nav_button: "hidden",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "calendar-grid",
        head_row: "",
        head_cell: "",
        row: "",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
        day_today: "bg-accent text-accent-foreground rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CleanCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
