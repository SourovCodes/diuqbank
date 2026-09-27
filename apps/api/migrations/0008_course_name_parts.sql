-- Numbered course parts as their own word, like the name normalizer does for new
-- names: "Physics-I" / "Chemistry -I" / "Manufacturing - II" → "Physics I" etc.
-- rtrim drops a space before the dash. Skipped when the new name is already taken
-- in the same department.
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' I'
WHERE name LIKE '%-I'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' I'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' I'
WHERE name LIKE '%- I'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' I'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' I'
WHERE name LIKE '%–I'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' I'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' I'
WHERE name LIKE '%– I'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' I'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' II'
WHERE name LIKE '%-II'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' II'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' II'
WHERE name LIKE '%- II'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' II'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' II'
WHERE name LIKE '%–II'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' II'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' II'
WHERE name LIKE '%– II'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' II'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' III'
WHERE name LIKE '%-III'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' III'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' III'
WHERE name LIKE '%- III'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' III'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' III'
WHERE name LIKE '%–III'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' III'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' III'
WHERE name LIKE '%– III'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' III'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' IV'
WHERE name LIKE '%-IV'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' IV'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' IV'
WHERE name LIKE '%- IV'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' IV'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' IV'
WHERE name LIKE '%–IV'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' IV'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' IV'
WHERE name LIKE '%– IV'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' IV'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' V'
WHERE name LIKE '%-V'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' V'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' V'
WHERE name LIKE '%- V'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' V'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' V'
WHERE name LIKE '%–V'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' V'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' V'
WHERE name LIKE '%– V'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' V'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' VI'
WHERE name LIKE '%-VI'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' VI'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' VI'
WHERE name LIKE '%- VI'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' VI'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' VI'
WHERE name LIKE '%–VI'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' VI'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' VI'
WHERE name LIKE '%– VI'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' VI'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' VII'
WHERE name LIKE '%-VII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' VII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' VII'
WHERE name LIKE '%- VII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' VII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' VII'
WHERE name LIKE '%–VII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' VII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' VII'
WHERE name LIKE '%– VII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' VII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' VIII'
WHERE name LIKE '%-VIII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' VIII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 6)) || ' VIII'
WHERE name LIKE '%- VIII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 6)) || ' VIII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 5)) || ' VIII'
WHERE name LIKE '%–VIII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 5)) || ' VIII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 6)) || ' VIII'
WHERE name LIKE '%– VIII'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 6)) || ' VIII'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' IX'
WHERE name LIKE '%-IX'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' IX'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' IX'
WHERE name LIKE '%- IX'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' IX'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' IX'
WHERE name LIKE '%–IX'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' IX'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' IX'
WHERE name LIKE '%– IX'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' IX'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' X'
WHERE name LIKE '%-X'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' X'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' X'
WHERE name LIKE '%- X'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' X'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' X'
WHERE name LIKE '%–X'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' X'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' X'
WHERE name LIKE '%– X'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' X'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 1'
WHERE name LIKE '%-1'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 1'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 1'
WHERE name LIKE '%- 1'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 1'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 1'
WHERE name LIKE '%–1'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 1'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 1'
WHERE name LIKE '%– 1'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 1'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 2'
WHERE name LIKE '%-2'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 2'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 2'
WHERE name LIKE '%- 2'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 2'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 2'
WHERE name LIKE '%–2'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 2'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 2'
WHERE name LIKE '%– 2'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 2'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 3'
WHERE name LIKE '%-3'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 3'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 3'
WHERE name LIKE '%- 3'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 3'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 3'
WHERE name LIKE '%–3'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 3'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 3'
WHERE name LIKE '%– 3'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 3'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 4'
WHERE name LIKE '%-4'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 4'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 4'
WHERE name LIKE '%- 4'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 4'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 4'
WHERE name LIKE '%–4'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 4'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 4'
WHERE name LIKE '%– 4'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 4'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 5'
WHERE name LIKE '%-5'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 5'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 5'
WHERE name LIKE '%- 5'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 5'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 5'
WHERE name LIKE '%–5'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 5'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 5'
WHERE name LIKE '%– 5'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 5'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 6'
WHERE name LIKE '%-6'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 6'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 6'
WHERE name LIKE '%- 6'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 6'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 6'
WHERE name LIKE '%–6'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 6'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 6'
WHERE name LIKE '%– 6'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 6'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 7'
WHERE name LIKE '%-7'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 7'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 7'
WHERE name LIKE '%- 7'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 7'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 7'
WHERE name LIKE '%–7'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 7'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 7'
WHERE name LIKE '%– 7'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 7'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 8'
WHERE name LIKE '%-8'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 8'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 8'
WHERE name LIKE '%- 8'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 8'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 8'
WHERE name LIKE '%–8'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 8'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 8'
WHERE name LIKE '%– 8'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 8'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 9'
WHERE name LIKE '%-9'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 9'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 9'
WHERE name LIKE '%- 9'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 9'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 2)) || ' 9'
WHERE name LIKE '%–9'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 2)) || ' 9'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 9'
WHERE name LIKE '%– 9'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 9'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 10'
WHERE name LIKE '%-10'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 10'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 10'
WHERE name LIKE '%- 10'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 10'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 10'
WHERE name LIKE '%–10'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 10'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 10'
WHERE name LIKE '%– 10'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 10'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 11'
WHERE name LIKE '%-11'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 11'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 11'
WHERE name LIKE '%- 11'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 11'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 11'
WHERE name LIKE '%–11'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 11'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 11'
WHERE name LIKE '%– 11'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 11'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 12'
WHERE name LIKE '%-12'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 12'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 12'
WHERE name LIKE '%- 12'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 12'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 3)) || ' 12'
WHERE name LIKE '%–12'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 3)) || ' 12'
  );
--> statement-breakpoint
UPDATE courses SET name = rtrim(substr(name, 1, length(name) - 4)) || ' 12'
WHERE name LIKE '%– 12'
  AND NOT EXISTS (
    SELECT 1 FROM courses other
    WHERE other.department_id = courses.department_id
      AND other.name = rtrim(substr(courses.name, 1, length(courses.name) - 4)) || ' 12'
  );
