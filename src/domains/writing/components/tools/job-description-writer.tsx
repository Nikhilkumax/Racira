"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  TextInput,
} from "./ui";
import { buildJobDescription } from "@/domains/writing/lib/text/job-description.ts";

/**
 * Job description writer: a posting assembled from your lines, checked against
 * the published inclusive-hiring guidance.
 */
export default function JobDescriptionWriter() {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (id: string) => (value: string) => setValues((previous) => ({ ...previous, [id]: value }));
  const job = useMemo(() => buildJobDescription(values), [values]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The role</PanelTitle>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="title" label="Title" value={values.title ?? ""} onChange={set("title")} placeholder="Junior data analyst" />
            <TextInput name="company" label="Company" value={values.company ?? ""} onChange={set("company")} placeholder="Northfield Council" />
          </div>
          <TextArea
            name="purpose"
            label="Why this role"
            value={values.purpose ?? ""}
            onChange={set("purpose")}
            rows={2}
            placeholder="This role exists to turn service data into the monthly decisions the leadership team makes."
          />
          <TextArea
            name="responsibilities"
            label="What you will do, one per line"
            value={values.responsibilities ?? ""}
            onChange={set("responsibilities")}
            rows={5}
            placeholder={"Build the monthly service dashboard\nClean and document the incoming data"}
          />
          <TextArea
            name="requirements"
            label="What you bring, one per line"
            value={values.requirements ?? ""}
            onChange={set("requirements")}
            rows={4}
            placeholder={"Two years working with data\nStrong spreadsheet skills"}
          />
          <TextArea
            name="niceToHave"
            label="Nice to have, one per line"
            value={values.niceToHave ?? ""}
            onChange={set("niceToHave")}
            rows={3}
            placeholder="Experience with local government data"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="salary" label="Salary or range" value={values.salary ?? ""} onChange={set("salary")} placeholder="32,000 to 36,000" />
            <TextInput name="location" label="Location and arrangement" value={values.location ?? ""} onChange={set("location")} placeholder="Hybrid: two days a week in Northfield" />
          </div>
          <TextInput
            name="apply"
            label="How to apply"
            value={values.apply ?? ""}
            onChange={set("apply")}
            placeholder="Send a CV and a one page note to jobs@northfield.example by 30 October."
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={job.output ? <CopyButton text={job.output} testid="copy-jd" /> : undefined}>
          The posting
        </PanelTitle>
        <HeroStat
          label="Responsibilities"
          value={job.counts.responsibilities}
          testid="res-responsibilities"
          sub={`${job.counts.requirements} requirements · ${job.counts.niceToHave} nice-to-have`}
        />
        <StatGrid>
          <Stat label="Requirements" value={job.counts.requirements} testid="res-requirements" />
          <Stat label="Nice to have" value={job.counts.niceToHave} testid="res-nice" />
          <Stat label="Checks" value={job.checks.length} testid="res-checks-count" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="jd" value={job.output} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={job.output} filename="job-description.txt" testid="download-jd" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {job.checks.length === 0 ? (
          <Notice>No documented problem: the posting states the pay, the location, the route to apply and uses no coded language.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {job.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The checks apply published inclusive-hiring guidance: coded language narrows who applies, a long
            requirements list filters rather than invites, and salary, location and the application route are what a
            candidate looks for first.
          </Notice>
          <Notice tone="warn">
            The list of coded words is a published set, not a complete one, and context decides. Read every flagged
            line back to yourself before changing it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
