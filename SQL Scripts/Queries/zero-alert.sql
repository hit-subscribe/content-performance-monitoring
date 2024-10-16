WITH DailyData AS (
  SELECT
    url,
    DATE(date) AS day,
    SUM(screenpageviews) AS daily_screenpageviews
  FROM
    mmap.ga4
  WHERE
    CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
  GROUP BY
    url,
    day
),
ConsistentTraffic AS (
  SELECT
    url,
    COUNT(*) AS days_with_traffic
  FROM
    DailyData
  WHERE
    daily_screenpageviews > 0
  GROUP BY
    url
  HAVING
    days_with_traffic >= @days_with_traffic -- Adjust as needed for "most" days
),
ZeroTrafficPeriods AS (
  SELECT
    url,
    MIN(day) AS first_zero_day,
    MAX(day) AS last_zero_day,
    COUNT(*) AS zero_traffic_days
  FROM
    DailyData
  WHERE
    daily_screenpageviews = 0
  GROUP BY
    url
  HAVING
    zero_traffic_days >= @min_zero_days -- Minimum consecutive zero days
)
SELECT
  ConsistentTraffic.url,
  ConsistentTraffic.days_with_traffic,
  ZeroTrafficPeriods.first_zero_day,
  ZeroTrafficPeriods.last_zero_day,
  ZeroTrafficPeriods.zero_traffic_days
FROM
  ConsistentTraffic
JOIN
  ZeroTrafficPeriods ON ConsistentTraffic.url = ZeroTrafficPeriods.url
WHERE
  DATE_DIFF(CURRENT_DATE(), ZeroTrafficPeriods.last_zero_day, DAY) >= @min_zero_days;
