#!/usr/bin/env python3
"""Regenerate chart_weekly_attendance.png from production attendance data.

Run this before rebuilding the proposal when you want fresh numbers:

    python3 refresh_attendance_chart.py
    python3 build_proposal_pdf.py

Requires: psycopg2, matplotlib, and swimbuddz-backend/.env.prod with DATABASE_URL.
NOTE: the chart updates automatically; the stat cards and bullet copy in
PROPOSAL_SOURCE.md ("By the numbers" section) are text — update those by hand
from the printed summary below.
"""
import re
import urllib.parse
from datetime import date
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import psycopg2
from matplotlib.ticker import MaxNLocator

HERE = Path(__file__).resolve().parent
ENV_PROD = HERE.parent.parent.parent / "swimbuddz-backend" / ".env.prod"
OUT = HERE / "chart_weekly_attendance.png"

CYAN, BLUE, TEAL_DARK, SLATE_700, SLATE_500 = (
    "#06b6d4", "#2563eb", "#0e7490", "#334155", "#64748b",
)


def connect():
    env = {}
    for line in ENV_PROD.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k] = v.strip().strip('"').strip("'")
    # psql can't parse the pooler URL — split it manually for psycopg2.
    m = re.match(
        r"postgresql(?:\+\w+)?://([^:]+):(.+)@([^@/]+):(\d+)/(\w+)", env["DATABASE_URL"]
    )
    user, password, host, port, dbname = m.groups()
    return psycopg2.connect(
        host=host, port=int(port), user=user,
        password=urllib.parse.unquote(password), dbname=dbname, connect_timeout=15,
    )


def main():
    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        SELECT date_trunc('week', s.starts_at)::date AS week,
               count(*) AS attendances,
               count(DISTINCT ar.member_id) AS unique_swimmers
        FROM attendance_records ar
        JOIN sessions s ON s.id = ar.session_id
        WHERE ar.status IN ('present', 'late') AND ar.role = 'swimmer'
        GROUP BY 1 ORDER BY 1
    """)
    weeks = cur.fetchall()

    cur.execute("""
        SELECT count(*),
               count(DISTINCT ar.member_id),
               count(DISTINCT ar.session_id),
               round(count(*)::numeric / NULLIF(count(DISTINCT ar.member_id), 0), 1)
        FROM attendance_records ar
        JOIN sessions s ON s.id = ar.session_id
        WHERE ar.status IN ('present', 'late') AND ar.role = 'swimmer'
    """)
    total_checkins, uniq_swimmers, sessions, visits_per = cur.fetchone()

    cur.execute("""
        SELECT months_active, count(*) FROM (
            SELECT ar.member_id, count(DISTINCT date_trunc('month', s.starts_at)) AS months_active
            FROM attendance_records ar
            JOIN sessions s ON s.id = ar.session_id
            WHERE ar.status IN ('present', 'late') AND ar.role = 'swimmer'
              AND ar.member_id IS NOT NULL
            GROUP BY 1
        ) t GROUP BY 1
    """)
    ret = dict(cur.fetchall())
    conn.close()

    retained = sum(v for k, v in ret.items() if k >= 2)
    pct_retained = round(100 * retained / max(sum(ret.values()), 1))

    plt.rcParams.update({
        "font.family": "sans-serif",
        "font.sans-serif": ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans"],
        "axes.edgecolor": "#cbd5e1", "axes.linewidth": 0.8,
        "axes.labelcolor": SLATE_700, "xtick.color": SLATE_500,
        "ytick.color": SLATE_500, "text.color": SLATE_700,
    })
    labels = [w[0].strftime("%-d %b") for w in weeks]
    att = [w[1] for w in weeks]
    uniq = [w[2] for w in weeks]

    fig, ax = plt.subplots(figsize=(7.4, 2.9), dpi=200)
    ax.bar(range(len(weeks)), att, color=CYAN, width=0.62, label="Swim check-ins", zorder=3)
    ax.plot(range(len(weeks)), uniq, color=BLUE, marker="o", markersize=4,
            linewidth=1.8, label="Unique swimmers", zorder=4)
    ax.set_xticks(range(len(weeks)))
    ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=7.5)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.tick_params(axis="y", labelsize=8)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", color="#e2e8f0", linewidth=0.7, zorder=0)
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    for x, v in enumerate(att):
        ax.text(x, v + 0.25, str(v), ha="center", fontsize=7, color=TEAL_DARK)
    fig.tight_layout(pad=0.4)
    fig.savefig(OUT, transparent=True)
    print(f"Wrote {OUT}")
    print(f"\nUpdate the statcards + copy in PROPOSAL_SOURCE.md by hand if these changed:")
    print(f"  verified check-ins: {total_checkins}")
    print(f"  sessions delivered: {sessions}")
    print(f"  unique swimmers: {uniq_swimmers}")
    print(f"  visits per swimmer (avg): {visits_per}")
    print(f"  swimmers active 2+ months: {pct_retained}%  (as of {date.today():%d %b %Y})")


if __name__ == "__main__":
    main()
