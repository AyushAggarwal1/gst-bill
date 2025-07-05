import os
import json
import uuid
from datetime import datetime
from sqlalchemy import create_engine, text

# Database URL from environment variable
DATABASE_URL = os.environ.get("DATABASE_URL")

# Connect to the database
engine = create_engine(DATABASE_URL)

# Tables to export (case-sensitive with quotes for PascalCase tables)
tables_to_export = [
    'Customer', 
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
    
    # Create a folder with current date
    current_date = datetime.now().strftime('%Y-%m-%d')
    export_folder = f"db_backup_{current_date}"
    
    # Create the directory if it doesn't exist
    if not os.path.exists(export_folder):
        os.makedirs(export_folder)
        print(f"Created export folder: {export_folder}")

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

                # Export to JSON file in the date folder
                file_path = os.path.join(export_folder, f"{table.lower()}_export.json")
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(rows, f, indent=2, ensure_ascii=False)

                print(f"Successfully exported {table} data to {file_path}")

            except Exception as e:
                print(f"Error exporting {table}: {e}")

    print(f"All specified data has been exported to folder: {export_folder}")

if __name__ == "__main__":
    export_all_data()
    