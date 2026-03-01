import psycopg2

def migrate_db():
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect('postgresql://postgres:post123@localhost:5432/test2')
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Running ALTER TABLE...")
    try:
        cur.execute('ALTER TABLE facial_recognition_data ADD COLUMN IF NOT EXISTS face_embedding TEXT;')
        print("Column face_embedding added.")
    except Exception as e:
        print("Error adding:", e)

    try:
        cur.execute('ALTER TABLE facial_recognition_data DROP COLUMN IF EXISTS face_encoding_path;')
        print("Column face_encoding_path dropped.")
    except Exception as e:
        print("Error dropping:", e)

    print("Migration complete!")
    conn.close()

if __name__ == "__main__":
    migrate_db()
