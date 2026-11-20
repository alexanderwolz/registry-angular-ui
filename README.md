# Docker Registry Angular UI

![GitHub release (latest by date)](https://img.shields.io/github/v/release/alexanderwolz/registry-angular-ui)
![Docker Pulls](https://img.shields.io/docker/pulls/alexanderwolz/registry-angular-ui)
![GitHub](https://img.shields.io/badge/angular-22.3-orange)
![GitHub](https://img.shields.io/badge/bootstrap-5.3.9-orange)
![GitHub](https://img.shields.io/badge/registry-2.8.3-orange)
![GitHub](https://img.shields.io/github/license/alexanderwolz/registry-angular-ui)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/alexanderwolz/registry-angular-ui)
![GitHub all releases](https://img.shields.io/github/downloads/alexanderwolz/registry-angular-ui/total?color=informational)

## 🧑‍💻 About

Simple Angular- and Bootstrap-based web application for Docker Registry V2 with auth- and data cache.

## 🖥️ Preview
![Preview](documentation/preview.gif)

## 🔬 Basic Concept
- Web application determines auth provider by www-authenticate header of given registry host (can be basic auth, token auth or empty)
- Credentials are base64 encoded and encrypted by app secret using cryptoJS
- Access tokens are being cached for their valid period (expiration minus 5 seconds) and renewed if necessary.
- Tags, Manifests and Repositories are being cached until page gets reloaded
- minimizes HTTP traffic as much as possible

- See also [keycloak-docker-group-role-mapper](https://github.com/alexanderwolz/keycloak-docker-group-role-mapper) for authentication mapping.

## 🛠️ Build
### Using prebuild image from Docker Hub
- Download image: ```docker pull alexanderwolz/registry-angular-ui:1.3.0```
### Build yourself
- ```docker build -t registry-angular-ui:latest .```

### Release
Publishing a GitHub release builds and pushes the image to Docker Hub (see `.github/workflows/docker-build-push.yml`):
1. Set the new `version` in `package.json` and merge it
2. Publish a release whose tag matches that version, e.g. `v1.3.0` (the build fails if tag and `package.json` differ)
3. The image is pushed as `alexanderwolz/registry-angular-ui:<version>`

The repository needs the secret `DOCKERHUB_TOKEN` (access token of the Docker Hub user `alexanderwolz`).

## ⚙️ Configuration
This web application supports the following environment variables:

| Variable Name                   | Description                                                                     |
|---------------------------------|---------------------------------------------------------------------------------|
|```REGISTRY_HOST```              | URL of the registry to connect to with scheme http/https                        |
|```TOKEN_SECRET```               | Secret used for encrypting the base64 credentials                               |
|```CHECK_PULL_ACCESS```          | If set to ```true```, each repository is being checked for pull permissions     |

## 🔍 Examples

- [registry-local](examples/registry-local): local registry setup
- [registry-proxy](examples/registry-proxy): using existing registry with reverse proxy (CORS)

## ✨ Credits

Thanks to [Joxit](https://github.com/Joxit/docker-registry-ui) and [Docker Hub](https://hub.docker.com) for the inspiration.


- - -

Made with ❤️ in Bavaria
<br>
© 2024, <a href="https://www.alexanderwolz.de"> Alexander Wolz
