CREATE TABLE `bazi_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purchaseId` int,
	`type` enum('single','couple') NOT NULL,
	`baziData` json NOT NULL,
	`reportContent` text,
	`sections` json,
	`pdfUrl` varchar(512),
	`recommendedBracelet` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bazi_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`baziRecordId` int,
	`planType` enum('basic','advanced','premium') NOT NULL,
	`price` varchar(32) NOT NULL,
	`stripePaymentId` varchar(255),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`name` varchar(64),
	`inputSummary` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
