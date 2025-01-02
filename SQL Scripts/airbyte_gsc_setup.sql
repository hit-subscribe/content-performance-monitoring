CREATE VIEW @client.ga4 AS 
SELECT 
    date, 
    page as url, 
    clicks as screenpageviews, 
    'google / organic' as sessionsourcemedium,
    'google' as source,
    'organic' as medium
FROM @client.gsc WHERE clicks > 0;