# Example flows

## Device config

Simple flow that outputs the device configuration to a debug node.

## Export real-time to MySQL database

Real-time data values get inserted to a MySQL database. The insert formatter can be changed, 
e.g. to change the table name. Use the following create statement to create the table.

```sql
CREATE TABLE `smappee_real-time_data` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `serial` varchar(10) NOT NULL DEFAULT '',
  `timestamp` timestamp NOT NULL,
  `power` int(11) DEFAULT NULL,
  `reactive_power` int(11) DEFAULT NULL,
  `export_energy` int(11) DEFAULT NULL,
  `import_energy` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6564 DEFAULT CHARSET=latin1;
```

## Real-time device data

Outputs real-time device data to a debug node.

## Switch consumption

Return consumption values for all configured Smappee Switches.

## Toggle Switch

Turns a Smappee Switch on or off via commands
