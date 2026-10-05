"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PALETTE, VerticalBarChart } from "@/components/charts";
import Explainer from "../Explainer";
import { exportRowsToCsv } from "@/lib/csv";
import { NUM, departmentScores, staff, type Role } from "@/data/analytics";
import styles from "../dashboard.module.css";

type SortKey = "score" | "tasks" | "attendance" | "name";

export default function StaffTab({ role }: { role: Role }) {
  const [sort, setSort] = useState<SortKey>("score");

  const rows = useMemo(() => {
    const copy = [...staff];
    if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy.sort((a, b) => Number(b[sort]) - Number(a[sort]));
  }, [sort]);

  const headcount = staff.length;
  const avgScore = Math.round(staff.reduce((a, s) => a + s.score, 0) / headcount);
  const avgAttendance = Math.round(staff.reduce((a, s) => a + s.attendance, 0) / headcount);
  const totalTasks = staff.reduce((a, s) => a + s.tasks, 0);

  function exportStaff() {
    exportRowsToCsv(
      "datapulse-staff.csv",
      ["Name", "Role", "Department", "Tasks completed", "Attendance %", "Performance score"],
      staff.map((s) => [s.name, s.role, s.department, s.tasks, s.attendance, s.score])
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Team performance</h2>
            <p className={styles.panelSub}>
              {headcount} people · {NUM(totalTasks)} tasks completed this month
            </p>
          </div>
          <div className={styles.panelActions}>
            <button type="button" className={styles.actionBtn} onClick={exportStaff}>
              <Download size={13} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Average score</p>
                <p className={styles.kpiValue}>{avgScore}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Out of 100, across all departments</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Attendance</p>
                <p className={styles.kpiValue}>{avgAttendance}%</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Days present against days scheduled</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Tasks per person</p>
                <p className={styles.kpiValue}>{Math.round(totalTasks / headcount)}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>Completed and signed off this month</p>
          </article>
          <article className={styles.kpi}>
            <div className={styles.kpiTop}>
              <div>
                <p className={styles.kpiLabel}>Departments</p>
                <p className={styles.kpiValue}>{departmentScores.length}</p>
              </div>
            </div>
            <p className={styles.kpiChangeNote}>
              Strongest: {departmentScores.reduce((a, b) => (b.score > a.score ? b : a)).department}
            </p>
          </article>
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Performance by department</h2>
              <p className={styles.panelSub}>Mean score out of 100</p>
            </div>
          </div>
          <VerticalBarChart
            data={departmentScores}
            xKey="department"
            barKey="score"
            color={PALETTE.info}
            height={280}
          />
          <Explainer title="How is the performance score built?">
            <p>
              <code>Score = 0.5 × task completion + 0.3 × attendance + 0.2 × quality rating</code>.
              Task completion is signed-off tasks against assigned tasks; quality is the
              supervisor rating recorded at review. The weights are editable in Settings, and the
              score is a management aid, not a disciplinary instrument.
            </p>
          </Explainer>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Headcount</h2>
              <p className={styles.panelSub}>People per department</p>
            </div>
          </div>
          {departmentScores.map((d) => {
            const pct = (d.headcount / headcount) * 100;
            return (
              <div className={styles.targetRow} key={d.department}>
                <div className={styles.targetHead}>
                  <span className={styles.targetLabel}>{d.department}</span>
                  <span className={styles.targetValue}>
                    {d.headcount} {d.headcount === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className={styles.rankBar}>
                  <span
                    className={styles.rankFill}
                    style={{ width: `${pct}%`, background: "var(--dp-grad-dark)" }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Individual performance</h2>
            <p className={styles.panelSub}>This month</p>
          </div>
          <div className={styles.panelActions}>
            <div className={styles.segmented} role="group" aria-label="Sort staff">
              {(
                [
                  { key: "score", label: "Score" },
                  { key: "tasks", label: "Tasks" },
                  { key: "attendance", label: "Attendance" },
                  { key: "name", label: "A–Z" },
                ] as { key: SortKey; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={styles.segBtn}
                  data-active={sort === opt.key}
                  aria-pressed={sort === opt.key}
                  onClick={() => setSort(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Role</th>
                <th scope="col">Department</th>
                <th scope="col" className={styles.tdNumHead}>
                  Tasks
                </th>
                <th scope="col" className={styles.tdNumHead}>
                  Attendance
                </th>
                <th scope="col" className={styles.tdNumHead}>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.name}>
                  <td className={styles.tdStrong}>{s.name}</td>
                  <td>{s.role}</td>
                  <td>{s.department}</td>
                  <td className={styles.tdNum}>{s.tasks}</td>
                  <td className={styles.tdNum}>{s.attendance}%</td>
                  <td className={styles.tdNum}>
                    <span
                      className={`${styles.pill} ${
                        s.score >= 90
                          ? styles.pillSuccess
                          : s.score >= 80
                            ? styles.pillInfo
                            : styles.pillWarning
                      }`}
                    >
                      {s.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {role === "Viewer" ? (
          <p className={styles.noteMuted}>
            Viewer access — individual records are visible to Managers and the Owner only in full
            detail.
          </p>
        ) : null}
      </section>
    </>
  );
}
