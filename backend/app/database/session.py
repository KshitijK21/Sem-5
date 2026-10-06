from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

IS_SQLITE = settings.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


if IS_SQLITE:

    @event.listens_for(engine, "connect")
    def _sqlite_tuning(dbapi_connection, _connection_record) -> None:
        """Tune SQLite for the analytical workload (dev database).

        Star-schema queries probe dimension indexes tens of thousands of times
        per statement; with the default pager each probe paid a syscall, which
        made joins ~10x slower than necessary. A read-only memory-mapped I/O
        window plus an in-process page cache keeps the warehouse fast without
        changing any query. Production targets PostgreSQL and does not use
        this path.
        """
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA mmap_size=268435456")  # 256MB mapping
        cursor.execute("PRAGMA cache_size=-16384")  # 16MB page cache per connection
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()
