SELECT
  url,
  primary_keyword,
  lastmod,
  rank,
  projected_rank,
  CASE
    WHEN CAST(lastmod AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL @lead_time MONTH) THEN 'Too New'
    WHEN rank < projected_rank THEN 'Over-performer'
    WHEN rank = projected_rank OR rank <= projected_rank + 3 THEN 'Expected Performer'
    ELSE 'Under-performer'
  END AS performance_category
FROM
  @client.url_performance;