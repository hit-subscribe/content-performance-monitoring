SELECT DATE(date) AS date, SUM(screenpageviews) AS views,
FROM @client.ga4
WHERE url = REGEXP_REPLACE(@url, '/$', '') AND CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY date
ORDER BY date