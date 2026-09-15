-- Canada IEC was marked closed to US citizens. It is open to them through one
-- Recognized Organization, SWAP Working Holidays: Canada's own list of
-- Recognized Organizations gives SWAP's eligibility as "Citizens of IEC
-- countries or territories and the United States".
-- https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/recognized-organizations.html
--
-- The importer read "NOT eligible ... through the standard route" and missed
-- the "EXCEPTION" that followed. scripts/import-csv.ts is fixed; this corrects
-- the row already in production. Safe to run twice.
UPDATE programs
SET us_eligible = 1,
    caveat_note = 'Open to US citizens only through SWAP Working Holidays, a Recognized Organization; the standard IEC route is closed to US citizens because the US has no Youth Mobility Agreement with Canada.'
WHERE slug = 'canada-iec';

SELECT slug, us_eligible FROM programs WHERE slug = 'canada-iec';
