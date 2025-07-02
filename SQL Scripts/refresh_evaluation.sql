WITH url_deltas AS (
  SELECT
    url,
    SUM(CASE WHEN date BETWEEN DATE('2025-01-06') AND DATE('2025-03-24') THEN screenpageviews ELSE 0 END) AS recent_views,
    SUM(CASE WHEN date BETWEEN DATE('2024-10-20') AND DATE('2025-01-05') THEN screenpageviews ELSE 0 END) AS previous_views,
    SUM(CASE WHEN date BETWEEN DATE('2025-01-06') AND DATE('2025-03-24') THEN screenpageviews ELSE 0 END) -
    SUM(CASE WHEN date BETWEEN DATE('2024-10-20') AND DATE('2025-01-05') THEN screenpageviews ELSE 0 END) AS view_change
  FROM netbox.ga4
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
  GROUP BY url
),

ranked AS (
  SELECT
    url,
    view_change,
    RANK() OVER (ORDER BY view_change DESC) AS rank
  FROM url_deltas
  WHERE view_change > 0
),

totals AS (
  SELECT
    SUM(view_change) AS total_gain
  FROM ranked
),

top_20 AS (
  SELECT
    SUM(view_change) AS top_20_gain
  FROM ranked
  WHERE rank <= 20
)

SELECT
  top_20.top_20_gain,
  totals.total_gain,
  SAFE_DIVIDE(top_20.top_20_gain, totals.total_gain) * 100 AS percent_of_total_gain
FROM top_20, totals

SELECT
  url,
  SUM(CASE WHEN date BETWEEN DATE('2025-01-06') AND DATE('2025-03-24') THEN screenpageviews ELSE 0 END) AS recent_views,
  SUM(CASE WHEN date BETWEEN DATE('2024-10-20') AND DATE('2025-01-05') THEN screenpageviews ELSE 0 END) AS previous_views,
  SUM(CASE WHEN date BETWEEN DATE('2025-01-06') AND DATE('2025-03-24') THEN screenpageviews ELSE 0 END) -
  SUM(CASE WHEN date BETWEEN DATE('2024-10-20') AND DATE('2025-01-05') THEN screenpageviews ELSE 0 END) AS view_change
FROM netbox.ga4
WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY url
HAVING view_change > 0
ORDER BY view_change DESC
LIMIT 10


/* Refresh Aggregate */
SELECT
  SUM(IF(g.date < aui.lastmod AND g.date >= TIMESTAMP_SUB(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)) AS total_pageviews_30d_before,
  SUM(IF(g.date >= aui.lastmod AND g.date <= TIMESTAMP_ADD(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)) AS total_pageviews_30d_after,
  SUM(IF(g.date >= aui.lastmod AND g.date <= TIMESTAMP_ADD(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)) -
  SUM(IF(g.date < aui.lastmod AND g.date >= TIMESTAMP_SUB(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)) AS total_increase,
  SAFE_DIVIDE(
    SUM(IF(g.date >= aui.lastmod AND g.date <= TIMESTAMP_ADD(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)) -
    SUM(IF(g.date < aui.lastmod AND g.date >= TIMESTAMP_SUB(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0)),
    SUM(IF(g.date < aui.lastmod AND g.date >= TIMESTAMP_SUB(aui.lastmod, INTERVAL 30 DAY), g.screenpageviews, 0))
  ) * 100 AS total_percent_increase
FROM
  splunk.airtable_url_inventory aui
JOIN
  splunk.ga4 g
ON
  aui.url = g.url
WHERE
  (CONTAINS_SUBSTR(aui.tags, 'Q3 Refresh') OR CONTAINS_SUBSTR(aui.tags, 'Q4 Refresh')) AND
  g.date BETWEEN TIMESTAMP_SUB(aui.lastmod, INTERVAL 30 DAY) AND TIMESTAMP_ADD(aui.lastmod, INTERVAL 30 DAY)

/* Control Group */
SELECT
  SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY), g.screenpageviews, 0)) AS pageviews_30d_before,
  SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE(), g.screenpageviews, 0)) AS pageviews_30d_recent,
  SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE(), g.screenpageviews, 0)) -
  SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY), g.screenpageviews, 0)) AS increase,
  SAFE_DIVIDE(
    SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE(), g.screenpageviews, 0)) -
    SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY), g.screenpageviews, 0)),
    SUM(IF(g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY), g.screenpageviews, 0))
  ) * 100 AS percent_increase
FROM
  splunk.airtable_url_inventory aui
JOIN
  splunk.ga4 g
ON
  aui.url = g.url
WHERE
  EXTRACT(YEAR FROM aui.lastmod) = 2023 AND
  g.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND CURRENT_DATE()