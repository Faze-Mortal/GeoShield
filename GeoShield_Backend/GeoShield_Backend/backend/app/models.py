from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base
from sqlalchemy.types import UserDefinedType


Base = declarative_base()


class PostGISPolygon(UserDefinedType):
    """SQLAlchemy type for an existing PostGIS Polygon geometry column."""
    cache_ok = True

    def get_col_spec(self, **kwargs):
        return "geometry(Polygon,4326)"


class GridRisk(Base):
    __tablename__ = "grid_risk"

    cell_id = Column(String, primary_key=True)
    nearest_rainfall_location_id = Column(Integer)
    susceptibility_score = Column(Float)
    trigger_state = Column(String)
    current_risk = Column(String)
    susceptibility_bin = Column(String)
    geometry = Column(PostGISPolygon())
