# GeoShield Database Import

## 1. Create the database

Create a PostgreSQL database named:

`geoshield`

Enable PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## 2. Configure the backend

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

and set your own PostgreSQL connection string.

## 3. Automated import

From the project root, after installing the backend requirements:

```powershell
python database\import_data.py
```

The script loads:

```text
data/grid_current_risk.csv
data/grid_kullu_mandi_geometry.csv
```

It creates/updates `grid_risk`, converts the WKB hex polygons to PostGIS geometry with SRID 4326, and creates the GiST geometry index.

## 4. Expected result

The completed table should contain:

```text
96,118 rows
96,118 rows with non-null polygon geometry
```

## 5. Manual schema

If you want to create only the schema first, run:

```text
database/schema.sql
```

Then use the automated importer to load the supplied data.
