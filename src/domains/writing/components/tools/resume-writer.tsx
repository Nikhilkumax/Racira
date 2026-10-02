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
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildResume } from "@/domains/writing/lib/text/resume.ts";

/**
 * Resume writer: assemble a plain-text resume from a header, a summary, dated
 * experience and education entries and a skills line, then check each entry.
 */
export default function ResumeWriter() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [contact, setContact] = useState("");
  const [summary, setSummary] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const draft = useMemo(
    () =>
      buildResume({
        name,
        title,
        contact,
        summary,
        experience: lines(experienceText),
        education: lines(educationText),
        skills: lines(skillsText.replace(/,/g, "\n")),
      }),
    [name, title, contact, summary, experienceText, educationText, skillsText],
  );
  const hasParts =
    name.trim().length > 0 ||
    title.trim().length > 0 ||
    contact.trim().length > 0 ||
    summary.trim().length > 0 ||
    experienceText.trim().length > 0 ||
    educationText.trim().length > 0 ||
    skillsText.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">role | company | dates | achievement</span>}>
          Header and entries
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="name" label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <TextInput name="title" label="Title" value={title} onChange={setTitle} placeholder="Support Engineer" />
          <TextInput name="contact" label="Contact" value={contact} onChange={setContact} placeholder="ada@example.com · Bristol" />
        </div>
        <div className="mt-3 grid gap-3">
          <TextArea
            name="summary"
            label="Summary"
            value={summary}
            onChange={setSummary}
            rows={2}
            placeholder="Support engineer with six years in B2B software."
            hint="two lines at most"
          />
          <TextArea
            name="experience"
            label="Experience — one entry per line"
            value={experienceText}
            onChange={setExperienceText}
            rows={5}
            placeholder={"Support Engineer | Acme Analytics | 2021–present | Cut first-response time 40% across 2,000 tickets"}
          />
          <TextArea
            name="education"
            label="Education — one entry per line"
            value={educationText}
            onChange={setEducationText}
            rows={3}
            placeholder={"BSc Computer Science | University of Bristol | 2018"}
          />
          <TextArea
            name="skills"
            label="Skills — one per line or comma-separated"
            value={skillsText}
            onChange={setSkillsText}
            rows={2}
            placeholder={"SQL, Zendesk, Technical writing"}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.resume} testid="copy-resume" label="Copy" />
                <DownloadButton text={draft.resume} filename="resume.txt" testid="download-resume" label="Download" />
              </span>
            ) : undefined
          }
        >
          Resume
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Fill in the header and one entry — the resume assembles as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="a plain-text draft to paste and refine" />
            <StatGrid>
              <Stat label="Sections" value={draft.sections} testid="res-sections" />
              <Stat label="Experience entries" value={draft.experience.length} testid="res-entries" />
              <Stat label="Quantified" value={`${draft.quantified}/${draft.experience.length}`} testid="res-quantified" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="resume" value={draft.resume} maxHeight={420} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the experience fits the role is still a judgement call.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={`${check.id}-${check.message}`}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The writer assembles your entries into a conventional resume text and checks their shape: complete lines, a
            number in each achievement, a summary that is not an essay. It invents no experience.
          </Notice>
          <Notice tone="warn">
            Applicant tracking systems and recruiters have their own formats and expectations. Treat this as a
            plain-text master — retype it into the layout each application asks for.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
