from app.database import get_connection

try:
    connection = get_connection()

    print("Connected to MySQL successfully.")

    cursor = connection.cursor()
    cursor.execute("SELECT DATABASE(), VERSION()")
    result = cursor.fetchone()

    print("Database: ", result[0])
    print("MySQL version: ", result[1])

    cursor.close()
    connection.close()
except Exception as error:
    print("Database connection failed.")
    print(type(error).__name__, error)