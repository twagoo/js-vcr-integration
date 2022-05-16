#!/bin/bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if ! [ -d "${SCRIPT_DIR}/node_modules" ]; then
	echo "Node modules directory not found: installing dependencies..."
	(cd "${SCRIPT_DIR}" && npm install)
fi

(cd "${SCRIPT_DIR}" && npm run pack)
