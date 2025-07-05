import os
import json
import uuid
from datetime import datetime
from sqlalchemy import create_engine, text

# Add your DATABASE_URL here or use environment variable
DATABASE_URL = os.environ.get("DATABASE_URL")

# Connect to the database
engine = create_engine(DATABASE_URL)

# Tables to export (case-sensitive with quotes for PascalCase tables)
tables_to_export = [
    'Customer',  # Example based on your provided JSON
    'User',
    'Bill',
    'BillItem',
    'Invitation',
    'Item',
    'Profile',
    'UserRole'
]

# Helper function to convert complex types for JSON
def serialize_value(value):
    if isinstance(value, (datetime)):
        return value.isoformat()
    if isinstance(value, uuid.UUID):
        return str(value)
    return value

def export_all_data():
    print("Starting data export...")

    with engine.connect() as connection:
        for table in tables_to_export:
            try:
                print(f"Fetching data for {table}...")

                result = connection.execute(text(f'SELECT * FROM "{table}"'))

                # Get column names
                columns = result.keys()
                
                # Process rows with proper serialization
                rows = []
                for row in result.fetchall():
                    row_dict = {
                        col: serialize_value(val)
                        for col, val in zip(columns, row)
                    }
                    rows.append(row_dict)

                # Export to JSON file
                file_path = f"{table.lower()}_export.json"
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(rows, f, indent=2, ensure_ascii=False)

                print(f"Successfully exported {table} data to {file_path}")

            except Exception as e:
                print(f"Error exporting {table}: {e}")

    print("All specified data has been exported.")

if __name__ == "__main__":
    export_all_data()
    