# Use an official Python runtime as a parent image
FROM python:3.11.5
# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install -g npm@latest && \
    apt-get clean

# Install Node.js dependencies
WORKDIR /app/js
RUN npm install

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["sh", "/app/entrypoint.sh"]
