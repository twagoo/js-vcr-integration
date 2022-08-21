#!/bin/bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

NPM_SCRIPT='pack'
RUN_TESTS='true'

for ARG in "$@"
do
    case "${ARG}" in
        --dev)
            echo "Building in development mode"
            NPM_SCRIPT='pack-dev'
            ;;
        --skipTests)
            echo "Skipping tests"
            RUN_TESTS='false'
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


(cd "${SCRIPT_DIR}" \
    && ([ "${RUN_TESTS}" != 'true' ] || npm run test) \
    && npm run "${NPM_SCRIPT}")
