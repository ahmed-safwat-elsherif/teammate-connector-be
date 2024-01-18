RESTORE DATABASE GRC_DEMO FROM DISK = '/tmp/GRC_DEMO.bak'
WITH
MOVE 'Sword' TO '/var/opt/mssql/data/GRC_DEMO.mdf',
MOVE 'Banking_Archive' TO '/var/opt/mssql/data/GRC_DEMO_Archive.mdf',
MOVE 'Sword_log' TO '/var/opt/mssql/data/GRC_DEMO.ldf',
REPLACE, RECOVERY;
