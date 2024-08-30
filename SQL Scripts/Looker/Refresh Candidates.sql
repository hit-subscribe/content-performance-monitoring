SELECT * FROM @client.refresh_candidates
WHERE 
  DATE(lastmod) < DATE_SUB(CURRENT_DATE(), INTERVAL @months MONTH);