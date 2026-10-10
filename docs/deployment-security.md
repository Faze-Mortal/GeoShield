# GeoShield — Deployment & Database Security Guide

**Document Purpose:** Production deployment and security hardening guidance for GeoShield operators.  
**Audience:** System Administrators, DevOps Engineers, and Cloud Infrastructure Architects.

---

## 1. Threat Model & Security Posture

GeoShield serves geospatial risk intelligence through a decoupled architecture:
1. **Public Web Client (Next.js):** Runs client-side in visitor browsers and connects to the API and basemap CDN.
2. **Application Server (FastAPI):** Exposes JSON endpoints (`/predict`, `/grid`, `/simulate`).
3. **Database Server (PostgreSQL / PostGIS):** Persists precomputed terrain grid cells, feature geometries, and susceptibility scores.

Because this application serves environmental risk data without user accounts or payment systems, the primary security goals are:
- **Integrity:** Prevent unauthorized modification or deletion of scientific risk grid data.
- **Availability:** Protect against resource exhaustion and denial of service.
- **Confidentiality:** Prevent leakage of infrastructure topology, absolute filesystem paths, and database credentials.

---

## 2. Database Least-Privilege Role Separation

In local development, developers often connect as a superuser (e.g., `postgres`). **This must never occur in production.**

The application should operate with two distinct database roles:

### 2.1 Role 1: Data Loader & Migrator (`geoshield_admin`)
- **Usage:** Used only during initial provisioning, data imports (`import_data.py`), and schema migrations.
- **Permissions:** Full `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` privileges on tables and spatial geometries.
- **Credentials:** Kept offline or in deployment CI/CD secrets; never exposed to the running FastAPI service.

### 2.2 Role 2: Read-Only Application API Role (`geoshield_api_role`)
- **Usage:** Used exclusively by the runtime FastAPI application.
- **Permissions:** Restricted strictly to `SELECT` on the required table (`grid_risk`) and PostGIS reference tables (`spatial_ref_sys`).
- **Forbidden:** No `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, or `CREATE` permissions. If the FastAPI application is ever compromised, the attacker cannot alter or drop grid risk datasets.

---

## 3. Example SQL Template for Role Provisioning

> [!IMPORTANT]
> The following SQL statements are illustrative templates with placeholder values. **Do not execute destructive SQL against live production databases without testing in a staging environment.**

```sql
-- 1. Create a dedicated database for GeoShield
CREATE DATABASE geoshield;

-- Connect to the geoshield database
\c geoshield

-- 2. Ensure PostGIS extension is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3. Create the read-only application user with a strong password
CREATE USER geoshield_api_user WITH PASSWORD '[[PLACEHOLDER: DB_API_PASSWORD]]';

-- 4. Revoke public schema default permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO geoshield_api_user;

-- 5. Grant read-only access to specific tables
GRANT SELECT ON TABLE grid_risk TO geoshield_api_user;
GRANT SELECT ON TABLE spatial_ref_sys TO geoshield_api_user;

-- 6. Ensure newly created tables in public schema are NOT automatically readable
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM geoshield_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO geoshield_api_user;

-- Verify permissions:
-- \du geoshield_api_user
-- \z grid_risk
```

---

## 4. Database Connection String & SQLAlchemy Drivers

The GeoShield backend utilizes SQLAlchemy for connection pooling and object-relational querying.

### Expected Connection String Scheme
Always use the explicit psycopg2 driver specification:
```bash
DATABASE_URL=postgresql+psycopg2://geoshield_api_user:YOUR_SECRET_PASSWORD@db-private.internal.cloud:5432/geoshield?sslmode=require
```

**Key Parameters:**
- `postgresql+psycopg2://`: Explicitly specifies the PostgreSQL dialect with the binary psycopg2 driver.
- `sslmode=require` or `sslmode=verify-full`: Enforces TLS encryption for all database network traffic.

---

## 5. Network Isolation & Boundary Defense

1. **Private Subnet / VPC:**
   - The PostgreSQL database must never bind to `0.0.0.0` with a public IP address.
   - Deploy PostgreSQL within a private VPC subnet reachable only by the FastAPI application container via internal networking (e.g., AWS VPC security group, Render private network, or Docker internal bridge).
2. **Firewall Rules:**
   - Restrict port 5432 ingress strictly to the specific internal IP addresses or CIDR blocks of the FastAPI application tier.
3. **Connection Pooling:**
   - The default configuration in `database.py` enables `pool_pre_ping=True` to detect dropped connections without crashing worker threads.
   - Configure pool size (`pool_size=10, max_overflow=20`) to prevent database connection exhaustion under traffic spikes.

---

## 6. Secret Management & Transport Security

1. **Environment Variables:**
   - Never store passwords, tokens, or connection strings in Git, Dockerfiles, or frontend bundles.
   - Configure environment variables directly in the hosting provider's dashboard (e.g., Render, Railway, AWS ECS, Vercel).
2. **HTTPS & Transport Encryption:**
   - All public ingress traffic to both Next.js frontend and FastAPI backend must terminate on HTTPS (TLS 1.2 or 1.3).
   - Use automated certificate management (Let's Encrypt / AWS Certificate Manager).
3. **CORS Configuration:**
   - Configure `CORS_ALLOWED_ORIGINS` to accept only the exact production frontend domain (e.g., `https://geoshield.example.org`).
   - Never permit wildcard `*` origins on credentialed or production API instances.
