---
id: geospatial-traffic-analysis
title: Geospatial Traffic Analytics Pipeline & API
author: Emin
tags:
  - prefect
  - postgis
  - etl-pipeline
  - data-engineering
  - fastapi
excerpt: Prefect-backed Geospatial Traffic Analytics Pipeline and API using FastAPI and Docker.
---

# Building a Geospatial Traffic Analytics Pipeline

I built a data pipeline that ingests 1.6 million US road segments from federal open data, computes 270 million hourly traffic volume estimates, and serves the results through a geospatial REST API. Here is what I built, why I made the decisions I did, and what broke along the way.

The full code is at <a href="https://github.com/eminyorgun/geospatial-traffic-analytics/"></a>

## The Data

The project uses two public datasets:

**FHWA HPMS GeoDatabase**: the federal highway performance monitoring system. One file contains all 50 US states as separate layers. Each road segment has geometry, AADT (Annual Average Daily Traffic), speed limit, lane count, and functional class. No road names.

**Overture Maps GeoParquet**: an open road dataset with readable names but no traffic data.

Neither dataset is complete on its own. HPMS has the traffic attributes but anonymous segments. Overture has the names but no AADT. The pipeline joins them spatially to get both.

For hourly estimation I used FHWA TVT factors, published federal adjustment tables that break AADT into 24-hour and day-of-week profiles by road class. The formula is simple:

```
estimated_volume = (aadt / 24) × hourly_factor × dow_factor
```

## Pipeline Design

I used Prefect for orchestration and structured the database into three schemas: `raw` (untouched source data), `staging` (transformed and joined), and `public` (serving layer the API reads from).

The separation matters. Raw is never modified after load, so I can always re-run a stage without worrying about what state it left the database in. Staging is where transformations happen. Promotion from staging to public is a single atomic transaction. If it fails, the serving layer still has the previous run's data intact.

The pipeline has seven stages:

1. **Locate**: find the input files or fail immediately with a clear message
2. **Validate**: check row counts, required columns, and CRS before writing anything
3. **Transform**: parse each source into the raw schema
4. **Enrich**: spatial join HPMS + Overture into staging
5. **Compute**: generate 168 volume estimates per road (24h × 7 days)
6. **Load**: atomically promote staging to public
7. **Log**: write a pipeline run record with status, counts, and error notes

Stages 1–3 run tasks in parallel per source. Stages 4–7 are sequential because each depends on the previous.

## What Actually Broke

**OOM crashes.** The Prefect worker kept dying with exit code 137, Docker's OOM kill signal. The cause was loading full GeoDatabase and Parquet files into memory at once. The fix was chunked ingestion: read in batches of 10,000 rows, process, write, repeat. Memory stays bounded regardless of file size.

**Duplicate primary keys.** I used `route_id` as the road segment identifier. It isn't unique: one route like I-26 has hundreds of segments. The correct key is a composite of `route_id + begin_point + end_point`, which is how HPMS actually defines a segment. Silent duplicate key errors on insert told me this late.

**Type mismatches.** The HPMS GeoDatabase stores numeric fields (lane counts, AADT, county codes) as floats. PostgreSQL integer columns reject `1250.0`. Every numeric field had to be explicitly cast at ingestion time.

**FK constraint on TRUNCATE.** PostgreSQL refuses to truncate a parent table when a child table has a foreign key referencing it. You have to truncate both in one statement: `TRUNCATE TABLE public.volume_estimates, public.roads`.

## The API

The serving layer is FastAPI backed by PostGIS via GeoAlchemy2. Key endpoints:

- `GET /roads/`: filter by functional class, county, limit
- `POST /roads/spatial_filter/`: return all segments intersecting a bounding box
- `GET /roads/{road_id}/volume`: 168 hourly estimates for a single segment
- `GET /patterns/high_volume/`: roads exceeding an AADT threshold
- `GET /patterns/peak_hours/`: busiest hour per road class using a SQL `RANK()` window function

Road geometries are returned as GeoJSON. The spatial filter uses PostGIS `ST_Intersects` directly, which is fast with the geometry index.

## What I Would Do Differently

The spatial join between HPMS and Overture loads both datasets fully into memory before joining. At full scale that is several gigabytes. A better approach would push the join into PostGIS using `ST_DWithin`, keeping memory bounded and letting the database handle the index.

I would also add dbt for the staging-to-public transformation layer rather than doing it in raw SQL inside load tasks. It would make the transformations testable and documented independently of the pipeline code.

---

The stack is fully containerized with Docker Compose. PostGIS, Prefect server, Prefect worker, and FastAPI spin up together. Swap `HPMS_STATE` in `.env` and re-run to load any US state.
