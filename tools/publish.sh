#!/usr/bin/env bash

node_package=node-red-contrib-smappee
node_prefix=node-

# Go up one level
if [[ $PWD = */tools ]]; then
  cd ..
fi

publish_package () {
  echo "Publishing package '${1}'"

  # Publish as public package
  npm publish --access public
}

# Loop over all node directories and publish
for dir in "${node_prefix}"*/
do
  cd $dir
  publish_package "${node_package}-${dir%?}"
  cd ..
done

# Main package
publish_package "${node_package}"
