WITH ZeroTraffic AS (
  SELECT
    landingpage,
    CAST(date AS DATE) AS date,
    screenpageviews,
    LAG(screenpageviews, 1) OVER (PARTITION BY landingpage ORDER BY CAST(date AS DATE)) AS prev_day_views,
    LAG(screenpageviews, 2) OVER (PARTITION BY landingpage ORDER BY CAST(date AS DATE)) AS prev_two_day_views
  FROM
    `splunk.google_analytics`
  WHERE
    CAST(date AS DATE) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)

),
ConsecutiveZeros AS (
  SELECT
    landingpage,
    date,
    screenpageviews,
    ROW_NUMBER() OVER (PARTITION BY landingpage ORDER BY date)
      - ROW_NUMBER() OVER (PARTITION BY landingpage, screenpageviews ORDER BY date) AS grp
  FROM
    ZeroTraffic
  WHERE
    screenpageviews = 0
)
SELECT
  landingpage,
  COUNT(*) AS zero_day_count
FROM
  ConsecutiveZeros
GROUP BY
  landingpage, grp
HAVING
  COUNT(*) > 0
ORDER BY
  zero_day_count DESC;
