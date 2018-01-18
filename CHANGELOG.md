# Node-RED: Smappee change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 
  
### Changed

- Added check on device config before using it to establish a connection

### Removed

- 

## [0.0.5] - 2018-01-09

### Added

- An aggregate node has been added to get 5 minute power values from a device
  
### Changed

- Extra documentation for the device nodes, how to use inputs and outputs

## [0.0.4] - 2017-12-29

### Changed

- Updated to `mqtt` version 2.15.0

## [0.0.3] - 2017-12-21

### Added

- Added a feedback email to the README
  
### Changed

- Updated README documentation
- Refactored the device config node so that only the device serial number is absolutely necessary

## [0.0.2] - 2017-12-18

### Changed

- Keywords were slightly changed to make packages easily found in Node-RED

## [0.0.1] - 2017-12-15

### Added

- Added project files and a basic structure, including this CHANGELOG
- Several nodes were created, such as the Smappee device and KNX nodes

### Changed

- Scoped the packaged on @smappee
