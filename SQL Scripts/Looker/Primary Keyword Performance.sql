SELECT url, lastmod, primary_keyword, rank_date, rank, projected_rank, rank - projected_rank as gap 
from @client.url_performance
WHERE 
  DATE(lastmod) < DATE_SUB(CURRENT_DATE(), INTERVAL @months MONTH);