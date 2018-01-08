# Node-RED: Smappee

A collection of [Smappee](https://www.smappee.com) nodes for [Node-RED](https://www.nodered.org).
See the [nodes](#Nodes) below for a complete list per category. 

## Installation

Install via [npm](https://npm.org) into your `.node-red` directory 

```bash
npm install @smappee/node-red-contrib-smappee
```

This repository contains all nodes available, separated per category.

## Feedback

Help us improve by mailing [github@smappee.com](mailto:github@smappee.com) with feedback.

## Nodes

Nodes are split into different categories to make smaller installations possible.

### Category [`device`](./node-device/README.md)

Smappee devices can be read with the nodes in `node-device`.

```bash
npm install @smappee/node-red-contrib-smappee-device
```

Device nodes require a 
[Smappee Plus](https://www.smappee.com/be_en/plus-energy-monitor) or 
[Smappee Pro](https://www.smappee.com/be_en/pro-energy-monitor) to work. 
Please contact [support@smappee.com](mailto:support@smappee.com) to activate Node-RED on the device itself.

### Category [`knx`](./node-knx/README.md)

KNX events can be received and sent through nodes in `node-knx`.

```bash
npm install @smappee/node-red-contrib-smappee-knx
```

## Copyright and license

Copyright © 2017-2018 Smappee NV, all rights reserved.
