FROM postgres:15

# Install Python and bcrypt for password hashing
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install bcrypt --break-system-packages && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
