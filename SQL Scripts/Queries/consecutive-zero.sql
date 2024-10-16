WITH DailyTraffic AS (
  -- Step 1: Calculate daily traffic for each URL
  SELECT
    url,
    DATE(date) AS day,
    SUM(screenpageviews) AS daily_views
  FROM
    `mmap.ga4` -- Replace with your actual dataset
  GROUP BY
    url, day
),
LabeledZeroDays AS (
  -- Step 2: Label consecutive days with zero traffic using LAG() to check previous day's traffic
  SELECT
    url,
    day,
    daily_views,
    CASE
      WHEN daily_views = 0 AND LAG(daily_views) OVER (PARTITION BY url ORDER BY day) = 0 THEN 1
      ELSE 0
    END AS is_consecutive_zero_day
  FROM
    DailyTraffic
),
ConsecutiveZeroGroups AS (
  -- Step 3: Identify sequences of consecutive zero days by using a running sum
  SELECT
    url,
    day,
    daily_views,
    COUNTIF(is_consecutive_zero_day = 1) OVER (PARTITION BY url ORDER BY day) AS consecutive_zero_days
  FROM
    LabeledZeroDays
)
SELECT
  url,
  MIN(day) AS start_date,
  MAX(day) AS end_date
FROM
  ConsecutiveZeroGroups
WHERE
  consecutive_zero_days > 2 -- Replace 2 with your desired threshold
GROUP BY
  url;
