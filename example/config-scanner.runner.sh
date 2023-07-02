#!/bin/bash

# Get the directory path of the current script
script_dir=$(dirname "$0")

# Change the working directory to the script's directory
cd "$script_dir" || exit

# Run the file with a relative path
npx ts-node ./run-config-scanner ./project_1/src,./project_2/src --format
