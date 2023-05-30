#!/bin/bash
# Copyright (C) 2023 Alexander Wolz <mail@alexanderwolz.de>

REGISTRY="localhost:8000"


function push {
    local IMAGE=$1
    local NAMESPACE=$2
    local NAME=$3
    local TAG=$4
    local REPO="$REGISTRY/$NAMESPACE/$NAME:$TAG"

    docker pull $1 > /dev/null
    docker tag $1 $REPO > /dev/null
    echo "pushing $REPO"
    docker push $REPO > /dev/null
    if [ "$?" -ne 0 ]; then
        exit 1
    fi
    docker image rm $REPO > /dev/null
}

docker ps -q >/dev/null 2>&1 # check if docker is running
if [ "$?" -ne 0 ]; then
    echo "Docker engine is not running!"
    exit 1
fi

#use this very secure account ;)
echo "password" | docker login $REGISTRY --username john --password-stdin > /dev/null
if [ "$?" -ne 0 ]; then
    exit 1
fi

#usage: push IMAGE NAMESPACE NAME TAG
push alpine:3.15.0 john alpine-custom 0.1.1-RC1
push alpine:3.16.0 john alpine-custom 1.0.0
push alpine:3.17.0 john alpine-custom 1.1.0
push alpine:3.18.0 john alpine-custom 1.2.0
push nginx:1.24.0 john nginx 1.25.0-PRE
push registry:2.8.2 john registry 2.8.2

push registry:2.8.1 example.com registry 2.8.1-custom
push alpine:3.15.0 example.com/project1 alpine-basic-image 3.15.0


