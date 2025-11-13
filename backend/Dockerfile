# 1: Start with a Python base image
FROM python:3.11-slim-bullseye

# 2: Set environment variable to ensure logs are shown
ENV PYTHONUNBUFFERED=1

# 3: Update the package list and install system dependencies
RUN apt-get update && \
    apt-get -y install gcc libpq-dev

# 4: Create and set the working directory
WORKDIR /app

# 5: Copy the requirements file to the container
COPY requirements.txt /app/requirements.txt

# 6: Install Python dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# 7: Copy the project code into the container
COPY . /app/

# 8: Expose port 8000 for the application
EXPOSE 8000

# 9: Set the entrypoint script to run Django commands and start Gunicorn
ENTRYPOINT ["sh", "-c", "sleep 20 && python manage.py collectstatic --noinput && python manage.py migrate && gunicorn project.wsgi:application --bind 0.0.0.0:8000"]


