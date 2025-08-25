CREATE VIEW @client.ga4 AS
SELECT 
  SAFE.PARSE_DATE('%Y%m%d', date) AS date, 
  REGEXP_REPLACE(CONCAT('https://', hostName, REPLACE(landingpage, '(not set)', '')), '/$', '') AS url, 
  screenpageviews, 
  newUsers,
  totalUsers,
  sessions,
  sessionsourcemedium,
  IF(CONTAINS_SUBSTR(sessionsourcemedium, ' / '), SPLIT(sessionsourcemedium, ' / ')[OFFSET(0)], IF(sessionsourcemedium = '(not set)', NULL, sessionsourcemedium)) AS source,
  IF(CONTAINS_SUBSTR(sessionsourcemedium, ' / '), SPLIT(sessionsourcemedium, ' / ')[OFFSET(1)], null) AS medium
FROM @client.google_analytics;