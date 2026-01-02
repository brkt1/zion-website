-- Verification Script for elearning_progress Table
-- Run this to verify your table structure matches the expected schema

-- Check if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'elearning_progress'
  ) THEN
    RAISE NOTICE '✅ Table elearning_progress exists';
  ELSE
    RAISE EXCEPTION '❌ Table elearning_progress does NOT exist. Please run create-elearning-progress-table.sql';
  END IF;
END $$;

-- Check columns
DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  required_columns TEXT[] := ARRAY[
    'id', 'user_id', 'lesson_id', 'week_number', 
    'completed', 'completed_at', 'viewed', 'viewed_at',
    'created_at', 'updated_at'
  ];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'elearning_progress' 
      AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;

  IF array_length(missing_columns, 1) IS NULL THEN
    RAISE NOTICE '✅ All required columns exist';
  ELSE
    RAISE EXCEPTION '❌ Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;
END $$;

-- Check indexes
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename = 'elearning_progress'
  AND indexname LIKE 'idx_elearning_progress%';

  IF index_count >= 3 THEN
    RAISE NOTICE '✅ Required indexes exist (found % indexes)', index_count;
  ELSE
    RAISE WARNING '⚠️ Expected at least 3 indexes, found %', index_count;
  END IF;
END $$;

-- Check constraints
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
  AND table_name = 'elearning_progress';

  IF constraint_count >= 3 THEN
    RAISE NOTICE '✅ Table constraints exist (found % constraints)', constraint_count;
  ELSE
    RAISE WARNING '⚠️ Expected at least 3 constraints (PK, FK, UNIQUE), found %', constraint_count;
  END IF;
END $$;

-- Check trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_elearning_progress_updated_at'
  ) THEN
    RAISE NOTICE '✅ Trigger update_elearning_progress_updated_at exists';
  ELSE
    RAISE WARNING '⚠️ Trigger update_elearning_progress_updated_at does NOT exist';
  END IF;
END $$;

-- Check RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'elearning_progress'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ Row Level Security (RLS) is enabled';
  ELSE
    RAISE WARNING '⚠️ Row Level Security (RLS) is NOT enabled';
  END IF;
END $$;

-- Summary
SELECT 
  'Table Structure Verification Complete' as status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'elearning_progress') as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'elearning_progress') as index_count,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'elearning_progress') as constraint_count;

