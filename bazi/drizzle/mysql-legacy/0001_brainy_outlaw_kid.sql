CREATE TABLE `bazi_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('single','couple') NOT NULL,
	`name1` varchar(64) NOT NULL,
	`name2` varchar(64),
	`inputData` json NOT NULL,
	`resultSummary` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bazi_records_id` PRIMARY KEY(`id`)
);
