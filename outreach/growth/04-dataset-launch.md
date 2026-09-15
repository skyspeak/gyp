# 4. Dataset launch

Live download: `https://gyp-psi.vercel.app/api/dataset.csv`

149 hand-verified programs that are still running: name, operator, type,
whether it pays or charges, the amount, countries, US eligibility, funding
status, a link to the program page and the official source.

The 225 bulk-imported rows nobody has checked are excluded, on purpose.

## Step 1: GitHub repo

Create a public repo called `paid-gap-years`. Download the CSV, commit it as
`gap-year-programs.csv`, and use this as the README:

```markdown
# Paid gap years

A free dataset of gap year and post-grad programs, with what each one pays
or costs.

149 programs, each checked against its own official source. Programs that
have shut down or paused are removed.

| | |
|---|---|
| Pay the participant | 104 |
| Charge the participant | 35 |
| Roughly break even | 10 |

## Columns

- `name`, `operator`, `type`
- `money`: Pays you / You pay / Breaks even
- `pays_or_costs`: the published range
- `countries`: where you would be; "Worldwide or unspecified" when the program
  runs in many places
- `open_to_us_citizens`
- `funding_status`: active or at_risk
- `program_page`, `official_source`, `last_verified`

## Why this exists

Most gap year directories are paid placement: the operator pays to be
listed, so they never recommend against anyone and never report closures.
This dataset comes from a site that takes no money from any program.

## Updates

Refreshed monthly. The live version is always at
https://gyp-psi.vercel.app/api/dataset.csv

Browse it as a map: https://gyp-psi.vercel.app/map?ref=dataset

## License

Free to use with attribution to Gap Year Platform
(https://gyp-psi.vercel.app/?ref=dataset).
```

Recount the three numbers in the table from the CSV you commit; they change
as programs are verified.

## Step 2: r/datasets

Read the sub's rules first. Post once.

**Title:** `[Dataset] 149 gap year and post-grad programs with pay or cost, countries, and official sources`

```
I maintain a free, non-commercial index of gap year programs and put the
hand-verified part of it into a CSV.

149 programs. Each row has what it pays or costs, where it is, whether US
citizens can apply, and a link to the official source it was checked against.
104 pay the participant and 35 charge.

Only programs that are still running are included. I left out about 225
rows from a bulk import I haven't verified, because I didn't want unchecked
pay figures in anyone's analysis.

CSV: https://gyp-psi.vercel.app/api/dataset.csv
Repo: [your GitHub link]

Happy to answer questions about how rows were checked.
```

## Step 3: Kaggle

New Dataset, upload the CSV.

- **Title:** Paid Gap Year Programs
- **Subtitle:** 149 gap year and post-grad programs with pay or cost and official sources
- **Description:** paste the README body.
- **Tags:** education, careers, travel, nonprofit
- **License:** "Other (specified in description)", with the attribution line.

## Step 4: once a month

Download a fresh CSV, commit it to the repo, and update the Kaggle version.
Update the three counts in the README.
