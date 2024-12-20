CREATE VIEW @client.airtable_keywords AS SELECT * FROM @client.@keywords_table;
CREATE VIEW @client.airtable_link_placements AS SELECT * FROM @client.@link_placements_table;
CREATE VIEW @client.airtable_ranking_results AS SELECT * FROM @client.@ranking_results_table;
CREATE VIEW @client.airtable_seo_issues AS SELECT * FROM @client.@seo_issues_table;
CREATE VIEW @client.airtable_url_history AS SELECT * FROM @client.@url_history_table;
CREATE VIEW @client.airtable_urls AS SELECT * FROM @client.@urls_table;

CREATE VIEW @client.airtable_url_inventory AS
SELECT 
  REGEXP_REPLACE(urls, '/$', '') as url, 
  lastmod, 
  ARRAY_TO_STRING(ARRAY(SELECT JSON_VALUE(element) FROM UNNEST(JSON_EXTRACT_ARRAY(attributes)) AS element), ',') as tags,
  JSON_VALUE(keyword_text, '$[0]') as primary_keyword,
  CAST(JSON_VALUE(search_volume, '$[0]') AS INT64) as search_volume,
  CAST(JSON_VALUE(difficulty, '$[0]') AS INT64) as difficulty,
  CAST(JSON_VALUE(projected_rank, '$[0]') AS INT64) as projected_rank,
  CAST(CAST(JSON_VALUE(projected_traffic, '$[0]') AS FLOAT64) AS INT64) as projected_traffic
FROM 
  @client.airtable_urls;

CREATE VIEW @client.url_history AS
SELECT 
    REGEXP_REPLACE(JSON_VALUE(url, '$[0]'), '/$', '') as url, 
    date, 
    action
FROM @client.airtable_url_history;

CREATE VIEW @client.rank_history AS
SELECT 
    REGEXP_REPLACE(JSON_VALUE(url, '$[0]'), '/+$', '') as url, 
    JSON_VALUE(keyword, '$[0]') as keyword, 
    measurement_date as date, 
    number as rank
FROM 
    @client.airtable_ranking_results;

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

CREATE VIEW @client.underperformers AS
SELECT * FROM @client.url_performance
WHERE rank > projected_rank;

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


