#!/usr/bin/env bash

node_package=node-red-contrib-smappee
node_prefix=node-

# Go up one level
if [[ $PWD = */tools ]]; then
  cd ..
fi

install_package () {
  echo "Installing package '${1}'"

  # Install package
  npm install
}

# Loop over all node directories and publish
for dir in "${node_prefix}"*/
do
  cd $dir
  install_package "${node_package}-${dir%?}"
  cd ..
done

# Main package
install_package "${node_package}"
