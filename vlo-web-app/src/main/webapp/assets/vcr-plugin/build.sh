#!/bin/bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PACK_MODE="production"

for ARG in "$@"
do
    case "${ARG}" in
        --dev)
            echo "Building in development mode"
            PACK_MODE='development'
            ;;
        *)
            echo "Unknown argument: ${ARG}"
            exit 1
            ;;
    esac
done

if ! [ -d "${SCRIPT_DIR}/node_modules" ]; then
	echo "Node modules directory not found: installing dependencies..."
	(cd "${SCRIPT_DIR}" && npm install)
fi


(cd "${SCRIPT_DIR}" && npm run pack -- --mode="${PACK_MODE}")
