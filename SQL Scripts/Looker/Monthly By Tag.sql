SELECT 
  PARSE_DATE('%Y-%m', FORMAT_TIMESTAMP('%Y-%m', date)) AS date,
  SUM(screenpageviews) AS total_views
FROM 
  @client.airtable_url_inventory aui INNER JOIN @client.ga4 ga
ON
  aui.url = ga.url,
UNNEST(SPLIT(aui.tags, ',')) AS tag
WHERE
 TRIM(tag) IN (@tag)
GROUP BY 
  date
ORDER BY 
  date;