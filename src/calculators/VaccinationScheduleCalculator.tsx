"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Syringe, CalendarClock, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface VaccineMilestone {
  ageLabel: string;
  dateStr: string;
  dateObj: Date;
  isPast: boolean;
  isNext: boolean;
  vaccines: string[];
}

interface ScheduleResult {
  currentAgeStr: string;
  milestones: VaccineMilestone[];
  nextAppointmentStr: string | null;
  chartData: { name: string; count: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSchedule(dobStr: string): ScheduleResult {
  const dob = new Date(dobStr);
  const today = new Date();
  
  // Calculate current age
  const diffTime = Math.abs(today.getTime() - dob.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.44);
  const diffYears = Math.floor(diffDays / 365.25);
  
  let currentAgeStr = "";
  if (diffDays < 30) currentAgeStr = `${diffDays} Days`;
  else if (diffMonths < 24) currentAgeStr = `${diffMonths} Months`;
  else currentAgeStr = `${diffYears} Years, ${diffMonths % 12} Months`;

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const addYears = (date: Date, years: number) => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  };

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Define CDC Milestones
  const scheduleDef = [
    { label: "Birth", date: dob, vax: ["HepB (1st Dose)"] },
    { label: "2 Months", date: addMonths(dob, 2), vax: ["HepB (2nd)", "Rotavirus (RV)", "DTaP", "Hib", "Pneumococcal (PCV)", "Polio (IPV)"] },
    { label: "4 Months", date: addMonths(dob, 4), vax: ["Rotavirus (RV)", "DTaP", "Hib", "Pneumococcal (PCV)", "Polio (IPV)"] },
    { label: "6 Months", date: addMonths(dob, 6), vax: ["HepB (3rd)", "DTaP", "Pneumococcal (PCV)", "Polio (IPV)", "Influenza (Yearly)"] },
    { label: "12 Months", date: addMonths(dob, 12), vax: ["Hib", "Pneumococcal (PCV)", "MMR (1st)", "Varicella/Chickenpox (1st)", "HepA (1st)"] },
    { label: "15 Months", date: addMonths(dob, 15), vax: ["DTaP"] },
    { label: "18 Months", date: addMonths(dob, 18), vax: ["HepA (2nd)"] },
    { label: "4-6 Years", date: addYears(dob, 4), vax: ["DTaP", "Polio (IPV)", "MMR (2nd)", "Varicella/Chickenpox (2nd)"] },
    { label: "11-12 Years", date: addYears(dob, 11), vax: ["Tdap", "HPV (2 doses)", "Meningococcal (MenACWY)"] },
    { label: "16 Years", date: addYears(dob, 16), vax: ["Meningococcal (MenACWY 2nd)", "MenB (Optional)"] },
  ];

  let nextApptFound = false;
  let nextAppointmentStr: string | null = null;
  const milestones: VaccineMilestone[] = [];
  const chartData = [];

  for (const item of scheduleDef) {
    // Normalize times for accurate past/future comparison (ignoring hours/minutes)
    const itemTime = new Date(item.date).setHours(0,0,0,0);
    const todayTime = new Date().setHours(0,0,0,0);
    
    const isPast = itemTime < todayTime;
    let isNext = false;

    if (!isPast && !nextApptFound) {
      isNext = true;
      nextApptFound = true;
      nextAppointmentStr = formatDate(item.date);
    }

    milestones.push({
      ageLabel: item.label,
      dateStr: formatDate(item.date),
      dateObj: item.date,
      isPast,
      isNext,
      vaccines: item.vax
    });

    // Color code chart based on past/future
    chartData.push({
      name: item.label,
      count: item.vax.length,
      fill: isPast ? "#cbd5e1" : (isNext ? "#3b82f6" : "#94a3b8")
    });
  }

  // If all are past
  if (!nextApptFound) {
    nextAppointmentStr = "All milestones complete!";
  }

  const summaryStats = [
    { label: "Current Age", value: currentAgeStr },
    { label: "Total CDC Doses (0-18)", value: "35+" },
    { label: "Status", value: nextApptFound ? "In Progress" : "Up to Date" }
  ];

  return {
    currentAgeStr,
    milestones,
    nextAppointmentStr,
    chartData,
    summaryStats
  };
}

export default function VaccinationScheduleCalculator() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<ScheduleResult | null>(null);

  // Initialize with a 3-month-old child
  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
    const y = threeMonthsAgo.getFullYear();
    const m = String(threeMonthsAgo.getMonth() + 1).padStart(2, '0');
    const d = String(threeMonthsAgo.getDate()).padStart(2, '0');
    const defaultDob = `${y}-${m}-${d}`;
    
    setDob(defaultDob);
    setResult(calcSchedule(defaultDob));
  }, []);

  const calculate = () => {
    if (dob) {
      const d = new Date(dob);
      if (d > new Date()) {
        alert("Date of birth cannot be in the future.");
        return;
      }
      setResult(calcSchedule(dob));
    }
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Are these dates exact?", answer: "The calculator provides the exact date your child hits the specific age milestone. However, in reality, doctors allow a small 'grace window' (usually a few weeks) around the milestone to schedule the appointment. Always consult your pediatrician's front desk for exact booking availability." },
    { question: "Why are there so many vaccines at 2 and 4 months?", answer: "Infants are highly vulnerable to diseases because their immune systems are not fully developed. The CDC schedule is explicitly designed to provide life-saving antibodies to infants as early as their bodies can safely process them, closing the 'vulnerability gap' before they are exposed to viruses in daycares or public spaces." },
    { question: "What is DTaP?", answer: "DTaP is a combination vaccine that protects against three severe bacterial diseases: Diphtheria, Tetanus (lockjaw), and Pertussis (whooping cough). Whooping cough is particularly dangerous and often fatal for infants under 6 months old." },
    { question: "Why do some vaccines require multiple doses?", answer: "Some vaccines (like HepB) do not provide full immunity after a single shot. The first dose 'primes' the immune system, and subsequent doses 'boost' the immune response until the body reaches a high enough antibody threshold for permanent, lifelong protection." },
    { question: "What if my child missed a dose?", answer: "Do not panic. You do not need to restart the entire series. The CDC has a specific 'Catch-Up Schedule' for children who have fallen behind. Contact your pediatrician, and they will arrange a tailored schedule to get your child back on track as quickly and safely as possible." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Vaccination Schedule Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">CDC Pediatric Vaccination Schedule Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm sticky top-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Child's Date of Birth</label>
              <div className={inp}><input type="date" value={dob} onChange={e => setDob(e.target.value)} className={ci} max={new Date().toISOString().split("T")[0]} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Used to calculate upcoming age milestones.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base transition-all shadow-sm">
                <CalendarClock className="h-5 w-5" /> Generate Timeline
              </button>
            </div>

            {result && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="text-[10px] font-bold uppercase text-primary tracking-wider mb-1">Next Appointment Goal</div>
                  <div className="text-lg font-bold text-foreground leading-tight">{result.nextAppointmentStr}</div>
                </div>
                
                <div className="mt-4 space-y-3">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground font-medium">{s.label}</span>
                      <span className="font-bold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {result && (<>
              
              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-muted px-5 py-3 border-b border-border flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Personalized Immunization Timeline</h3>
                </div>
                
                <div className="p-0">
                  {result.milestones.map((m, i) => (
                    <div key={i} className={`flex flex-col sm:flex-row relative border-b border-border last:border-0 ${m.isPast ? "bg-muted/30" : ""} ${m.isNext ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                      {m.isNext && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                      
                      <div className="sm:w-1/3 p-4 sm:border-r border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          {m.isPast ? (
                            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          ) : m.isNext ? (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          )}
                          <span className={`text-sm font-bold uppercase tracking-wider ${m.isPast ? "text-muted-foreground" : "text-foreground"}`}>{m.ageLabel}</span>
                        </div>
                        <div className={`text-base font-bold ${m.isNext ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>{m.dateStr}</div>
                        {m.isNext && <div className="text-[10px] font-bold uppercase text-blue-500 tracking-wider mt-1">Upcoming</div>}
                      </div>

                      <div className="sm:w-2/3 p-4">
                        <div className="flex flex-wrap gap-2">
                          {m.vaccines.map((vax, idx) => (
                            <div key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              m.isPast 
                                ? "bg-background text-muted-foreground border-border" 
                                : m.isNext
                                  ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50"
                                  : "bg-primary/5 text-foreground border-primary/10"
                            }`}>
                              <Syringe className="w-3 h-3" /> {vax}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Immunization Volume by Age Milestone</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} angle={-45} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} Doses`, "Scheduled"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={35}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground text-center mt-2">Blue indicates the next upcoming milestone. Grey indicates past milestones.</p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Importance of the CDC Immunization Schedule</h2>
            <p>The Centers for Disease Control and Prevention (CDC), in collaboration with the American Academy of Pediatrics (AAP), publishes an updated childhood immunization schedule every year. This schedule is not arbitrarily designed; it is the result of decades of clinical trials, epidemiological data, and virology research aimed at protecting infants at their most vulnerable stages of life.</p>
            <p>This <strong>Vaccination Schedule Calculator</strong> maps your child's exact date of birth to the official CDC timeline, ensuring you never miss a critical milestone.</p>

            <h2>Why Are Vaccines Given So Early?</h2>
            <p>A common question from parents is why infants need so many shots at 2, 4, and 6 months of age. When a baby is born, they possess some passive immunity—temporary antibodies passed through the placenta from the mother. However, this passive immunity degrades rapidly in the first few months of life.</p>
            <p>Simultaneously, the infant's own immune system is incredibly immature. If a 3-month-old contracts Pertussis (Whooping Cough) or Pneumococcal meningitis, their body simply cannot fight it off, leading to catastrophic outcomes. The CDC schedule is meticulously timed to train the infant's immune system to produce its own antibodies <em>exactly</em> as the mother's passive antibodies fade, closing the dangerous "vulnerability gap."</p>

            <h2>Understanding the Core Vaccines</h2>
            <ul>
              <li><strong>DTaP (Diphtheria, Tetanus, Pertussis):</strong> Protects against three severe bacterial infections. Pertussis is highly contagious and causes violent coughing fits that make it impossible for infants to breathe.</li>
              <li><strong>Polio (IPV):</strong> Protects against poliomyelitis, a crippling and potentially deadly viral disease that can infect a person's spinal cord, causing paralysis.</li>
              <li><strong>MMR (Measles, Mumps, Rubella):</strong> Given at 12 months. Measles is one of the most highly contagious viruses on Earth. A single infected person can infect 90% of the unvaccinated people close to them.</li>
              <li><strong>Hib (Haemophilus influenzae type b):</strong> Before this vaccine, Hib was the leading cause of bacterial meningitis in children under 5, which can cause severe brain damage or death.</li>
            </ul>

            <h2>Herd Immunity and the Community</h2>
            <p>Following the standard vaccination schedule does not just protect your child; it protects the entire community. This concept is known as <strong>Herd Immunity</strong>.</p>
            <p>Certain individuals cannot receive vaccines. This includes newborns who are too young, children undergoing chemotherapy for leukemia, and individuals with severe immune system disorders. These vulnerable people rely entirely on the rest of the community being vaccinated. When a high percentage of the population is immunized (typically 90-95%), viruses are deprived of the hosts they need to spread, effectively stopping outbreaks in their tracks and creating a protective shield around those who cannot be vaccinated.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vaccination-schedule-calculator" />
          <PopularCalculators exclude="/calculator/vaccination-schedule-calculator" />
        </div>
      </div>
    </>
  );
}
