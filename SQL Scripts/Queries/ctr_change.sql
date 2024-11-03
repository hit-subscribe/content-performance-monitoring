WITH six_months_data AS (
  SELECT
    page,
    AVG(ctr) * 100 AS avg_ctr_six_months
  FROM
    `mmap.gsc`  -- Your table reference here
  WHERE
    CAST(date AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    AND CAST(date AS DATE) < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)  -- Exclude the last 30 days
  GROUP BY
    page
),

last_30_days_data AS (
  SELECT
    page,
    AVG(ctr) * 100 AS avg_ctr_last_30_days
  FROM
    `mmap.gsc`  -- Your table reference here
  WHERE
    CAST(date AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY
    page
)

SELECT
  s.page,
  s.avg_ctr_six_months,
  l.avg_ctr_last_30_days,
  ((s.avg_ctr_six_months - l.avg_ctr_last_30_days) / s.avg_ctr_six_months) * 100 AS ctr_decline_percentage
FROM
  six_months_data s
LEFT JOIN
  last_30_days_data l
ON
  s.page = l.page
WHERE
  s.avg_ctr_six_months > 0  -- Only include pages with CTR in the past six months
