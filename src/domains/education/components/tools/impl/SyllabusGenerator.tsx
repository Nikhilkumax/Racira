import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SyllabusGenerator() {
  const [d, setD] = useState({
    course: "Introduction to Biology", instructor: "Dr. Smith", term: "Fall 2026",
    email: "smith@school.edu", description: "", objectives: "", grading: "",
    policies: "", schedule: "",
  });
  const set = (k: string) => (e: any) => setD({ ...d, [k]: e.target.value });
  const [preview, setPreview] = useState(false);
  if (preview) {
    return (
      <div>
        <Button variant="outline" onClick={() => setPreview(false)} className="mb-4">Edit</Button>
        <div className="prose max-w-none border rounded-lg p-8 bg-white">
          <h1>{d.course}</h1>
          <p><b>Instructor:</b> {d.instructor} · <b>Term:</b> {d.term} · <b>Contact:</b> {d.email}</p>
          <h2>Course Description</h2><p className="whitespace-pre-wrap">{d.description}</p>
          <h2>Objectives</h2><p className="whitespace-pre-wrap">{d.objectives}</p>
          <h2>Grading</h2><p className="whitespace-pre-wrap">{d.grading}</p>
          <h2>Policies</h2><p className="whitespace-pre-wrap">{d.policies}</p>
          <h2>Schedule</h2><p className="whitespace-pre-wrap">{d.schedule}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Course Name</Label><Input value={d.course} onChange={set("course")} /></div>
        <div><Label>Instructor</Label><Input value={d.instructor} onChange={set("instructor")} /></div>
        <div><Label>Term</Label><Input value={d.term} onChange={set("term")} /></div>
        <div><Label>Contact Email</Label><Input value={d.email} onChange={set("email")} /></div>
      </div>
      <div><Label>Description</Label><Textarea rows={3} value={d.description} onChange={set("description")} /></div>
      <div><Label>Objectives</Label><Textarea rows={3} value={d.objectives} onChange={set("objectives")} /></div>
      <div><Label>Grading Policy</Label><Textarea rows={3} value={d.grading} onChange={set("grading")} /></div>
      <div><Label>Course Policies</Label><Textarea rows={3} value={d.policies} onChange={set("policies")} /></div>
      <div><Label>Weekly Schedule</Label><Textarea rows={4} value={d.schedule} onChange={set("schedule")} /></div>
      <Button onClick={() => setPreview(true)}>Generate Syllabus</Button>
    </div>
  );
}
