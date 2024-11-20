CREATE VIEW @client.ga4 AS
SELECT 
  PARSE_DATE('%Y%m%d', date) as date, 
  REGEXP_REPLACE(CONCAT('',REPLACE(landingpage, '(not set)', '')), '/$', '') as url, 
  screenpageviews, 
  sessionsourcemedium,
  IF(CONTAINS_SUBSTR(sessionsourcemedium, ' / '), SPLIT(sessionsourcemedium, ' / ')[OFFSET(0)], IF(sessionsourcemedium = '(not set)', NULL, sessionsourcemedium)) AS source,
  IF(CONTAINS_SUBSTR(sessionsourcemedium, ' / '), SPLIT(sessionsourcemedium, ' / ')[OFFSET(1)], null) AS medium
FROM @client.google_analytics;