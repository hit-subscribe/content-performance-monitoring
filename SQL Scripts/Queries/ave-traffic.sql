WITH DailyTraffic AS (
  SELECT
    url,
    DATE(date) AS day,
    SUM(screenpageviews) AS daily_traffic
  FROM mmap.ga4
  WHERE
    DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL @num_days DAY) AND CURRENT_DATE()

  GROUP BY url, day
)
SELECT
  url,
  AVG(daily_traffic) AS avg_traffic_per_day
FROM DailyTraffic
GROUP BY url
HAVING avg_traffic_per_day > 0;
