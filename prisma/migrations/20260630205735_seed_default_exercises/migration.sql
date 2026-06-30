-- Seed the curated catalog of common gym exercises into default_exercises.
-- Idempotent: ON CONFLICT (slug) DO NOTHING so re-running (or running after the
-- seed script) never duplicates rows. Images ship under public/exercises/<slug>.webp.

INSERT INTO "default_exercises" ("id", "title", "slug", "muscle_group", "image_path", "updated_at")
VALUES
  (gen_random_uuid()::text, 'Barbell Bench Press', 'barbell-bench-press', 'CHEST', '/static/exercises/barbell-bench-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Incline Dumbbell Press', 'incline-dumbbell-press', 'CHEST', '/static/exercises/incline-dumbbell-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Dumbbell Fly', 'dumbbell-fly', 'CHEST', '/static/exercises/dumbbell-fly.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Push-Up', 'push-up', 'CHEST', '/static/exercises/push-up.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Cable Crossover', 'cable-crossover', 'CHEST', '/static/exercises/cable-crossover.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Pull-Up', 'pull-up', 'BACK', '/static/exercises/pull-up.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Lat Pulldown', 'lat-pulldown', 'BACK', '/static/exercises/lat-pulldown.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Bent-Over Barbell Row', 'bent-over-barbell-row', 'BACK', '/static/exercises/bent-over-barbell-row.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Seated Cable Row', 'seated-cable-row', 'BACK', '/static/exercises/seated-cable-row.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Deadlift', 'deadlift', 'BACK', '/static/exercises/deadlift.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Superman', 'superman', 'BACK', '/static/exercises/superman.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Overhead Press', 'overhead-press', 'SHOULDERS', '/static/exercises/overhead-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Dumbbell Shoulder Press', 'dumbbell-shoulder-press', 'SHOULDERS', '/static/exercises/dumbbell-shoulder-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Lateral Raise', 'lateral-raise', 'SHOULDERS', '/static/exercises/lateral-raise.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Rear Delt Row', 'rear-delt-row', 'SHOULDERS', '/static/exercises/rear-delt-row.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Arnold Press', 'arnold-press', 'SHOULDERS', '/static/exercises/arnold-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Barbell Curl', 'barbell-curl', 'BICEPS', '/static/exercises/barbell-curl.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Dumbbell Curl', 'dumbbell-curl', 'BICEPS', '/static/exercises/dumbbell-curl.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Hammer Curl', 'hammer-curl', 'BICEPS', '/static/exercises/hammer-curl.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Concentration Curl', 'concentration-curl', 'BICEPS', '/static/exercises/concentration-curl.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Triceps Pushdown', 'triceps-pushdown', 'TRICEPS', '/static/exercises/triceps-pushdown.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Triceps Dip', 'triceps-dip', 'TRICEPS', '/static/exercises/triceps-dip.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Skullcrusher', 'skullcrusher', 'TRICEPS', '/static/exercises/skullcrusher.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Close-Grip Bench Press', 'close-grip-bench-press', 'TRICEPS', '/static/exercises/close-grip-bench-press.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Bench Dip', 'bench-dip', 'TRICEPS', '/static/exercises/bench-dip.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Side Plank', 'side-plank', 'CORE', '/static/exercises/side-plank.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Crunch', 'crunch', 'CORE', '/static/exercises/crunch.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Leg Raise', 'leg-raise', 'CORE', '/static/exercises/leg-raise.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Barbell Squat', 'barbell-squat', 'QUADS', '/static/exercises/barbell-squat.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Barbell Lunge', 'barbell-lunge', 'QUADS', '/static/exercises/barbell-lunge.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Good Morning', 'good-morning', 'HAMSTRINGS', '/static/exercises/good-morning.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Leg Curl', 'leg-curl', 'HAMSTRINGS', '/static/exercises/leg-curl.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Glute Bridge', 'glute-bridge', 'GLUTES', '/static/exercises/glute-bridge.webp', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Glute Kickback', 'glute-kickback', 'GLUTES', '/static/exercises/glute-kickback.webp', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
