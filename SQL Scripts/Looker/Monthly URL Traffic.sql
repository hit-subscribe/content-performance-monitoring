SELECT 
  PARSE_DATE('%Y-%m', FORMAT_TIMESTAMP('%Y-%m', date)) AS date,
  SUM(screenpageviews) AS total_views
FROM 
  @client.ga4
WHERE
  url = REGEXP_REPLACE(@url, '/$', '') AND CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY 
  date
ORDER BY 
  date;