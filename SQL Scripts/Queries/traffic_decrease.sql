WITH Data AS (
  SELECT url,
    -- Calculate the sum of screenpageviews in the last 6 months (excluding the current month)
    SUM(
      CASE
        WHEN DATE(date) BETWEEN DATE_TRUNC(
          DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH),
          MONTH
        )
        AND DATE_SUB(
          DATE_TRUNC(CURRENT_DATE(), MONTH),
          INTERVAL 1 DAY
        ) THEN screenpageviews
        ELSE 0
      END
    ) / 180 AS older,
    -- Assuming 6 months is around 180 days for average
    -- Calculate the sum of screenpageviews in the most recent 7 days
    SUM(
      CASE
        WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        AND CURRENT_DATE() THEN screenpageviews
        ELSE 0
      END
    ) AS most_recent
  FROM `${client_id}.ga4`
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
  GROUP BY url
)
SELECT url,
  older,
  most_recent,
  CASE
    WHEN older > 0 THEN (older - most_recent) / older * 100
    ELSE NULL
  END AS percentage_decrease
FROM Data
ORDER BY percentage_decrease DESC;
