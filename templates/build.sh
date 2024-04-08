#!/bin/bash

echo "Building the template images..."

docker build -t cpp_template:latest -f Dockerfile_cpp .
docker build -t java_template:latest -f Dockerfile_java .
