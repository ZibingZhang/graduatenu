#!/bin/bash

cd api && docker-compose up & cd frontend && docker build -t frontend . && docker run -p 3000:80 frontend