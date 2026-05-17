"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import api from "@/lib/axios";
import { StudentDashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

function statusScore(status) {
  if (status === "Present") return 100;
  if (status === "Late") return 70;
  return 25;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const [attSeries, setAttSeries] = useState([]);
  const [resultSeries, setResultSeries] = useState([]);
  const [attPct, setAttPct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d0, prof] = await Promise.all([
          api.get("/dashboard/student"),
          api.get("/auth/profile"),
        ]);
        if (cancelled) return;
        setDash(d0.data);
        const sid = prof.data?.studentId;
        if (sid) {
          const [attRes, exRes] = await Promise.all([
            api.get(`/attendance/student/${sid}`),
            api.get(`/exams/results/student/${sid}`),
          ]);
          const records = attRes.data?.records || [];
          const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
          const tail = sorted.slice(-12).map((r, i) => ({
            label: `${i + 1}`,
            score: statusScore(r.status),
            date: new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          }));
          setAttSeries(tail);
          setAttPct(
            attRes.data?.stats?.percentage != null ? Number(attRes.data.stats.percentage) : null
          );

          const results = Array.isArray(exRes.data) ? exRes.data : [];
          const rSeries = results.map((r, i) => ({
            label:
              r.examId?.examName?.length > 10
                ? `${r.examId.examName.slice(0, 8)}…`
                : r.examId?.examName || `Exam ${i + 1}`,
            pct: Math.round(Number(r.percentage) * 10) / 10,
          }));
          setResultSeries(rSeries);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = dash?.upcomingAssignments || [];

  const latestGrade = useMemo(() => {
    if (!resultSeries.length) return dash?.latestResults?.[0]?.score || "—";
    const top = [...resultSeries].sort((a, b) => b.pct - a.pct)[0];
    return top ? `${top.pct}%` : "—";
  }, [resultSeries, dash]);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  };

  const tooltip = {
    borderRadius: 14,
    border: "1px solid var(--border, #e4e4e7)",
    background: "var(--card, #fff)",
    boxShadow: "0 12px 40px -12px rgb(0 0 0 / 0.18)",
  };

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  const displayAtt =
    attPct != null
      ? `${Math.round(attPct * 10) / 10}%`
      : dash?.attendancePercentage != null
        ? `${dash.attendancePercentage}%`
        : "—";

  const kpis = [
    {
      label: "Attendance",
      value: displayAtt,
      sub: "From your attendance record stats",
      icon: GraduationCap,
      bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Best result (recent)",
      value: latestGrade,
      sub: "Highest exam % in loaded results",
      icon: Star,
      bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Upcoming tasks",
      value: upcoming.length || dash?.assignmentsDue || 0,
      sub: "From dashboard summary",
      icon: BookOpen,
      bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-6xl space-y-10 pb-8">
      <motion.div variants={item} className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your analytics
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Academic pulse
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Attendance trajectory from `/attendance/student`, and result progression from `/exams/results/student`.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                {s.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{s.value}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{s.sub}</p>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg}`}>
              <s.icon className="h-7 w-7" />
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-lg dark:from-zinc-950 dark:to-zinc-900 lg:col-span-3"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Attendance pulse</h3>
              <p className="text-sm text-zinc-400">Recent sessions (scored: present 100, late 70, absent 25)</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              Live
            </div>
          </div>
          <div className="h-[260px] w-full text-zinc-500">
            {attSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No attendance history yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ ...tooltip, background: "#18181b", borderColor: "#27272a", color: "#fafafa" }}
                    labelFormatter={(_, p) => p?.payload?.date || ""}
                  />
                  <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} fill="url(#attGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-4 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <Clock className="h-5 w-5 text-primary" />
            Next deadlines
          </h3>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
                No upcoming items from the dashboard API.
              </p>
            ) : (
              upcoming.map((task, i) => (
                <motion.div
                  key={task.id || i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="group flex cursor-default items-center justify-between rounded-3xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm transition hover:border-primary/25 dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-zinc-500">{task.dueDate}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-zinc-300 transition group-hover:text-primary" />
                </motion.div>
              ))
            )}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/25">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-medium leading-relaxed text-emerald-900 dark:text-emerald-200">
              Charts use your real attendance rows and published exam results. Visit{" "}
              <span className="font-semibold">My Results</span> for the full list.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={item}
        className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Result progress</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Exam percentage by sitting</p>
          </div>
          <Calendar className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="h-[240px] w-full text-zinc-500">
          {resultSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No graded results yet — check back after teachers publish marks.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resultSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/80 dark:stroke-zinc-800" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={56} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltip} formatter={(v) => [`${v}%`, "Score"]} />
                <Bar dataKey="pct" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {dash?.latestResults?.length > 0 && (
        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Dashboard highlights</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dash.latestResults.map((res, i) => (
              <div
                key={res.id || i}
                className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40"
              >
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{res.subject}</span>
                <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                  {res.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
