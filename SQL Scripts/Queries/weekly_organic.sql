select
  DATETIME (week_start_date, '00:00:00') AS datetime_column,
  total_views
from
  `${client_id}.weekly_organic`
