# GeoShield — Scientific Data Licenses, Attribution & Redistribution Guide

**Document Purpose:** Legal and academic attribution registry, license compliance terms, and redistribution analysis for all data sources integrated into GeoShield.

---

## 1. Overview & Policy Summary

GeoShield integrates geospatial, remote sensing, and meteorological datasets to model landslide susceptibility and empirical rainfall triggers for Kullu and Mandi districts, Himachal Pradesh.

> [!IMPORTANT]
> **Redistribution Policy:** Raw primary datasets and unverified derived database dumps must **NOT** be committed to public Git repositories until explicit redistributable rights are confirmed with the originating agency. GeoShield serves precomputed derived scores through its API.

---

## 2. Dataset & Attribution Registry

### 1. NASADEM Merged DEM Global 1 arc second V001
- **Source Agency:** NASA JPL / OpenTopography.
- **Reference / DOI:** `https://doi.org/10.5069/G93T9FD9`
- **Official URL:** `https://portal.opentopography.org/`
- **License / Terms:** Public Domain (NASA Open Data Policy / US Government Work).
- **Applicable Restrictions:** No copyright restrictions. Attribution requested in academic and scientific publications.
- **Redistribution Status:** PERMITTED.
- **Required Attribution:**
  > "NASADEM data courtesy of NASA JPL and OpenTopography (DOI: 10.5069/G93T9FD9)."

---

### 2. Geological Survey of India (GSI) Bhusanket Landslide Inventory
- **Source Agency:** Geological Survey of India (Ministry of Mines, Government of India).
- **Official URL:** `https://bhusanket.gsi.gov.in/` (Reference document: Landslide Inventory Report).
- **License / Terms:** Government of India Open Data / GSI Portal Terms.
- **Investigation & Redistribution Findings:**
  - *Redistribution of Raw Point Inventory:* **RESTRICTED / UNVERIFIED**. While GSI makes inventory reports publicly accessible for national disaster research and hazard assessment, the raw point coordinates and detailed event attribute database are subject to Government of India copyright and ministry data-sharing policies.
  - *Recommendation:* Do **NOT** publish the extracted raw CSV (`landslide_inventory_kullu_mandi.csv`) or raw database dump publicly. Only deploy pre-trained model weights and aggregated cell susceptibility statistics derived from the inventory.
- **Required Attribution:**
  > "Landslide occurrence data derived from the Geological Survey of India (GSI) Bhusanket Landslide Inventory portal."

---

### 3. Open-Meteo Historical Weather API
- **Source Agency:** Open-Meteo GmbH.
- **Official URL:** `https://open-meteo.com/en/docs/historical-weather-api`
- **License / Terms:** Creative Commons Attribution 4.0 International (CC BY 4.0) for non-commercial and research applications with free tier limits. Underlying meteorological reanalysis sources include ECMWF ERA5 and national meteorological services.
- **Applicable Restrictions:** Attribution required. Commercial bulk high-volume querying requires commercial license.
- **Redistribution Status:** PERMITTED under CC BY 4.0 with attribution.
- **Required Attribution:**
  > "Weather and precipitation data provided by Open-Meteo.com under CC BY 4.0 (derived from ECMWF ERA5 reanalysis)."

---

### 4. SoilGrids 2.0 (ISRIC — World Soil Information)
- **Source Agency:** ISRIC — World Soil Information.
- **Official URL:** `https://rest.isric.org/soilgrids/v2.0/` and `https://www.isric.org/explore/soilgrids`
- **License / Terms:** Creative Commons Attribution 4.0 International (CC BY 4.0) or Open Data Commons Open Database License (ODbL).
- **Applicable Restrictions:** Attribution required; cite Poggio et al. (2021).
- **Redistribution Status:** PERMITTED under CC BY 4.0.
- **Required Attribution:**
  > "Soil properties data courtesy of SoilGrids v2.0, ISRIC — World Soil Information (Poggio et al., 2021)."

---

### 5. OpenStreetMap (OSM) Road Infrastructure
- **Source Agency:** OpenStreetMap Contributors (extracted via Overpass API).
- **Official URL:** `https://www.openstreetmap.org/` / `https://overpass-turbo.eu`
- **License / Terms:** Open Data Commons Open Database License (ODbL) 1.0.
- **Investigation of ODbL Implications:**
  - *ODbL Section 4.4 (Share-Alike for Derived Databases):* If you publicly make available a "Derived Database" that incorporates OSM data, the Derived Database must also be licensed under the ODbL.
  - *Produced Work Exception (Section 4.3):* Images, maps, or visualizations created from the data are "Produced Works" and do not require the entire underlying application codebase to become ODbL, provided proper copyright notice is given.
  - *GeoShield Compliance:* Because GeoShield utilized road segment proximity features during feature engineering, any public release of the *raw spatial road feature database* must carry the ODbL notice.
- **Required Attribution:**
  > "© OpenStreetMap contributors, licensed under the Open Data Commons Open Database License (ODbL)."

---

### 6. WorldPop Population Density
- **Source Agency:** WorldPop Research Group (University of Southampton).
- **Reference / DOI:** `https://doi.org/10.5258/SOTON/WP00839`
- **Official URL:** `https://www.worldpop.org/`
- **License / Terms:** Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Applicable Restrictions:** Academic citation required (Bondarenko M., Priyatikanto R., Tejedor-Garavito N. et al. 2025).
- **Redistribution Status:** PERMITTED under CC BY 4.0 with attribution.
- **Required Attribution:**
  > "Population distribution data: WorldPop (www.worldpop.org - School of Geography and Environmental Science, University of Southampton; DOI: 10.5258/SOTON/WP00839)."

---

### 7. Copernicus Sentinel-2 Multi-Spectral Imagery
- **Source Agency:** European Space Agency (ESA) / European Commission Copernicus Programme.
- **Official URL:** `https://dataspace.copernicus.eu/`
- **License / Terms:** Legal Notice on the use of Copernicus Sentinel Data and Service Information (Free, full and open access).
- **Applicable Restrictions:** Attribution required whenever published or distributed.
- **Redistribution Status:** PERMITTED with attribution.
- **Required Attribution:**
  > "Copernicus Sentinel data [2024-2026] processed by ESA."

---

### 8. Carto Dark Matter Basemap Tiles
- **Source Agency:** CartoDB, Inc.
- **Official URL:** `https://carto.com/basemaps/`
- **License / Terms:** Free for non-commercial web maps with attribution to CARTO and OpenStreetMap.
- **Applicable Restrictions:** Unaltered visual attribution required on web maps. High-volume commercial usage requires paid API plans.
- **Redistribution Status:** Tile caching permitted in memory; no direct redistribution of tile server packages.
- **Required Attribution:**
  > "© CARTO, © OpenStreetMap contributors"

---

### 9. Scientific Methodology Reference — Singh et al. (2025)
- **Publication:** *Natural Hazards Research*, Volume 5, Issue 1.
- **DOI:** `10.1016/j.nhres.2024.12.004`
- **Citation:**
  > Singh, A., et al. (2025). *Empirical rainfall threshold determination for landslide initiation in the North-Western Himalayas.* Natural Hazards Research, DOI: 10.1016/j.nhres.2024.12.004.
- **Status:** Academic research publication under standard publisher copyright (Elsevier). The mathematical formulation of the threshold equations ($I = \alpha D^{-\beta}$) is an open scientific principle implemented into the rule-based trigger module.
