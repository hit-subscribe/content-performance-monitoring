WITH Data AS (
  SELECT
    url,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL (7*2) DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL (7+1) DAY) THEN screenpageviews ELSE 0 END) AS older,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS most_recent
  FROM
    mmap.ga4
  WHERE
    CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
  GROUP BY
    url
)
SELECT
  url,
  older,
  most_recent,
  CASE
    WHEN older > 0 THEN (older - most_recent) / older * 100
    ELSE NULL
  END AS percentage_decrease
FROM
  Data
WHERE
  older > @floor
  AND (older - most_recent) / older * 100 >= @percentage_decrease;

