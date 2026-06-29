"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Printer } from "lucide-react";

type ExerciseRow = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  notes: string;
};

type Day = {
  id: string;
  name: string;
  focus: string;
  exercises: ExerciseRow[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const newExercise = (): ExerciseRow => ({
  id: uid(),
  name: "",
  sets: 3,
  reps: "8-12",
  weight: "",
  rest: "90s",
  notes: "",
});

const starterDays = (): Day[] => [
  {
    id: uid(),
    name: "Day 1",
    focus: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { ...newExercise(), name: "Bench Press", reps: "5", rest: "2-3 min" },
      { ...newExercise(), name: "Overhead Press", reps: "8" },
      { ...newExercise(), name: "Incline DB Press", reps: "10" },
      { ...newExercise(), name: "Triceps Pushdown", reps: "12-15" },
    ],
  },
  {
    id: uid(),
    name: "Day 2",
    focus: "Pull (Back, Biceps)",
    exercises: [
      { ...newExercise(), name: "Deadlift", sets: 3, reps: "5", rest: "3 min" },
      { ...newExercise(), name: "Pull-Ups", reps: "AMRAP" },
      { ...newExercise(), name: "Barbell Row", reps: "8" },
      { ...newExercise(), name: "DB Curl", reps: "12" },
    ],
  },
  {
    id: uid(),
    name: "Day 3",
    focus: "Legs (Quads, Hamstrings, Glutes)",
    exercises: [
      { ...newExercise(), name: "Back Squat", reps: "5", rest: "3 min" },
      { ...newExercise(), name: "Romanian Deadlift", reps: "8" },
      { ...newExercise(), name: "Leg Press", reps: "10-12" },
      { ...newExercise(), name: "Standing Calf Raise", reps: "15" },
    ],
  },
];

export function WorkoutPlanner() {
  const [planName, setPlanName] = useState("My Weekly Plan");
  const [days, setDays] = useState<Day[]>(starterDays);

  const addDay = () =>
    setDays((d) => [
      ...d,
      { id: uid(), name: `Day ${d.length + 1}`, focus: "", exercises: [newExercise()] },
    ]);

  const removeDay = (id: string) => setDays((d) => d.filter((x) => x.id !== id));

  const updateDay = (id: string, patch: Partial<Day>) =>
    setDays((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addExercise = (dayId: string) =>
    updateDayExercises(dayId, (ex) => [...ex, newExercise()]);

  const removeExercise = (dayId: string, exId: string) =>
    updateDayExercises(dayId, (ex) => ex.filter((e) => e.id !== exId));

  const updateExercise = (dayId: string, exId: string, patch: Partial<ExerciseRow>) =>
    updateDayExercises(dayId, (ex) =>
      ex.map((e) => (e.id === exId ? { ...e, ...patch } : e))
    );

  const updateDayExercises = (
    dayId: string,
    fn: (ex: ExerciseRow[]) => ExerciseRow[]
  ) => setDays((d) => d.map((x) => (x.id === dayId ? { ...x, exercises: fn(x.exercises) } : x)));

  const totalSets = days.reduce(
    (n, d) => n + d.exercises.reduce((m, e) => m + (Number(e.sets) || 0), 0),
    0
  );

  const save = () => {
    localStorage.setItem(
      "racira-workout-plan",
      JSON.stringify({ planName, days })
    );
    alert("Plan saved to this browser.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-brand px-1"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-brand text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Save className="h-4 w-4" /> Save
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border text-sm font-medium hover:bg-muted"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Training days" value={days.length} />
        <Stat label="Total exercises" value={days.reduce((n, d) => n + d.exercises.length, 0)} />
        <Stat label="Total sets / week" value={totalSets} />
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day.id} className="rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
              <input
                value={day.name}
                onChange={(e) => updateDay(day.id, { name: e.target.value })}
                className="font-semibold bg-transparent outline-none w-24"
              />
              <input
                value={day.focus}
                onChange={(e) => updateDay(day.id, { focus: e.target.value })}
                placeholder="Focus (e.g. Push, Legs, Full body)"
                className="flex-1 min-w-[200px] bg-transparent outline-none text-sm text-muted-foreground"
              />
              <button
                onClick={() => removeDay(day.id)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Remove day"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="w-6"></th>
                    <th className="text-left font-medium px-3 py-2">Exercise</th>
                    <th className="text-left font-medium px-2 py-2 w-16">Sets</th>
                    <th className="text-left font-medium px-2 py-2 w-24">Reps</th>
                    <th className="text-left font-medium px-2 py-2 w-24">Weight</th>
                    <th className="text-left font-medium px-2 py-2 w-24">Rest</th>
                    <th className="text-left font-medium px-2 py-2">Notes</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((ex) => (
                    <tr key={ex.id} className="border-b border-border last:border-0">
                      <td className="text-muted-foreground pl-2">
                        <GripVertical className="h-4 w-4" />
                      </td>
                      <td className="px-3 py-2">
                        <Cell
                          value={ex.name}
                          placeholder="Exercise name"
                          onChange={(v) => updateExercise(day.id, ex.id, { name: v })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Cell
                          value={String(ex.sets)}
                          onChange={(v) =>
                            updateExercise(day.id, ex.id, { sets: Number(v) || 0 })
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Cell value={ex.reps} onChange={(v) => updateExercise(day.id, ex.id, { reps: v })} />
                      </td>
                      <td className="px-2 py-2">
                        <Cell
                          value={ex.weight}
                          placeholder="—"
                          onChange={(v) => updateExercise(day.id, ex.id, { weight: v })}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Cell value={ex.rest} onChange={(v) => updateExercise(day.id, ex.id, { rest: v })} />
                      </td>
                      <td className="px-2 py-2">
                        <Cell
                          value={ex.notes}
                          placeholder="Notes"
                          onChange={(v) => updateExercise(day.id, ex.id, { notes: v })}
                        />
                      </td>
                      <td className="pr-2">
                        <button
                          onClick={() => removeExercise(day.id, ex.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          aria-label="Remove exercise"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => addExercise(day.id)}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:opacity-80"
              >
                <Plus className="h-4 w-4" /> Add exercise
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addDay}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-border hover:border-brand hover:text-brand text-muted-foreground font-medium"
      >
        <Plus className="h-4 w-4" /> Add training day
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Cell({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent outline-none rounded px-2 py-1 focus:bg-muted"
    />
  );
}
