-- Create a database function to get the best score per user
CREATE OR REPLACE FUNCTION get_best_scores_per_user(
  filter_duration_param INTEGER DEFAULT NULL,
  search_query_param TEXT DEFAULT NULL,
  sort_by_param TEXT DEFAULT 'wpm',
  sort_order_param TEXT DEFAULT 'desc',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  wpm INTEGER,
  accuracy NUMERIC,
  correct_chars INTEGER,
  incorrect_chars INTEGER,
  total_chars INTEGER,
  duration INTEGER,
  created_at TIMESTAMPTZ,
  display_name TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH best_scores AS (
    SELECT DISTINCT ON (s.user_id)
      s.id,
      s.user_id,
      s.wpm,
      s.accuracy,
      s.correct_chars,
      s.incorrect_chars,
      s.total_chars,
      s.duration,
      s.created_at,
      p.display_name
    FROM scores s
    INNER JOIN profiles p ON s.user_id = p.user_id
    WHERE 
      (filter_duration_param IS NULL OR s.duration = filter_duration_param)
      AND (search_query_param IS NULL OR search_query_param = '' OR p.display_name ILIKE '%' || search_query_param || '%')
    ORDER BY 
      s.user_id,
      CASE WHEN sort_by_param = 'wpm' THEN s.wpm END DESC,
      CASE WHEN sort_by_param = 'accuracy' THEN s.accuracy END DESC,
      s.created_at DESC
  ),
  counted AS (
    SELECT COUNT(*) AS cnt FROM best_scores
  )
  SELECT 
    bs.id,
    bs.user_id,
    bs.wpm,
    bs.accuracy,
    bs.correct_chars,
    bs.incorrect_chars,
    bs.total_chars,
    bs.duration,
    bs.created_at,
    bs.display_name,
    c.cnt AS total_count
  FROM best_scores bs
  CROSS JOIN counted c
  ORDER BY 
    CASE WHEN sort_by_param = 'wpm' AND sort_order_param = 'desc' THEN bs.wpm END DESC NULLS LAST,
    CASE WHEN sort_by_param = 'wpm' AND sort_order_param = 'asc' THEN bs.wpm END ASC NULLS LAST,
    CASE WHEN sort_by_param = 'accuracy' AND sort_order_param = 'desc' THEN bs.accuracy END DESC NULLS LAST,
    CASE WHEN sort_by_param = 'accuracy' AND sort_order_param = 'asc' THEN bs.accuracy END ASC NULLS LAST,
    CASE WHEN sort_by_param = 'created_at' AND sort_order_param = 'desc' THEN bs.created_at END DESC NULLS LAST,
    CASE WHEN sort_by_param = 'created_at' AND sort_order_param = 'asc' THEN bs.created_at END ASC NULLS LAST
  OFFSET page_offset
  LIMIT page_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;