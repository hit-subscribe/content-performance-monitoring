WITH past_six_months AS (
  -- Step 1: Get the past six months of data excluding the current month
  SELECT url,
    screenpageviews,
    EXTRACT(
      YEAR
      FROM DATE(date)
    ) AS year,
    -- Convert TIMESTAMP to DATE
    EXTRACT(
      MONTH
      FROM DATE(date)
    ) AS month -- Convert TIMESTAMP to DATE
  FROM `mmap.ga4`
  WHERE DATE(date) >= DATE_TRUNC(
      DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH),
      MONTH
    )
    AND DATE(date) < DATE_TRUNC(CURRENT_DATE(), MONTH) -- Excludes the current month
),
avg_screenpageviews AS (
  -- Step 2: Calculate the average screenpageviews for each URL in the past 6 months
  SELECT url,
    AVG(screenpageviews) AS avg_screenpageviews
  FROM past_six_months
  GROUP BY url
),
current_zero_views AS (
  -- Step 3: Find URLs with 0 screenpageviews in the most recent month
  SELECT url,
    MIN(DATE(date)) AS zero_traffic_date -- Get the earliest date of zero traffic in the current month
  FROM `mmap.ga4`
  WHERE DATE(date) >= DATE_TRUNC(CURRENT_DATE(), MONTH) -- Data from the current month
    AND screenpageviews = 0
  GROUP BY url
) -- Step 4: Combine the results to find URLs with avg > 0 but 0 screenpageviews now
SELECT avg_screenpageviews.url,
  avg_screenpageviews.avg_screenpageviews,
  current_zero_views.zero_traffic_date
FROM avg_screenpageviews
  JOIN current_zero_views ON avg_screenpageviews.url = current_zero_views.url
WHERE avg_screenpageviews.avg_screenpageviews > 0
