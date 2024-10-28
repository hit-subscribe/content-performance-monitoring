WITH date_ranges AS (
  SELECT query,
    page,
    CASE
      WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      AND DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) THEN 'past_six_months'
      WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      AND CURRENT_DATE() THEN 'last_30_days'
    END AS period,
    position,
    impressions,
    clicks
  FROM `mmap.gsc`
  WHERE DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
    AND CURRENT_DATE()
    AND position IS NOT NULL -- Exclude rows where position is NULL
),
averages AS (
  SELECT query,
    page,
    period,
    AVG(position) AS avg_position,
    AVG(impressions) AS avg_impressions,
    AVG(clicks) AS avg_clicks
  FROM date_ranges
  WHERE period IS NOT NULL
  GROUP BY query,
    page,
    period
  HAVING avg_clicks >= 1 -- Filter out queries with low average impressions
)
SELECT a.query,
  a.page,
  a.avg_position AS avg_position_past_six_months,
  COALESCE(b.avg_position, 100) AS avg_position_last_30_days,
  SAFE_DIVIDE(
    COALESCE(b.avg_position, 100) - a.avg_position,
    a.avg_position
  ) * -100 AS position_percentage_change
FROM (
    SELECT *
    FROM averages
    WHERE period = 'past_six_months'
  ) a
  LEFT JOIN (
    SELECT *
    FROM averages
    WHERE period = 'last_30_days'
  ) b ON a.query = b.query
  AND a.page = b.page
ORDER BY position_percentage_change ASC
