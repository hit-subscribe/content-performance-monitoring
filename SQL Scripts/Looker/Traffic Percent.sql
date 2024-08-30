WITH tag_classification AS (
  SELECT 
    aui.url,
    aui.tags,
    -- Determine if @tag is present in the tags
    CASE 
      WHEN ARRAY_LENGTH(ARRAY(SELECT AS STRUCT TRIM(tag) FROM UNNEST(SPLIT(aui.tags, ',')) AS tag WHERE TRIM(tag) = @tag)) > 0 
      THEN @tag
      ELSE 'Other'
    END AS tag_category,
    SUM(ga.screenpageviews) AS total_views
  FROM 
    @client.airtable_url_inventory aui 
  INNER JOIN 
    @client.ga4 ga
  ON
    aui.url = ga.url
  WHERE 
    DATE(date) BETWEEN DATE(PARSE_DATE('%Y%m%d', @DS_START_DATE)) AND DATE(PARSE_DATE('%Y%m%d', @DS_END_DATE))
  GROUP BY 
    aui.url, aui.tags
)

SELECT
  tag_category,
  SUM(total_views) as views
FROM
  tag_classification
  GROUP BY tag_category