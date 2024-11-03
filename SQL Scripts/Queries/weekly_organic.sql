select
  DATETIME (week_start_date, '00:00:00') AS datetime_column,
  total_views
from
  `mmap.weekly_organic`
