# Migrations

Currently using `Base.metadata.create_all()` (see `backend/config/database.py:init_db`)
since the target is SQLite for local dev. Once moving to Postgres, initialize
Alembic here:

    alembic init database/migrations
