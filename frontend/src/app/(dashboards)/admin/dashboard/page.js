"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Sparkles,
  School,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "@/lib/axios";
import { AdminDashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

const PIE_COLORS = ["#22c55e", "#ef4444", "#eab308", "#3b82f6", "#a855f7"];

function groupBy(items, key) {
  const m = {};
  for (const it of items) {
    const k = key(it);
    if (!k) continue;
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const [attStats, setAttStats] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignOverview, setAssignOverview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d0, a0, s0, t0, e0, o0] = await Promise.all([
          api.get("/dashboard/admin"),
          api.get("/attendance/admin/stats"),
          api.get("/students"),
          api.get("/teachers"),
          api.get("/exams"),
          api.get("/assignments/admin/overview").catch(() => ({ data: null })),
        ]);
        if (cancelled) return;
        setDash(d0.data);
        setAttStats(Array.isArray(a0.data) ? a0.data : []);
        setStudents(Array.isArray(s0.data?.students) ? s0.data.students : []);
        setTeachers(Array.isArray(t0.data) ? t0.data : []);
        setExams(Array.isArray(e0.data) ? e0.data : []);
        setAssignOverview(o0?.data || null);
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

  const studentsByClass = useMemo(() => groupBy(students, (s) => s.class || "Unknown"), [students]);

  const examsByClass = useMemo(() => groupBy(exams, (e) => e.class || "Unknown"), [exams]);

  const attendancePie = useMemo(
    () =>
      attStats.map((row) => ({
        name: row._id || "Unknown",
        value: row.count,
      })),
    [attStats]
  );

  const enrollmentTrend = useMemo(() => {
    const total = students.length;
    const byClass = studentsByClass.slice(0, 6);
    if (byClass.length === 0) {
      return [
        { label: "All", students: total },
      ];
    }
    return byClass.map((c) => ({
      label: c.name,
      students: c.value,
    }));
  }, [studentsByClass, students.length]);

  const examPerfBars = useMemo(() => {
    return exams.slice(0, 8).map((ex) => ({
      name: ex.examName?.length > 14 ? `${ex.examName.slice(0, 12)}…` : ex.examName || "Exam",
      full: ex.examName,
      class: ex.class,
      subjects: ex.subjects?.length || 0,
    }));
  }, [exams]);

  const teacherFeed = useMemo(() => {
    return [...teachers]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 8)
      .map((t) => ({
        id: t._id,
        name: t.name,
        action: `${t.subject || "Subject"} · ${(t.assignedClasses || []).join(", ") || "—"}`,
        time: formatShortDate(t.updatedAt || t.createdAt),
      }));
  }, [teachers]);

  const attTotal = attendancePie.reduce((a, b) => a + b.value, 0);
  const attRate =
    attTotal > 0
      ? Math.round(
          ((attendancePie.find((x) => x.name === "Present")?.value || 0) / attTotal) * 1000
        ) / 10
      : null;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const kpis = [
    {
      label: "Students",
      value: dash?.totalStudents ?? students.length,
      sub: "User accounts with student role",
      icon: GraduationCap,
      accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Teachers",
      value: dash?.totalTeachers ?? teachers.length,
      sub: "Active staff accounts",
      icon: Users,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Attendance (present)",
      value: attRate != null ? `${attRate}%` : "—",
      sub: attTotal ? `From ${attTotal} marked records` : "No attendance data yet",
      icon: TrendingUp,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Assignments",
      value: assignOverview?.totalAssignments ?? "—",
      sub: assignOverview
        ? `${assignOverview.totalSubmissions} submissions · ${assignOverview.evaluatedCount} graded`
        : "Load assignment overview",
      icon: ClipboardList,
      accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
  ];

  const chartTooltipStyle = {
    borderRadius: 14,
    border: "1px solid var(--border, #e4e4e7)",
    background: "var(--card, #fff)",
    boxShadow: "0 12px 40px -12px rgb(0 0 0 / 0.2)",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-10 pb-8">
      <motion.div variants={item} className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Live analytics
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Operations overview
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Enrollment distribution, attendance mix, exam footprint, and recent teacher roster — powered by your
            existing APIs.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
            Admin
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500">
            <School className="h-4 w-4" />
            {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/[0.02] backdrop-blur transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:ring-white/[0.04]"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${k.accent}`}>
              <k.icon className="h-6 w-6" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {k.label}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{k.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{k.sub}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-2"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Students by class</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Headcount from the student directory</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {students.length} total
            </span>
          </div>
          <div className="h-[300px] w-full text-zinc-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/80 dark:stroke-zinc-800" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{fill: 'transparent'}} />
                <Bar dataKey="students" fill="url(#colorStudents)" radius={[10, 10, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Attendance mix</h3>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Aggregated from all attendance records</p>
          <div className="h-[280px] w-full text-zinc-500">
            {attendancePie.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No attendance logged yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    animationDuration={1500}
                  >
                    {attendancePie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-lg dark:from-zinc-950 dark:to-zinc-900"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Exam footprint</h3>
              <p className="text-sm text-zinc-400">Scheduled exams (recent)</p>
            </div>
            <BookOpen className="h-6 w-6 text-zinc-500" />
          </div>
          <div className="h-[260px] w-full text-zinc-400">
            {examPerfBars.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">No exams scheduled</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={examPerfBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="examArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ ...chartTooltipStyle, background: "#18181b", borderColor: "#27272a", color: "#fafafa" }}
                    formatter={(v) => [`${v} subjects`, ""]}
                    labelFormatter={(_, p) => p?.payload?.full || p?.payload?.name || ""}
                  />
                  <Area type="monotone" dataKey="subjects" stroke="#93c5fd" strokeWidth={3} fill="url(#examArea)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Teacher roster</h3>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Recently updated profiles</p>
          <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
            {teacherFeed.length === 0 ? (
              <p className="text-sm text-zinc-400">No teachers on file</p>
            ) : (
              teacherFeed.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {act.name?.charAt(0) || "T"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{act.name}</p>
                      <p className="truncate text-xs text-zinc-500">{act.action}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    {act.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={item}
        className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Exams by class</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Volume of scheduled assessments</p>
          </div>
        </div>
        <div className="h-[240px] w-full text-zinc-500">
          {examsByClass.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">No exam records</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examsByClass} layout="vertical" margin={{ left: 16, right: 16 }}>
                <defs>
                  <linearGradient id="colorExams" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-zinc-200/80 dark:stroke-zinc-800" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={56} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="url(#colorExams)" radius={[0, 8, 8, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
