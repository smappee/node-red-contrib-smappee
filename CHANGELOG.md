# Node-RED: Smappee change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 
  
### Changed

- 

### Removed

- 

## [0.1.0] - 2018-05-03
  
### Changed

- Bumped to official first 0.1.0 release after remainder of Smappee Switch renaming

## [0.0.19] - 2018-05-03
  
### Changed

- Continued refactoring of plug state to Switch state

## [0.0.18] - 2018-05-03
  
### Changed

- Renamed the plug state to Switch state to make it less generic

## [0.0.17] - 2018-05-03

### Added

- New package node-solar added with a node for supporting SolarEdge API calls
  
### Changed

- Added automatic acceptance of authorize requests

## [0.0.16] - 2018-04-23
  
### Changed

- Added automatic acceptance of authorize requests for OCPP 1.6

## [0.0.15] - 2018-04-18
  
### Changed

- Updated documentation for EV and KNX nodes
- Separated the OCPP central system connection to have its own port

## [0.0.14] - 2018-02-20

### Changed

- Minor changes to naming that were noticed too late after release

## [0.0.13] - 2018-02-20

### Added

- Documentation and references for the electric vehicle nodes
- Support for KNX data point types 7, 8, 9, 10, and 11 has been added

## [0.0.12] - 2018-02-16

### Added

- Created example flows for most device nodes
- Added device config output to the msg object
- Basic implementation of a OCPP 1.6 charge point and central system
- OCPP 1.6 nodes for sending requests to a charge point or central system
  
### Changed

- Updated device node to reflect new firmware changes 

## [0.0.11] - 2018-01-25

### Added

- Added generic run script to run tasks for each node directory
- Example flow for turning a KNX device on or off
- Added support for boolean values as input for the plug state node
- DPT4, DPT5, and DPT6 have been added to list of data point types
  
### Changed

- Updated device nodes to newest firmware changes
- Forced tunneling has been disabled on the KNX gateway config

## [0.0.10] - 2018-01-25

### Removed

- Old postinstall script was replaced with a generic run script

## [0.0.9] - 2018-01-24

### Changed

- Fixed the KNX destination node so that the DPT value is saved
- Added boolean check on sent values through KNX

## [0.0.8] - 2018-01-23

### Changed

- Updated configuration labels

## [0.0.7] - 2018-01-23

### Added

- Created postinstall script that installs child nodes and their dependencies correctly

## [0.0.6] - 2018-01-18

### Changed

- Added check on device config before using it to establish a connection

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

- Scoped the packages on @smappee
