FROM ubuntu:18.04

WORKDIR /home
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    gcc \
    git \
    make \
    sudo \
    wget \
    python3 \
    python3-pip
RUN apt-get install -y \
    default-jre \
    default-jdk
RUN wget https://dlcdn.apache.org/maven/maven-3/3.8.8/binaries/apache-maven-3.8.8-bin.tar.gz && \
    tar -xvf apache-maven-3.8.8-bin.tar.gz && \
    mv apache-maven-3.8.8 /opt/ && \
    rm apache-maven-3.8.8-bin.tar.gz
RUN rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
ENV MAVEN_HOME="/opt/apache-maven-3.8.8"
ENV PATH="$MAVEN_HOME/bin:$PATH"

CMD ["sleep", "infinity"]
