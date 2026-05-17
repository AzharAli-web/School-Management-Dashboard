"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CheckCircle2, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "@/lib/axios";
import { TeacherDashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

function attendanceRateFromRecords(records) {
  const byDate = {};
  for (const r of records) {
    const d = new Date(r.date).toISOString().split("T")[0];
    if (!byDate[d]) byDate[d] = { p: 0, t: 0 };
    byDate[d].t += 1;
    if (r.status === "Present") byDate[d].p += 1;
  }
  const keys = Object.keys(byDate).sort();
  return keys.slice(-10).map((k) => ({
    day: k.slice(5),
    rate: byDate[k].t ? Math.round((byDate[k].p / byDate[k].t) * 1000) / 10 : 0,
  }));
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classSizes, setClassSizes] = useState([]);
  const [attTrend, setAttTrend] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d0, prof] = await Promise.all([
        api.get("/dashboard/teacher"),
        api.get("/auth/profile"),
      ]);
      setDash(d0.data);
      const cls = prof.data?.teacher?.assignedClasses || [];
      setClasses(cls);

      const sizes = await Promise.all(
        cls.map(async (c) => {
          try {
            const { data } = await api.get(`/students?class=${encodeURIComponent(c)}`);
            const n = Array.isArray(data?.students) ? data.students.length : 0;
            return { class: c, students: n };
          } catch {
            return { class: c, students: 0 };
          }
        })
      );
      setClassSizes(sizes);

      if (cls[0]) {
        try {
          const { data: att } = await api.get(
            `/attendance/class/${encodeURIComponent(cls[0])}`
          );
          const list = Array.isArray(att) ? att : [];
          setAttTrend(attendanceRateFromRecords(list));
        } catch {
          setAttTrend([]);
        }
      } else {
        setAttTrend([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalStudents = useMemo(() => classSizes.reduce((a, b) => a + b.students, 0), [classSizes]);

  const schedule = dash?.todaysSchedule || [];

  const avgAtt =
    attTrend.length > 0
      ? Math.round((attTrend.reduce((a, b) => a + b.rate, 0) / attTrend.length) * 10) / 10
      : null;

  const presencePct =
    dash?.attendanceQuickView?.totalStudents > 0
      ? Math.round(
          (dash.attendanceQuickView.presentToday / dash.attendanceQuickView.totalStudents) * 1000
        ) / 10
      : 0;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
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
    return <TeacherDashboardSkeleton />;
  }

  const kpis = [
    {
      label: "Assigned classes",
      value: classes.length || dash?.assignedClasses || 0,
      sub: classes.length ? classes.join(" · ") : "Set classes on your teacher profile",
      icon: BookOpen,
      ring: "ring-sky-500/15",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Students (your classes)",
      value: totalStudents || dash?.attendanceQuickView?.totalStudents || "—",
      sub: "Roster size from directory",
      icon: Users,
      ring: "ring-violet-500/15",
      iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Snapshot presence",
      value: presencePct ? `${presencePct}%` : "—",
      sub: "From dashboard quick view",
      icon: CheckCircle2,
      ring: "ring-emerald-500/15",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-10 pb-8">
      <motion.div variants={item} className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Class analytics
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Teaching workspace
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Class sizes from `/students`, attendance trend from your primary class, plus schedule from the dashboard
            API.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm ring-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 ${k.ring}`}
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${k.iconBg}`}>
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
        <motion.div variants={item} className="space-y-4 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <Clock className="h-5 w-5 text-primary" />
            Today&apos;s schedule
          </h3>
          <div className="space-y-3">
            {schedule.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-zinc-200 p-8 text-sm text-zinc-500 dark:border-zinc-800">
                No schedule entries from the API yet.
              </p>
            ) : (
              schedule.map((row, i) => (
                <motion.div
                  key={row.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="group flex cursor-default items-center justify-between rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white">{row.subject}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {row.grade || row.class} · {row.time}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-primary" />
            Attendance rate
          </h3>
          <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            {classes[0] ? `Recent days · class ${classes[0]}` : "Assign classes to see trends"}
          </p>
          {avgAtt != null && (
            <p className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">
              {avgAtt}%
              <span className="ml-2 text-sm font-normal text-zinc-500">avg (shown window)</span>
            </p>
          )}
          <div className="h-[280px] w-full text-zinc-500">
            {attTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                No attendance rows for this class yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/80 dark:stroke-zinc-800" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltip} formatter={(v) => [`${v}%`, "Present"]} />
                  <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={item}
        className="rounded-[1.75rem] border border-zinc-200/80 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-lg dark:from-zinc-950 dark:to-zinc-900"
      >
        <h3 className="mb-4 text-lg font-semibold">Class performance</h3>
        <p className="mb-6 text-sm text-zinc-400">Student headcount per assigned class</p>
        <div className="h-[240px] w-full text-zinc-400">
          {classSizes.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">No class data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classSizes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis dataKey="class" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ ...tooltip, background: "#18181b", borderColor: "#27272a", color: "#fafafa" }}
                />
                <Bar dataKey="students" fill="#93c5fd" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
