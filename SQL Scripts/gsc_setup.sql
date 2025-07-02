CREATE VIEW @client.ga4 AS 
SELECT 
    date, 
    REGEXP_REPLACE(page, '/$', '') as url,
    clicks as screenpageviews,
    clicks as newUsers,
    clicks as totalUsers,
    clicks as sessions, 
    'google / organic' as sessionsourcemedium,
    'google' as source,
    'organic' as medium
FROM @client.gsc WHERE clicks > 0;