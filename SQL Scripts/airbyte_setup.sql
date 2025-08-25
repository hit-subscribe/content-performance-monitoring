CREATE TABLE @client.raw_ranking_results (
  url STRING,
  keyword STRING,
  rank NUMERIC,
  measurement_time DATE
);

CREATE VIEW @client.airtable_ctas AS SELECT * FROM @client.@ctas_table;
CREATE VIEW @client.airtable_keywords AS SELECT * FROM @client.@keywords_table;
CREATE VIEW @client.airtable_link_placements AS SELECT * FROM @client.@link_placements_table;
CREATE VIEW @client.airtable_seo_issues AS SELECT * FROM @client.@seo_issues_table;
CREATE VIEW @client.airtable_url_history AS SELECT * FROM @client.@url_history_table;
CREATE VIEW @client.airtable_urls AS SELECT * FROM @client.@urls_table;

CREATE VIEW @client.airtable_url_inventory AS
SELECT 
  REGEXP_REPLACE(urls, '/$', '') as url, 
  lastmod, 
  backlinks,
  ARRAY_TO_STRING(ARRAY(SELECT JSON_VALUE(element) FROM UNNEST(JSON_EXTRACT_ARRAY(attributes)) AS element), ',') as tags,
  JSON_VALUE(keyword_text, '$[0]') as primary_keyword,
  CAST(JSON_VALUE(search_volume, '$[0]') AS INT64) as search_volume,
  CAST(JSON_VALUE(difficulty, '$[0]') AS INT64) as difficulty,
  CAST(JSON_VALUE(projected_rank, '$[0]') AS INT64) as projected_rank,
  CAST(CAST(JSON_VALUE(projected_traffic, '$[0]') AS FLOAT64) AS  INT64) as projected_traffic,
  ARRAY_TO_STRING(ARRAY(
    SELECT JSON_VALUE(element)
    FROM UNNEST(JSON_EXTRACT_ARRAY(current_cta_names)) AS element
    ),
  ','
  ) as current_ctas,
  ARRAY_TO_STRING(ARRAY(
    SELECT JSON_VALUE(element)
    FROM UNNEST(JSON_EXTRACT_ARRAY(possible_cta_names)) AS element
    ),
  ','
  ) as possible_ctas
FROM
  @client.airtable_urls;

CREATE VIEW @client.url_history AS
SELECT 
    REGEXP_REPLACE(JSON_VALUE(url, '$[0]'), '/$', '') as url, 
    date, 
    action
FROM @client.airtable_url_history;

CREATE VIEW @client.latest_rankings AS
SELECT url, keyword, date, rank
FROM (
    SELECT 
        REGEXP_REPLACE(rrr.url, '/$', '') as url, 
        rrr.keyword, 
        rrr.measurement_time as date, 
        rrr.rank,
        ROW_NUMBER() OVER (PARTITION BY rrr.url ORDER BY rrr.measurement_time DESC, rrr.rank) AS row_num
    FROM @client.raw_ranking_results rrr
) 
WHERE row_num = 1;

CREATE VIEW @client.url_performance AS
SELECT 
    aui.url as url, 
    lastmod, 
    primary_keyword, 
    date as rank_date, 
    rank, 
    search_volume, 
    difficulty, 
    projected_rank, 
    projected_traffic
FROM @client.latest_rankings rh INNER JOIN @client.airtable_url_inventory aui ON rh.url = aui.url;

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

CREATE VIEW @client.url_traffic_by_calendar_month AS 
SELECT 
  url,
  EXTRACT(YEAR FROM date) AS year,
  EXTRACT(MONTH FROM date) AS month,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE
  url = REGEXP_REPLACE(url, '/$', '') 
  AND CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY 
  year, month, url
ORDER BY 
  year, month;

CREATE VIEW @client.url_recent_30 AS 
SELECT 
  url,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE 
  CONTAINS_SUBSTR(sessionsourcemedium, 'organic') AND
  date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()
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
    issue,
    issue_description,
    priority,
    qualified_to_fix,
    fixed,
    link_to_more_info,
    ARRAY_TO_STRING(ARRAY(SELECT JSON_VALUE(element) FROM UNNEST(JSON_EXTRACT_ARRAY(affected_urls)) AS element), ',') as affected_urls
FROM @client.airtable_seo_issues;

CREATE VIEW @client.seo_issues_by_url AS
SELECT  
    JSON_VALUE(element) AS affected_url,
    issue,
    issue_description,
    priority,
    qualified_to_fix,
    fixed,
    link_to_more_info
FROM 
    @client.airtable_seo_issues,
    UNNEST(JSON_EXTRACT_ARRAY(affected_urls)) AS element;

CREATE VIEW @client.backlinks AS
SELECT 
    link_source_url,
    anchor_text,
    JSON_VALUE(target_url, '$[0]') as target_url,
    domain_authority,
    domain_rating,
    placed,
    link_type    
FROM @client.airtable_link_placements;

CREATE VIEW @client.keyword_opportunities AS
SELECT 
  keyword,
  volume,
  difficulty,
  projected_rank,
  projected_traffic,
  type_of_content_to_rank,
  ARRAY_TO_STRING(ARRAY(SELECT JSON_VALUE(element) FROM UNNEST(JSON_EXTRACT_ARRAY(search_intent)) AS element), ',') as search_intent,
  full_searcher_question,
  segmentation,
  ARRAY_TO_STRING(ARRAY(SELECT JSON_VALUE(element) FROM UNNEST(JSON_EXTRACT_ARRAY(attributes)) AS element), ',') as tags,
  parent_keyword,
  synonym_keyword,
  status,  
  urls
FROM 
  @client.airtable_keywords;

CREATE VIEW @client.keyword_tags AS 
SELECT DISTINCT tag
FROM (
  SELECT TRIM(tag) AS tag
  FROM @client.keyword_opportunities, 
  UNNEST(SPLIT(tags, ',')) AS tag
)
WHERE tag IS NOT NULL
ORDER BY tag;

CREATE VIEW @client.important_to_own AS
WITH latest_ranking_result AS (
    SELECT
      k.keyword,
      r.rank AS number,
      r.measurement_time AS measurement_date,
      ROW_NUMBER() OVER (PARTITION BY k.keyword ORDER BY r.measurement_time DESC) AS rn
    FROM @client.airtable_keywords k
    LEFT JOIN @client.raw_ranking_results r
      ON LOWER(k.keyword) = LOWER(r.keyword)
  ),
  -- Most recent URL history per keyword
  latest_url_history AS (
    SELECT
      k.keyword,
      auh.action,
      auh.date,
      ROW_NUMBER() OVER (PARTITION BY k.keyword ORDER BY auh.date DESC) AS rn
    FROM @client.airtable_keywords k
    LEFT JOIN UNNEST(JSON_EXTRACT_ARRAY(k.urls)) AS url_key
    LEFT JOIN @client.airtable_urls u ON u._airtable_id = JSON_VALUE(url_key)
    LEFT JOIN UNNEST(JSON_EXTRACT_ARRAY(u.url_history)) AS uh_key
    LEFT JOIN @client.airtable_url_history auh ON auh._airtable_id = JSON_VALUE(uh_key)
  ),
  -- First available URL per keyword
  first_url_per_keyword AS (
    SELECT
      k.keyword,
      u.urls AS url,
      ROW_NUMBER() OVER (PARTITION BY k.keyword ORDER BY u.urls) AS rn
    FROM @client.airtable_keywords k
    LEFT JOIN UNNEST(JSON_EXTRACT_ARRAY(k.urls)) AS url_key
    LEFT JOIN @client.airtable_urls u ON u._airtable_id = JSON_VALUE(url_key)
  )
  SELECT
    k.keyword,
    COALESCE(k.status, 'Not Targeted') AS status,
    COALESCE(k.type_of_content_to_rank, '') AS content_type,
    k.projected_rank,
    fu.url AS url,
    r.number AS rank,
    r.measurement_date,
    h.action,
    h.date
  FROM @client.airtable_keywords k
  LEFT JOIN latest_ranking_result r ON r.keyword = k.keyword AND r.rn = 1
  LEFT JOIN latest_url_history h ON h.keyword = k.keyword AND h.rn = 1
  LEFT JOIN first_url_per_keyword fu ON fu.keyword = k.keyword AND fu.rn = 1
  WHERE 'Important to Own' IN UNNEST(ARRAY(
    SELECT JSON_VALUE(x)
    FROM UNNEST(JSON_EXTRACT_ARRAY(k.attributes)) AS x
  ))
  ORDER BY k.keyword