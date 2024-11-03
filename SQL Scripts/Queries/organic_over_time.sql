SELECT
  DATETIME (
    CONCAT (
      CAST(Year AS STRING),
      '-',
      LPAD (CAST(Month AS STRING), 2, '0'),
      '-01 00:00:00'
    )
  ) AS date_column,
  views
FROM
  `${client_id}.organic_by_month`
ORDER BY
  date_column DESC;
