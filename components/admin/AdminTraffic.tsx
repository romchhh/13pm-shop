"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TRAFFIC_SOURCE_LABELS,
  type TrafficSourceType,
} from "@/lib/trafficSource";

type TrafficData = {
  onlineCount: number;
  totalSessions: number;
  linkTrafficCount: number;
  bySource: { type: TrafficSourceType; count: number }[];
  topReferrers: { host: string; count: number }[];
  periodDays: number;
};

const PERIOD_OPTIONS = [
  { label: "Сьогодні", days: 1 },
  { label: "7 днів", days: 7 },
  { label: "30 днів", days: 30 },
];

export default function AdminTraffic() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (periodDays: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?days=${periodDays}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load traffic");
      const json = (await res.json()) as TrafficData;
      setData(json);
      setError(null);
    } catch {
      setError("Не вдалося завантажити статистику трафіку");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void load(days, true);
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [days, load]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </section>
    );
  }

  if (!data) return null;

  const organicCount =
    data.bySource.find((row) => row.type === "organic")?.count ?? 0;
  const directCount =
    data.bySource.find((row) => row.type === "direct")?.count ?? 0;

  const metrics = [
    {
      label: "Зараз на сайті",
      value: data.onlineCount.toLocaleString("uk-UA"),
      hint: "Активні за останні 5 хвилин",
      accent: true,
    },
    {
      label: "Візитів за період",
      value: data.totalSessions.toLocaleString("uk-UA"),
      hint: `Унікальні сесії за ${data.periodDays} дн.`,
    },
    {
      label: "З посилань (не Google)",
      value: data.linkTrafficCount.toLocaleString("uk-UA"),
      hint: "Соцмережі, сайти, UTM-реклама",
    },
    {
      label: "З пошуку Google",
      value: organicCount.toLocaleString("uk-UA"),
      hint: "Органічний пошуковий трафік",
    },
    {
      label: "Прямі заходи",
      value: directCount.toLocaleString("uk-UA"),
      hint: "Без referrer (закладки, ввели URL)",
    },
  ];

  const maxSourceCount = Math.max(...data.bySource.map((row) => row.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Трафік сайту</h1>
          <p className="mt-1 text-sm text-gray-500">
            Відвідувачі в реальному часі та джерела переходів
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setDays(option.days)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                days === option.days
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border p-5 ${
              metric.accent
                ? "border-emerald-200 bg-emerald-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p
              className={`mt-2 text-3xl font-semibold ${
                metric.accent ? "text-emerald-700" : "text-gray-900"
              }`}
            >
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Джерела трафіку
          </h2>
          {data.bySource.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Поки немає даних за обраний період.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.bySource.map((row) => {
                const width = Math.round((row.count / maxSourceCount) * 100);
                return (
                  <li key={row.type}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {TRAFFIC_SOURCE_LABELS[row.type]}
                      </span>
                      <span className="font-medium text-gray-900">
                        {row.count.toLocaleString("uk-UA")}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-900"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Топ посилань (не Google)
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Звідки приходили люди по посиланнях, соцмережах або UTM
          </p>
          {data.topReferrers.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Поки немає переходів з посилань за цей період.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Джерело</th>
                    <th className="pb-2 font-medium">Візитів</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers.map((row) => (
                    <tr key={row.host} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {row.host}
                      </td>
                      <td className="py-2 text-gray-700">
                        {row.count.toLocaleString("uk-UA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-medium">Детальніша аналітика</p>
        <p className="mt-1">
          У Google Analytics (G-M432701GP3) та GTM є повні звіти по сторінках,
          конверсіях та рекламі. Цей розділ показує базову статистику прямо в
          адмінці без входу в GA.
        </p>
      </section>
    </div>
  );
}
