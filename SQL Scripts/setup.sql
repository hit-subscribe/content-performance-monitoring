CREATE VIEW @client.traffic_loss_30 AS
SELECT 
    url,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY) THEN screenpageviews ELSE 0 END) AS older,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS most_recent,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY) THEN screenpageviews ELSE 0 END) - 
    	SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS loss
FROM 
    @client.ga4
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY url
HAVING older > most_recent
ORDER BY loss DESC;

CREATE VIEW @client.traffic_gain_30 AS
SELECT 
    url,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY) THEN screenpageviews ELSE 0 END) AS older,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS most_recent,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) -
    	SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY) THEN screenpageviews ELSE 0 END) AS gain
FROM 
    @client.ga4
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY url
HAVING older < most_recent
ORDER BY gain DESC;

CREATE VIEW @client.airtable_url_inventory AS
SELECT 
  REGEXP_REPLACE(au.fields_urls, '/$', '') as url, 
  au.fields_lastmod as lastmod, 
  STRING_AGG(aufa.value, ', ') as tags,
  aufkt.value as primary_keyword,
  aufsv.value as search_volume,
  aufd.value as difficulty,
  aufpr.value as projected_rank,
  aufpt.value as projected_traffic
FROM 
  @client.airtable_urls au 
LEFT JOIN @client.airtable_urls_fields_attributes aufa ON au.__panoply_id = aufa.__airtable_urls_panoply_id
LEFT JOIN @client.airtable_urls_fields_difficulty aufd ON au.__panoply_id = aufd.__airtable_urls_panoply_id 
LEFT JOIN @client.airtable_urls_fields_keyword_text aufkt ON au.__panoply_id = aufkt.__airtable_urls_panoply_id
LEFT JOIN @client.airtable_urls_fields_projected_rank aufpr ON au.__panoply_id = aufpr.__airtable_urls_panoply_id
LEFT JOIN @client.airtable_urls_fields_projected_traffic aufpt ON au.__panoply_id = aufpt.__airtable_urls_panoply_id
LEFT JOIN @client.airtable_urls_fields_search_volume aufsv ON au.__panoply_id = aufsv.__airtable_urls_panoply_id
GROUP BY  url, lastmod, difficulty, primary_keyword, projected_rank, projected_traffic, search_volume;

CREATE VIEW @client.url_history AS
SELECT REGEXP_REPLACE(auhfu.value, '/$', '') as url, DATE(fields_date) as date, fields_action_text
FROM @client.airtable_url_history auh INNER JOIN @client.airtable_url_history_fields_url auhfu ON auh.__panoply_id = auhfu.__airtable_url_history_panoply_id;

CREATE VIEW @client.organic_by_month AS
SELECT EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as Month, SUM(screenpageviews) as views 
FROM @client.ga4
WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY year, month
ORDER BY year, month;

CREATE VIEW @client.daily_organic AS
SELECT DATE(date) AS date, SUM(screenpageviews) AS views,
FROM @client.ga4 
GROUP BY date
ORDER BY date;

CREATE VIEW @client.weekly_organic AS
SELECT 
  date(TIMESTAMP_TRUNC(CAST(date AS TIMESTAMP), WEEK(MONDAY))) AS week_start_date,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE 
  CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY 
  week_start_date
ORDER BY 
  week_start_date;

CREATE VIEW @client.rank_history AS
SELECT REGEXP_REPLACE(rhu.value, '/+$', '') as url, rhk.value as keyword, fields_measurement_date as date, fields_number as rank
FROM 
    @client.airtable_rank_history rh 
    INNER JOIN @client.airtable_rank_history_fields_keyword rhk ON rh.__panoply_id = rhk.__airtable_rank_history_panoply_id
    INNER JOIN @client.airtable_rank_history_fields_url rhu ON rh.__panoply_id = rhu.__airtable_rank_history_panoply_id;

CREATE VIEW @client.latest_rankings AS
SELECT url, keyword, date, rank
FROM (
    SELECT 
        REGEXP_REPLACE(rh.url, '/$', '') as url, 
        rh.keyword, 
        rh.date, 
        rh.rank,
        ROW_NUMBER() OVER (PARTITION BY rh.url ORDER BY rh.date DESC, rh.rank) AS row_num
    FROM @client.rank_history rh
) ranked_history
WHERE row_num = 1;

CREATE VIEW @client.url_performance AS
SELECT aui.url as url, lastmod, primary_keyword, date as rank_date, rank, search_volume, difficulty, projected_rank, projected_traffic
FROM @client.latest_rankings rh INNER JOIN @client.airtable_url_inventory aui ON rh.url = aui.url;

CREATE VIEW @client.underperformers AS
SELECT * FROM @client.url_performance
WHERE rank > projected_rank;

CREATE VIEW @client.hs_ga4 AS
SELECT
  date, ga.url, screenpageviews, sessionsourcemedium
FROM
  @client.airtable_url_inventory aui
INNER JOIN
  @client.ga4 ga
ON
  aui.url = ga.url,
UNNEST(SPLIT(aui.tags, ',')) AS tag
WHERE
 TRIM(tag) IN ('HS');

CREATE VIEW @client.performance_summary AS
SELECT
  url,
  primary_keyword,
  lastmod,
  rank,
  projected_rank,
  CASE
    WHEN CAST(lastmod AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) THEN 'Too New'
    WHEN rank < projected_rank THEN 'Over-performer'
    WHEN rank = projected_rank OR rank <= projected_rank + 3 THEN 'Expected Performer'
    ELSE 'Under-performer'
  END AS performance_category
FROM
  @client.url_performance;

CREATE VIEW @client.url_traffic_by_calendar_month AS SELECT 
  url,
  PARSE_DATE('%Y-%m', FORMAT_TIMESTAMP('%Y-%m', date)) AS date,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE
  url = REGEXP_REPLACE(url, '/$', '') AND CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY 
  date, url
ORDER BY 
  date;

CREATE VIEW @client.url_recent_30 AS SELECT 
  url,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE 
  CONTAINS_SUBSTR(sessionsourcemedium, 'organic') AND
  date BETWEEN TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY) AND CURRENT_TIMESTAMP()
GROUP BY 
  url
ORDER BY 
  total_views DESC;

CREATE VIEW @client.refresh_candidates AS 
SELECT 
  cm.url, 
  up.lastmod,
  up.projected_traffic,
  up.primary_keyword,
  up.rank,
  MAX(cm.total_views) as max_views, 
  r.total_views as recent_views, 
  MAX(cm.total_views) - r.total_views as decline,
   up.projected_traffic - r.total_views as underperformance,
  GREATEST(MAX(cm.total_views) - r.total_views, up.projected_traffic - r.total_views) as potential 

FROM @client.url_traffic_by_calendar_month cm 
  INNER JOIN @client.url_recent_30 r ON cm.url = r.url 
  INNER JOIN @client.url_performance up ON cm.url = up.url
GROUP BY cm.url, r.total_views, up.projected_traffic, underperformance, up.lastmod, up.primary_keyword, up.rank
HAVING  GREATEST(MAX(cm.total_views) - r.total_views, up.projected_traffic - r.total_views) > 0
ORDER BY potential DESC;

CREATE VIEW @client.tags AS
SELECT DISTINCT tag
FROM (
  SELECT TRIM(tag) AS tag
  FROM @client.airtable_url_inventory, 
  UNNEST(SPLIT(tags, ',')) AS tag
)
WHERE tag IS NOT NULL
ORDER BY tag;

CREATE VIEW @client.seo_issues AS
SELECT  
    asi.fields_issue as issue,
    asi.fields_issue_description as issue_description,
    asi.fields_priority as priority,
    asi.fields_qualified_to_fix as qualified_to_fix,
    asi.fields_fixed as fixed,
    asi.fields_link_to_more_info as link_to_more_info,
    ARRAY_TO_STRING(ARRAY_AGG(asiau.value), ', ') as affected_urls
FROM @client.airtable_seo_issues asi 
LEFT JOIN @client.airtable_seo_issues_fields_affected_urls asiau 
    ON asi.__panoply_id = asiau.__airtable_seo_issues_panoply_id
GROUP BY 
    asi.fields_issue, 
    asi.fields_issue_description, 
    asi.fields_priority, 
    asi.fields_qualified_to_fix, 
    asi.fields_fixed, 
    asi.fields_link_to_more_info;

CREATE VIEW @client.seo_issues_by_url AS
SELECT  
    asiau.value as URL,
    asi.fields_issue as issue,
    asi.fields_issue_description as issue_description,
    asi.fields_priority as priority,
    asi.fields_qualified_to_fix as qualified_to_fix,
    asi.fields_fixed as fixed,
    asi.fields_link_to_more_info as link_to_more_info
FROM @client.airtable_seo_issues asi LEFT JOIN @client.airtable_seo_issues_fields_affected_urls asiau ON asi.__panoply_id = asiau.__airtable_seo_issues_panoply_id;