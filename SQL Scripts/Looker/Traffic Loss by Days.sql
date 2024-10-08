SELECT 
    url,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL (@days*2) DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL (@days+1) DAY) THEN screenpageviews ELSE 0 END) AS older,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS most_recent,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL (@days*2) DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL (@days+1) DAY) THEN screenpageviews ELSE 0 END) - 
    	SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS loss
FROM 
    @client.ga4
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY url
HAVING older > most_recent
ORDER BY loss DESC