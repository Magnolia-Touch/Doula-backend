-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: douladb
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_AvailableSlotsForServiceToIntakeForm`
--

DROP TABLE IF EXISTS `_AvailableSlotsForServiceToIntakeForm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_AvailableSlotsForServiceToIntakeForm` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_AvailableSlotsForServiceToIntakeForm_AB_unique` (`A`,`B`),
  KEY `_AvailableSlotsForServiceToIntakeForm_B_index` (`B`),
  CONSTRAINT `_AvailableSlotsForServiceToIntakeForm_A_fkey` FOREIGN KEY (`A`) REFERENCES `AvailableSlotsForService` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_AvailableSlotsForServiceToIntakeForm_B_fkey` FOREIGN KEY (`B`) REFERENCES `IntakeForm` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_AvailableSlotsForServiceToIntakeForm`
--

LOCK TABLES `_AvailableSlotsForServiceToIntakeForm` WRITE;
/*!40000 ALTER TABLE `_AvailableSlotsForServiceToIntakeForm` DISABLE KEYS */;
/*!40000 ALTER TABLE `_AvailableSlotsForServiceToIntakeForm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_AvailableSlotsForServiceToServiceBooking`
--

DROP TABLE IF EXISTS `_AvailableSlotsForServiceToServiceBooking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_AvailableSlotsForServiceToServiceBooking` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_AvailableSlotsForServiceToServiceBooking_AB_unique` (`A`,`B`),
  KEY `_AvailableSlotsForServiceToServiceBooking_B_index` (`B`),
  CONSTRAINT `_AvailableSlotsForServiceToServiceBooking_A_fkey` FOREIGN KEY (`A`) REFERENCES `AvailableSlotsForService` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_AvailableSlotsForServiceToServiceBooking_B_fkey` FOREIGN KEY (`B`) REFERENCES `ServiceBooking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_AvailableSlotsForServiceToServiceBooking`
--

LOCK TABLES `_AvailableSlotsForServiceToServiceBooking` WRITE;
/*!40000 ALTER TABLE `_AvailableSlotsForServiceToServiceBooking` DISABLE KEYS */;
/*!40000 ALTER TABLE `_AvailableSlotsForServiceToServiceBooking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_DoulaProfileToZoneManagerProfile`
--

DROP TABLE IF EXISTS `_DoulaProfileToZoneManagerProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_DoulaProfileToZoneManagerProfile` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_DoulaProfileToZoneManagerProfile_AB_unique` (`A`,`B`),
  KEY `_DoulaProfileToZoneManagerProfile_B_index` (`B`),
  CONSTRAINT `_DoulaProfileToZoneManagerProfile_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_DoulaProfileToZoneManagerProfile_B_fkey` FOREIGN KEY (`B`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_DoulaProfileToZoneManagerProfile`
--

LOCK TABLES `_DoulaProfileToZoneManagerProfile` WRITE;
/*!40000 ALTER TABLE `_DoulaProfileToZoneManagerProfile` DISABLE KEYS */;
INSERT INTO `_DoulaProfileToZoneManagerProfile` VALUES ('655fa3dd-7b27-4371-b9e8-9bf4343b7735','f88c9e79-66b0-4d3b-968a-7df22bdaee50');
/*!40000 ALTER TABLE `_DoulaProfileToZoneManagerProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('093147c9-5bdc-4fa2-b243-087a2e163b3c','e6f049a079f073be17e3a92169d98ebab63891590ee40385a01a79f9ebd4afbe','2025-12-27 12:17:51.110','20251222103505_schedule_and_servicebooking_table_linked',NULL,NULL,'2025-12-27 12:17:51.095',1),('2097454d-b5be-4018-a737-c7165cb09518','d27a4c079e61515a08ae00711be3a4470a3a5cb7eaac58663943d5219010ad9f','2025-12-27 12:17:51.194','20251226130835_stores_date_only_on_off_days',NULL,NULL,'2025-12-27 12:17:51.187',1),('280f340c-e458-472b-9295-8b0ef0aba77b','c310a7108479ddaeafe31b073079193860cc85cfc6ff7fd4fb9238ad57754276','2025-12-28 14:46:02.977','20251228144602_payment_model_changed',NULL,NULL,'2025-12-28 14:46:02.948',1),('38aa150d-1154-4630-a2f9-ac3fbd11338b','f591de0cb8b6d9ae33a7c4c6dbbd102caa6d96c9283a31b06a57f36674babc95','2025-12-27 12:17:51.131','20251222104459_schedule_and_servicebooking_table_linked_and_default_added',NULL,NULL,'2025-12-27 12:17:51.111',1),('4022d7bb-9815-4b34-9174-7b74f2bf3d45','373d78c22a0daaf3e22261121a8622fb483d2296d4391d21802bd3297c7bf724','2025-12-28 07:07:45.278','20251228070745_ispaid_variable_added',NULL,NULL,'2025-12-28 07:07:45.269',1),('40bd24cf-8087-49e3-9201-26f4c019ebf9','7da363f5b2415e824c4818b7fa77149ed3199f525d0a40ea5c365cd0103b8a36','2025-12-27 12:17:57.106','20251227121757_changed_weekday_to_date_in_availbeslotservice',NULL,NULL,'2025-12-27 12:17:57.081',1),('41b2552c-a2a7-4c32-af7e-485de02367b8','de78c38dccb054aa60425e6558c48bf6aa046a589e53c4248f11f6a1513540bb','2025-12-27 12:17:51.281','20251227121623_changed_weekday_to_date_in_availbeslotservice',NULL,NULL,'2025-12-27 12:17:51.255',1),('4dfda67b-54f9-4d5d-9142-56cbf42076ac','65f6d4314b7dbc9618db824c0206bf2729478f77accfefc79c1dfdff4a35c66b','2025-12-27 12:17:51.175','20251224154353_schedule_cancelled_added2',NULL,NULL,'2025-12-27 12:17:51.170',1),('506866e7-d4cf-4459-9ac8-e3c7f90dc2fc','947f3d96854df41d5ce622e3648820db6e7c25265356a1bf62b0fd2be87fc31b','2025-12-28 14:48:03.062','20251228144803_payment_model_checksess_null',NULL,NULL,'2025-12-28 14:48:03.055',1),('5c3501b1-dc57-41ac-92fa-ad009fc8cd5e','0265eef5e4404bf3a7e1d26e6a434b14bd97660ab54ded4a052cd1ce2f11af03','2025-12-27 12:17:51.094','20251221081236_doula_related_schema_edited',NULL,NULL,'2025-12-27 12:17:51.070',1),('7c812081-33d5-4ad4-b363-98812c467f7d','26f3c77ae666c74a8a4d541f176657f3c63f07214230049ff4e7fdb238fe7a26','2025-12-28 14:26:14.603','20251228142614_method_made_optional',NULL,NULL,'2025-12-28 14:26:14.594',1),('7f7c25ce-cd7a-4c5b-861b-931852849fd9','e6114b6880e8d7ecc05d65b60139ac5ee8a1b5c096818c28ed16d898d67ecc7d','2025-12-27 12:17:51.170','20251224154247_schedule_cancelled_added',NULL,NULL,'2025-12-27 12:17:51.167',1),('a0a452d5-617f-47f6-92b0-6715446d32ef','75b6a2eb8434cbec187afe53f431bf77707de045a8288d0535bafe39060b42d8','2025-12-27 12:17:51.069','20251219130445_init',NULL,NULL,'2025-12-27 12:17:50.558',1),('b16f51f7-b7c3-44d0-aad8-ae6990eb25c3','ce29976aebc86a75c33cc1e66989972e70452242055beb8561d25734baa166c5','2025-12-28 14:27:21.521','20251228142721_method_made_optional_2',NULL,NULL,'2025-12-28 14:27:21.513',1),('b7cc034a-5f58-4200-a4b4-a2b853790faf','7e169cd7256300494c301c89af449da4c4f4b1605c692c31716ffd1d1b020fbc','2025-12-27 12:17:51.167','20251223110310_offdays_marking_table_created',NULL,NULL,'2025-12-27 12:17:51.149',1),('bb552c5b-9a10-48a4-922e-6298f2aac4a1','b977f94eb2c0a0654e548458e358dddc458d6c6d20ca61659370d6d149ccf424','2025-12-27 12:17:51.186','20251224154536_schedule_cancelledat_added4',NULL,NULL,'2025-12-27 12:17:51.175',1),('e1f0ad4d-1583-46aa-870a-c7cd98d8a1ea','4eb4c4c61ffdbf06bb92894d0c2177661e78f92495a4af654ada2dad315eb079','2025-12-27 12:17:51.142','20251223035831_enquiry_form_fields_made_optional',NULL,NULL,'2025-12-27 12:17:51.132',1),('e75eb7e3-32c0-4fa3-94ac-585d7e08bc67','68d45156a40f0941adbcab2cd92b67b7882c9935137fc3400041b0d4072f8a88','2025-12-28 06:56:27.898','20251228065627_payment_data_table_added',NULL,NULL,'2025-12-28 06:56:27.869',1),('ee153576-fe03-48a4-b906-0cf55dd29715','6a3fcfa6b72a61a08ccf723a8aa939cb9ee6c5788a9bcefec1376746b61c9347','2025-12-27 12:17:51.149','20251223080015_added_meeting_id_on_enqury_form',NULL,NULL,'2025-12-27 12:17:51.142',1),('fe2ea4b5-8212-469c-82e9-64f49abedc56','53d00b0d9f4d34c8fbb05309f258511ccb6edb324e9ccd7147c9b483dd03f89b','2025-12-27 12:17:51.255','20251227120654_schema_updated_for_doula_service_avail',NULL,NULL,'2025-12-27 12:17:51.194',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_regions`
--

DROP TABLE IF EXISTS `_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_regions` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_regions_AB_unique` (`A`,`B`),
  KEY `_regions_B_index` (`B`),
  CONSTRAINT `_regions_A_fkey` FOREIGN KEY (`A`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_regions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Region` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_regions`
--

LOCK TABLES `_regions` WRITE;
/*!40000 ALTER TABLE `_regions` DISABLE KEYS */;
INSERT INTO `_regions` VALUES ('655fa3dd-7b27-4371-b9e8-9bf4343b7735','b6d5f121-9e09-436f-af18-39f3e5a824c7');
/*!40000 ALTER TABLE `_regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AdminProfile`
--

DROP TABLE IF EXISTS `AdminProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AdminProfile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AdminProfile_userId_key` (`userId`),
  CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AdminProfile`
--

LOCK TABLES `AdminProfile` WRITE;
/*!40000 ALTER TABLE `AdminProfile` DISABLE KEYS */;
INSERT INTO `AdminProfile` VALUES ('ffa0707c-0ed3-4a34-84f9-4761a3e556bd','88695218-6ab3-4f74-8c94-7428fb968115',NULL,'2025-12-27 12:26:11.658','2025-12-27 12:26:11.658');
/*!40000 ALTER TABLE `AdminProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AvailableSlotsForMeeting`
--

DROP TABLE IF EXISTS `AvailableSlotsForMeeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AvailableSlotsForMeeting` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekday` enum('SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `availabe` tinyint(1) NOT NULL DEFAULT '1',
  `ownerRole` enum('ADMIN','CLIENT','DOULA','ZONE_MANAGER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adminId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zoneManagerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AvailableSlotsForMeeting_doulaId_weekday_key` (`doulaId`,`weekday`),
  UNIQUE KEY `AvailableSlotsForMeeting_adminId_weekday_key` (`adminId`,`weekday`),
  UNIQUE KEY `AvailableSlotsForMeeting_zoneManagerId_weekday_key` (`zoneManagerId`,`weekday`),
  CONSTRAINT `AvailableSlotsForMeeting_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AvailableSlotsForMeeting_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AvailableSlotsForMeeting_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AvailableSlotsForMeeting`
--

LOCK TABLES `AvailableSlotsForMeeting` WRITE;
/*!40000 ALTER TABLE `AvailableSlotsForMeeting` DISABLE KEYS */;
INSERT INTO `AvailableSlotsForMeeting` VALUES ('1b196369-e574-4874-a491-d419f8f7357d','THURSDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:24.538','2025-12-27 13:34:24.538'),('35c85a08-941b-4213-b1c1-397e5a4b06c3','MONDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:14.755','2025-12-27 13:34:14.755'),('40eb8866-0878-46c2-82c6-2eea9e1d158e','SUNDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:07.152','2025-12-27 13:34:07.152'),('5a21c50f-fe06-4f68-ab3c-4054f96f00f0','SATURDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:31.067','2025-12-27 13:34:31.067'),('834c96e9-7ef5-40be-885a-be24699129d2','FRIDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:28.178','2025-12-27 13:34:28.178'),('b555c144-b4dc-490c-8ffd-f6efe16cc5bb','WEDNESDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:21.795','2025-12-27 13:34:21.795'),('dcf28977-ec8b-4d62-9169-b995e3354be0','TUESDAY',1,'ZONE_MANAGER',NULL,NULL,'f88c9e79-66b0-4d3b-968a-7df22bdaee50','2025-12-27 13:34:17.861','2025-12-27 13:34:17.861');
/*!40000 ALTER TABLE `AvailableSlotsForMeeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AvailableSlotsForService`
--

DROP TABLE IF EXISTS `AvailableSlotsForService`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AvailableSlotsForService` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `doulaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `availability` json NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `AvailableSlotsForService_doulaId_fkey` (`doulaId`),
  CONSTRAINT `AvailableSlotsForService_doulaId_fkey` FOREIGN KEY (`doulaId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AvailableSlotsForService`
--

LOCK TABLES `AvailableSlotsForService` WRITE;
/*!40000 ALTER TABLE `AvailableSlotsForService` DISABLE KEYS */;
INSERT INTO `AvailableSlotsForService` VALUES ('00bff618-e35c-4fb2-ba10-70e283cdafe2','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-02'),('04443990-e5d8-4f81-a0ae-3caaffd1890e','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-03'),('047cba2d-a037-4890-b632-f41e3f6fbb04','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-04'),('04d84fba-7e7a-4105-90c3-b6fb0259fd4a','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-08'),('0684073a-92fa-461f-8559-b090dc06b545','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-08'),('09008ab0-8a21-46cc-99e1-8fe03cfe3f17','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-14'),('09313d06-ace7-4d53-9b15-9a87f3f6ae1b','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-12'),('0950ea7d-0dbb-452b-b23b-02be7d861019','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-01'),('0ced74ac-27a6-4dbb-a222-8a7798da1a39','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-22'),('0dec589e-5283-4150-ba08-58cd722fc159','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-10'),('0dee7c1f-370b-425e-b6c6-08ac62ebdcb4','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-15'),('0fb11052-ce03-4762-a7b9-cb3ff427db22','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-19'),('0fd3a9b6-d5bb-4707-a275-218a5b1ca3a4','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-17'),('11949c3b-0cbb-4878-9719-223fec6dd68e','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-06'),('1477e3c8-8383-4a8d-b4ae-34de60e35d70','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-01'),('1766a2c0-6fe7-4ba8-91c8-9943671eb31b','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-05'),('1a9b6459-92d5-459e-ac73-f32a180c47cf','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-18'),('1c145494-82ae-4770-9ad3-fc60c58d7900','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-26'),('1d257510-cd45-45ad-982b-a7657ca016be','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-12'),('1e3037e8-31b7-4a1e-a578-25593d608eae','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-08'),('1fd682c9-4e2d-47f7-a26d-e7b9796b4b99','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-28'),('25192dff-eb78-49f3-a61e-2352d3347d9a','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-19'),('25ff2119-ef69-4ac1-9ed1-3cb91733ef94','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-26'),('270ff914-6c64-45cf-a3ae-be157d6422a8','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-03'),('27af6ed2-61ed-434d-ab2a-e3d494064ce5','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-30'),('289e708e-d3d3-450c-8059-36948f682f47','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-13'),('2cd23a58-be77-49b0-a900-b00e9f1553b5','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-07'),('2e628a8c-1bd5-4e1c-aa60-8fa4e37c0640','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-18'),('307a36cc-8776-4931-9985-8d795438a282','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-31'),('31687d56-92ff-4382-9dee-60d663e9ac54','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-17'),('34cb0ce1-6e89-441f-a41c-31ef75d843c4','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-05'),('35bf1586-0031-4363-bc7c-5cf6df6fd5a4','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-07'),('38a2284a-1cb7-40b8-aede-211cf5cc1be6','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-27'),('391bd503-336a-4867-a0bf-55645f77ec50','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-27'),('3a29bba2-3fd3-4453-83a0-3a27dc248ccd','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-30'),('3a929fce-1346-4c0c-ae7a-6a1ae08c45f7','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-26'),('3b0d89bf-27f9-4880-ae16-f2831c1199ec','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-30'),('3c795c01-c26c-4108-9e23-15a6e04002d8','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-21'),('3ce472ce-e89d-4121-b9cf-b4443d952423','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-09'),('3d711372-9f9d-41fc-8950-539fa097daec','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-27'),('3ff5b5cb-7f1d-4cd0-b8e6-8adf6371765e','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-23'),('419d1a67-d704-4e4a-9bf1-23905b7fec8d','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-06'),('42a7168f-8dfe-4718-aadb-311b0e559a3d','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-29'),('42fa55c3-1097-47a6-96e1-a02b1e3305c4','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-19'),('444617c6-d9ee-45b6-9680-69aa4d87f950','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-06'),('45b30f82-7602-4bb2-92be-ea18e3cdc06b','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-04'),('4696b358-0fcd-4c9a-8000-d41618099719','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-20'),('46a05267-b016-4081-a933-f68bf596a71f','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-10'),('4a7860a0-4b44-4596-ade4-a8b948827c1d','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-25'),('4bcf08c6-84fc-4b05-8306-3b26971b3d90','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-22'),('4d4f92d9-82a0-40d9-b0a1-b4acb490f422','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-03'),('50e2d359-981d-40c1-ba3b-290dc071401d','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-02'),('518bbda1-0cb5-4f14-8df2-1c8e23ec558f','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-01'),('53a3f310-d157-4f87-a930-122b6ee6e8eb','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-15'),('56c97c42-d953-4217-ba59-468a985835a4','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-25'),('58848909-284e-432e-9350-1e909e02bccf','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-07'),('59c5504f-70a0-4705-918f-eda90d7a0f3c','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-29'),('603d4fbe-ae82-42c0-aa42-564679605781','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-01'),('61b44f20-9852-4633-9a57-0c234dc2ae84','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-23'),('652b4e19-60fb-4f8e-8186-74ed351284f3','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-24'),('65ea29e9-6a11-4cf2-b138-b60c9105e87c','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-02'),('6891f2cf-b10d-4da8-84c3-4d8396542bce','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-09'),('68dbd189-6531-4ac5-928c-56e048cdd262','2025-12-27 12:32:06.287','2025-12-27 12:32:06.287','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-01'),('6dd965f6-b763-4161-b3a4-d0974005ea3e','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-17'),('6eafc388-1994-4103-a4cb-d1345d95e4a8','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-28'),('6f1f18c0-51ec-46cb-86bb-62e366f25e4c','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-15'),('71125454-7b33-466e-9901-0d30d227d36b','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-29'),('71fe0a09-3882-4b37-b3bd-ebccd6313ff7','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-05'),('7684e328-b9f9-44f7-a03f-9b05bce9d676','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-01'),('79f342c7-95dd-4c0c-91b8-9f57c5d1bedd','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-07'),('7b960495-85e9-44f5-bf14-20db1289a804','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-02'),('80304c92-0a9e-4444-a7b8-c3512374c6be','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-04'),('875c13ca-989d-4186-ae64-4d589df4b6c2','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-13'),('87670935-5a8c-4b5c-95ae-649b85d0f020','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-16'),('89855dae-21d2-45ea-9f98-615debcbf006','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-24'),('89c09ae3-26d2-46f5-b4a0-809796ef4120','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-09'),('8c249dd2-2cfb-4615-9e85-1183cae176af','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-22'),('93414505-479a-4a71-9df6-2f9d4e275f18','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-02'),('94664921-8a76-4757-9d45-e240fd42dbca','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-03'),('953c38b5-05a7-42e9-a7d6-1ed577d61c37','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-27'),('96129636-201a-414f-9900-2b412988eda7','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-04'),('962eccb7-e5b1-4b75-966d-8e5f75b47369','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-21'),('969e8ce0-6864-4808-a45a-ec7fee3e8f42','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-08'),('96a004ac-b504-470c-9227-da86d8702aa6','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-06'),('96ff1f57-f01f-4bb0-888d-7df2a9497998','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-20'),('9747a729-bf58-4fad-9be3-ee21f35f0935','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-21'),('a2eba299-2565-47b9-b35c-06badbe02894','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-16'),('a5ef968a-5091-46df-82e7-4ddcbdebfbf8','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-14'),('a6800467-5805-4f07-b221-0672a6edf260','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-06'),('a68c5ce7-b8df-4083-8dbc-231d5d725cd9','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-15'),('a860eddc-f826-4676-af33-3e8923f83e2a','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-24'),('aa242dd8-6309-4082-8252-839a94ab7450','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-09'),('ae17dfc1-d464-4dbc-bc80-db99761883cc','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-30'),('aeab0160-5b78-4acc-a59d-a5e1a2d0d55a','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-28'),('aeefae68-931a-433b-b7e9-a88132c4beed','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-20'),('b1829167-5b6a-4d4d-af51-2e5bfa4fdfa7','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-03'),('b683beba-b08e-4b2f-b9df-34cdf6d3c34d','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-25'),('b95ddb79-01ce-4911-93c2-aeab3c2b2d19','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-08'),('b9f16109-e2ab-49aa-b1ba-4d7c0f2f4aeb','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-09'),('bb71e9e2-7043-4816-8d8c-6c43fba9e6d2','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-18'),('bca383ff-ae24-40e9-bb16-ad78568e5c2e','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-28'),('bf9b1190-57cc-4d59-aabe-ff773ceb15e2','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-14'),('c037f259-99fb-4a50-8369-8ee36a92905a','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-13'),('c282758a-5955-4678-9b58-dab3fdc7bf89','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-07'),('c4b11fc4-b4c7-4481-af77-c14cc17e0995','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-11'),('c583260e-edcd-4562-b1a1-0a82ab59f91a','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-18'),('c5a8d3a2-fcd4-4530-b6ee-b3633e034f13','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-04'),('c665578f-9894-4e45-a741-41eda924be2f','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-11'),('c6c7e07e-3d80-4d8d-a660-4f11237a0d81','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-10'),('c7c2a12a-9db1-4799-a437-3952e69e0cdd','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-25'),('cab05736-b776-4220-8225-1b679e859f6b','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-29'),('cd6c30e0-59cb-45f0-b870-3a46a8b45c5f','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-26'),('ce4f9f9e-d206-4a53-80e4-afd03c59e570','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-24'),('cf1f65db-2efe-4318-8d0b-f6390cad76fb','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-17'),('d62a6752-40a0-4e2e-8441-e9f3eb27b2d9','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-11'),('d8218c42-904c-4b58-a9fb-e7a46b6bd610','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-04'),('db55de51-37d1-4c34-9c9c-986295477ff1','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-10'),('dc8de982-cbea-4460-86ca-a638bb83de41','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-08'),('dca2fab2-a314-4a79-8b59-22809aa1fff2','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-16'),('df2143d8-9631-4481-b029-46806941a3c8','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-11'),('dfe74bd1-881c-425a-ad6f-02bd5f9166cb','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-19'),('e06fca58-f624-413c-9b25-6de0a2057dfa','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-21'),('e0d89d02-b601-4a70-8252-0a5b73cf2bb5','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-03'),('e4562f8a-33e4-40f3-a525-aaa67b6f53f7','2025-12-27 19:58:58.813','2025-12-27 19:58:58.813','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-08-13'),('e47e102d-16c1-4641-a01d-12c702e9b658','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-05'),('e497bc05-0233-4531-bd96-e7d9b845398c','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-05'),('e78b1fd9-11f6-4b77-8203-c8dc9aba3e6d','2025-12-27 12:28:19.698','2025-12-27 12:28:19.698','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-06'),('e921b1e5-9148-4202-89cd-f5349f513ecb','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-09'),('ea7f2c32-76e8-4ca3-9107-3462ba16620c','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-14'),('ec300081-436c-4eea-b425-29d24e1f33ec','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-12'),('efcdeaed-1abb-44aa-8248-fdb2b49eb5f0','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-02'),('f0c2a8de-2575-49fc-8cba-6779274efb62','2025-12-27 12:32:19.008','2025-12-27 12:32:19.008','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-11-10'),('f20ac4c8-90a3-46b7-9c82-a90c9e554724','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-23'),('f26f46c8-bf69-4b2f-ad0b-42fe2370a528','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-07'),('f2dc3503-3bc0-4565-9300-4f7dfc031a3d','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-16'),('f42f7359-5e40-48ea-89b6-5030d9c54af5','2025-12-27 20:43:04.261','2025-12-27 20:43:04.261','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-09-12'),('f58b5eb6-420b-456b-a654-4bc470c00f5a','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-22'),('f7d140e4-8850-4336-b49e-80bcdd1e6959','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-23'),('f9ef484f-8d39-41a3-a46b-f8bd1605ddba','2025-12-28 15:15:08.873','2025-12-28 15:15:08.873','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-20'),('fe474643-96af-492b-8f44-08ff6b6a2e76','2025-12-30 09:28:29.777','2025-12-30 09:28:29.777','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-10-05');
/*!40000 ALTER TABLE `AvailableSlotsForService` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AvailableSlotsTimeForMeeting`
--

DROP TABLE IF EXISTS `AvailableSlotsTimeForMeeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AvailableSlotsTimeForMeeting` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `availabe` tinyint(1) NOT NULL DEFAULT '1',
  `isBooked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `dateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meetingsId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AvailableSlotsTimeForMeeting_dateId_fkey` (`dateId`),
  KEY `AvailableSlotsTimeForMeeting_meetingsId_fkey` (`meetingsId`),
  CONSTRAINT `AvailableSlotsTimeForMeeting_dateId_fkey` FOREIGN KEY (`dateId`) REFERENCES `AvailableSlotsForMeeting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AvailableSlotsTimeForMeeting_meetingsId_fkey` FOREIGN KEY (`meetingsId`) REFERENCES `Meetings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AvailableSlotsTimeForMeeting`
--

LOCK TABLES `AvailableSlotsTimeForMeeting` WRITE;
/*!40000 ALTER TABLE `AvailableSlotsTimeForMeeting` DISABLE KEYS */;
INSERT INTO `AvailableSlotsTimeForMeeting` VALUES ('0bed516a-7b96-400c-baee-c0a8bf6c98a8','03:30:00','11:30:00',1,0,'2025-12-27 13:34:24.541','2025-12-27 13:34:24.541','1b196369-e574-4874-a491-d419f8f7357d',NULL),('0fbea7c5-f803-438c-b9c0-97bbf9b89502','03:30:00','11:30:00',1,0,'2025-12-27 13:34:28.181','2025-12-27 13:34:28.181','834c96e9-7ef5-40be-885a-be24699129d2',NULL),('39c81912-d6fc-4037-82ae-81a96e0370d5','03:30:00','11:30:00',1,0,'2025-12-27 13:34:31.070','2025-12-27 13:34:31.070','5a21c50f-fe06-4f68-ab3c-4054f96f00f0',NULL),('3faea58e-e319-459a-b168-3b17adc938e9','03:30:00','11:30:00',1,0,'2025-12-27 13:34:14.758','2025-12-27 13:34:14.758','35c85a08-941b-4213-b1c1-397e5a4b06c3',NULL),('58209869-7d74-4ca1-beac-47a194faf263','03:30:00','11:30:00',1,0,'2025-12-27 13:34:07.156','2025-12-27 13:34:07.156','40eb8866-0878-46c2-82c6-2eea9e1d158e',NULL),('9ceebb4e-bd36-4901-acdd-f7e8f47488e2','03:30:00','11:30:00',1,0,'2025-12-27 13:34:21.797','2025-12-27 13:34:21.797','b555c144-b4dc-490c-8ffd-f6efe16cc5bb',NULL),('d202f8d9-c063-487b-ab95-1053998d413e','03:30:00','11:30:00',1,0,'2025-12-27 13:34:17.863','2025-12-27 13:34:17.863','dcf28977-ec8b-4d62-9169-b995e3354be0',NULL);
/*!40000 ALTER TABLE `AvailableSlotsTimeForMeeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Certificates`
--

DROP TABLE IF EXISTS `Certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Certificates` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuedBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unknown',
  `year` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0000',
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Certificates_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `Certificates_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Certificates`
--

LOCK TABLES `Certificates` WRITE;
/*!40000 ALTER TABLE `Certificates` DISABLE KEYS */;
INSERT INTO `Certificates` VALUES ('1d87d45c-9730-423e-8fff-0b7ba21d95db','Advanceda Birth Support','WHO','2022','655fa3dd-7b27-4371-b9e8-9bf4343b7735'),('d9907ca6-01fd-47e3-af61-65d555028982','Childbirth Educator','ABC Institute','2021','655fa3dd-7b27-4371-b9e8-9bf4343b7735');
/*!40000 ALTER TABLE `Certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ClientProfile`
--

DROP TABLE IF EXISTS `ClientProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ClientProfile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `region` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ClientProfile_userId_key` (`userId`),
  CONSTRAINT `ClientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ClientProfile`
--

LOCK TABLES `ClientProfile` WRITE;
/*!40000 ALTER TABLE `ClientProfile` DISABLE KEYS */;
INSERT INTO `ClientProfile` VALUES ('80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','0ba64e27-c4d0-406f-902a-7caa7a143bde',1,NULL,'45 MG Road, Bengaluru, Karnataka',NULL,'2025-12-27 20:00:40.994','2025-12-27 20:34:54.314'),('a99f9a96-48bc-4b66-803b-c46f4275c44c','19b959cd-d6df-496c-ac6e-e97be6183465',0,NULL,NULL,NULL,'2025-12-27 20:38:12.228','2025-12-27 20:38:12.228'),('b05d6b0b-71cc-4443-929f-e3055ea6d4ea','3675b870-889c-4033-bc5c-af469270436b',1,NULL,'45 MG Road, Bengaluru, Karnataka',NULL,'2025-12-30 09:30:46.468','2025-12-30 09:30:46.473');
/*!40000 ALTER TABLE `ClientProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DeviceToken`
--

DROP TABLE IF EXISTS `DeviceToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DeviceToken` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DeviceToken`
--

LOCK TABLES `DeviceToken` WRITE;
/*!40000 ALTER TABLE `DeviceToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `DeviceToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoulaGallery`
--

DROP TABLE IF EXISTS `DoulaGallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoulaGallery` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `DoulaGallery_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `DoulaGallery_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoulaGallery`
--

LOCK TABLES `DoulaGallery` WRITE;
/*!40000 ALTER TABLE `DoulaGallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `DoulaGallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoulaOffDays`
--

DROP TABLE IF EXISTS `DoulaOffDays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoulaOffDays` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `offtime` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DoulaOffDays_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `DoulaOffDays_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoulaOffDays`
--

LOCK TABLES `DoulaOffDays` WRITE;
/*!40000 ALTER TABLE `DoulaOffDays` DISABLE KEYS */;
INSERT INTO `DoulaOffDays` VALUES ('1937709b-1a17-4c95-b513-1a7077e8f592','2025-11-02','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-12-27 12:48:17.748','2025-12-27 12:48:17.748','655fa3dd-7b27-4371-b9e8-9bf4343b7735'),('3bcd438a-0f02-4078-8780-2e2f20f04dba','2025-11-03','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-12-27 12:48:17.748','2025-12-27 12:48:17.748','655fa3dd-7b27-4371-b9e8-9bf4343b7735'),('89822fb6-a968-48e9-bd88-ccb8335f7169','2025-11-04','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-12-27 12:48:17.748','2025-12-27 12:48:17.748','655fa3dd-7b27-4371-b9e8-9bf4343b7735'),('c6870238-c20f-4867-8a7d-b909d95c2ba0','2025-11-05','{\"NIGHT\": true, \"FULLDAY\": true, \"MORNING\": true}','2025-12-27 12:48:17.748','2025-12-27 12:48:17.748','655fa3dd-7b27-4371-b9e8-9bf4343b7735');
/*!40000 ALTER TABLE `DoulaOffDays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoulaProfile`
--

DROP TABLE IF EXISTS `DoulaProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoulaProfile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `regionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `achievements` text COLLATE utf8mb4_unicode_ci,
  `qualification` text COLLATE utf8mb4_unicode_ci,
  `yoe` int DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `profile_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialities` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DoulaProfile_userId_key` (`userId`),
  CONSTRAINT `DoulaProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoulaProfile`
--

LOCK TABLES `DoulaProfile` WRITE;
/*!40000 ALTER TABLE `DoulaProfile` DISABLE KEYS */;
INSERT INTO `DoulaProfile` VALUES ('655fa3dd-7b27-4371-b9e8-9bf4343b7735','a0f185ed-8c28-4316-ac07-dbdc7dce8f38',NULL,'Certified birth doula with 6+ years of experience','Supported 300+ successful births','Certified Birth Doula (CBD)',6,'[\"English\", \"Hindi\", \"Tamil\"]','2025-12-27 12:27:47.513','2025-12-28 18:33:58.708',NULL,'[\"Prenatal Care\", \"Postpartum Support\"]');
/*!40000 ALTER TABLE `DoulaProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EnquiryForm`
--

DROP TABLE IF EXISTS `EnquiryForm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EnquiryForm` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `additionalNotes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meetingsDate` datetime(3) NOT NULL,
  `meetingsTimeSlots` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seviceStartDate` datetime(3) DEFAULT NULL,
  `serviceEndDate` datetime(3) DEFAULT NULL,
  `VisitFrequency` int DEFAULT NULL,
  `serviceTimeSlots` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serviceName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `regionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slotId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meetingsId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EnquiryForm_slotId_fkey` (`slotId`),
  KEY `EnquiryForm_serviceId_fkey` (`serviceId`),
  KEY `EnquiryForm_clientId_fkey` (`clientId`),
  KEY `EnquiryForm_regionId_fkey` (`regionId`),
  CONSTRAINT `EnquiryForm_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EnquiryForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EnquiryForm_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EnquiryForm_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AvailableSlotsForMeeting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EnquiryForm`
--

LOCK TABLES `EnquiryForm` WRITE;
/*!40000 ALTER TABLE `EnquiryForm` DISABLE KEYS */;
/*!40000 ALTER TABLE `EnquiryForm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `IntakeForm`
--

DROP TABLE IF EXISTS `IntakeForm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `IntakeForm` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `regionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `servicePricingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IntakeForm_servicePricingId_fkey` (`servicePricingId`),
  KEY `IntakeForm_clientId_fkey` (`clientId`),
  KEY `IntakeForm_regionId_fkey` (`regionId`),
  KEY `IntakeForm_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `IntakeForm_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `IntakeForm_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `IntakeForm_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `IntakeForm_servicePricingId_fkey` FOREIGN KEY (`servicePricingId`) REFERENCES `ServicePricing` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IntakeForm`
--

LOCK TABLES `IntakeForm` WRITE;
/*!40000 ALTER TABLE `IntakeForm` DISABLE KEYS */;
INSERT INTO `IntakeForm` VALUES ('0e4fc23d-f0e8-4c4c-8276-265ac10e53a9','2025-09-01 00:00:00.000','2025-09-10 00:00:00.000',NULL,'Jane Doe','client1@gmail.com','+911234517880','Street 12, Kochi, Kerala','b6d5f121-9e09-436f-af18-39f3e5a824c7','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.441','2025-12-27 20:43:25.441'),('2e9a3cd3-860a-4ae5-8db3-f20a08e8e46d','2025-09-15 00:00:00.000','2025-09-25 00:00:00.000',NULL,'Jane Doe','client1@gmail.com','+911234517880','Street 12, Kochi, Kerala','b6d5f121-9e09-436f-af18-39f3e5a824c7','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.452','2025-12-27 20:48:55.452'),('34e78ff6-8bcc-43fc-a268-cf5a98f70dba','2025-08-10 00:00:00.000','2025-08-11 00:00:00.000',NULL,'Suni','suni@test.com','9836660888','45 MG Road, Bengaluru, Karnataka','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.328','2025-12-27 20:34:54.328'),('e99883df-2341-4429-a273-e9d6c4f20f8a','2025-10-02 00:00:00.000','2025-10-10 00:00:00.000',NULL,'hari','hari@testclient.com','6896356838','45 MG Road, Bengaluru, Karnataka','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.519','2025-12-30 09:30:46.519'),('f336507b-3197-4c85-a42f-a2569ed70e7e','2025-08-25 00:00:00.000','2025-08-28 00:00:00.000',NULL,'Suni','suni@test.com','9836660888','45 MG Road, Bengaluru, Karnataka','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:29:48.330','2025-12-27 20:29:48.330'),('f4f5c23c-5781-459d-8801-d0a7d5ee0673','2025-08-03 00:00:00.000','2025-08-04 00:00:00.000',NULL,'Jane Doe','client1@gmail.com','+911234517880','Street 12, Kochi, Kerala','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.369','2025-12-27 20:40:45.369');
/*!40000 ALTER TABLE `IntakeForm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Meetings`
--

DROP TABLE IF EXISTS `Meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Meetings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('SCHEDULED','COMPLETED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `date` datetime(3) NOT NULL,
  `serviceName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookedById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `rescheduledAt` datetime(3) DEFAULT NULL,
  `availableSlotsForMeetingId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zoneManagerProfileId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adminProfileId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Meetings_bookedById_fkey` (`bookedById`),
  KEY `Meetings_availableSlotsForMeetingId_fkey` (`availableSlotsForMeetingId`),
  KEY `Meetings_zoneManagerProfileId_fkey` (`zoneManagerProfileId`),
  KEY `Meetings_doulaProfileId_fkey` (`doulaProfileId`),
  KEY `Meetings_adminProfileId_fkey` (`adminProfileId`),
  KEY `Meetings_serviceId_fkey` (`serviceId`),
  CONSTRAINT `Meetings_adminProfileId_fkey` FOREIGN KEY (`adminProfileId`) REFERENCES `AdminProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meetings_availableSlotsForMeetingId_fkey` FOREIGN KEY (`availableSlotsForMeetingId`) REFERENCES `AvailableSlotsForMeeting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meetings_bookedById_fkey` FOREIGN KEY (`bookedById`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meetings_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meetings_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Meetings_zoneManagerProfileId_fkey` FOREIGN KEY (`zoneManagerProfileId`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Meetings`
--

LOCK TABLES `Meetings` WRITE;
/*!40000 ALTER TABLE `Meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `Meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notes`
--

DROP TABLE IF EXISTS `Notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zoneManagerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adminId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Notes_zoneManagerId_fkey` (`zoneManagerId`),
  KEY `Notes_adminId_fkey` (`adminId`),
  CONSTRAINT `Notes_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notes_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notes`
--

LOCK TABLES `Notes` WRITE;
/*!40000 ALTER TABLE `Notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `scheduledAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `readAt` datetime(3) DEFAULT NULL,
  `channels` json DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Notification_userId_fkey` (`userId`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OffDays`
--

DROP TABLE IF EXISTS `OffDays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OffDays` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `zoneManagerProfileId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `OffDays_zoneManagerProfileId_fkey` (`zoneManagerProfileId`),
  KEY `OffDays_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `OffDays_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OffDays_zoneManagerProfileId_fkey` FOREIGN KEY (`zoneManagerProfileId`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OffDays`
--

LOCK TABLES `OffDays` WRITE;
/*!40000 ALTER TABLE `OffDays` DISABLE KEYS */;
/*!40000 ALTER TABLE `OffDays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` enum('UPI','CARD','NET_BANKING','WALLET','CASH') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` enum('RAZORPAY','STRIPE','PAYPAL','MANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STRIPE',
  `receipt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failureReason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `refundedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `amountRefunded` decimal(10,2) NOT NULL DEFAULT '0.00',
  `checkoutSessionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentIntentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `providerOrderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `providerPaymentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_checkoutSessionId_key` (`checkoutSessionId`),
  KEY `Payment_bookingId_idx` (`bookingId`),
  KEY `Payment_clientId_idx` (`clientId`),
  KEY `Payment_status_idx` (`status`),
  CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceBooking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Payment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
INSERT INTO `Payment` VALUES ('3b4a0b70-8ad6-4832-9c1b-bf9b19f4aa5e','bad93972-4e88-49c0-b7d2-54d42a149019','a99f9a96-48bc-4b66-803b-c46f4275c44c',100.00,'INR','PENDING',NULL,'STRIPE',NULL,NULL,'{\"clientId\": \"a99f9a96-48bc-4b66-803b-c46f4275c44c\", \"visitDates\": [\"2025-09-30T00:00:00.000Z\", \"2025-10-01T00:00:00.000Z\", \"2025-10-02T00:00:00.000Z\", \"2025-10-03T00:00:00.000Z\", \"2025-10-04T00:00:00.000Z\", \"2025-10-05T00:00:00.000Z\", \"2025-10-06T00:00:00.000Z\", \"2025-10-07T00:00:00.000Z\", \"2025-10-08T00:00:00.000Z\"], \"doulaProfileId\": \"655fa3dd-7b27-4371-b9e8-9bf4343b7735\", \"servicePricingId\": \"f00e2a99-b097-4c3c-9783-75d5d09ba497\", \"serviceTimeShift\": \"FULLDAY\"}',NULL,NULL,'2025-12-28 15:15:37.927','2025-12-28 15:15:37.927',0.00,NULL,NULL,NULL,NULL),('43e619a2-4624-49ef-893a-d2007304e129','beb0ea39-9802-48e0-8d19-d234ee1824e8','a99f9a96-48bc-4b66-803b-c46f4275c44c',100.00,'INR','PENDING',NULL,'STRIPE',NULL,NULL,'{\"clientId\": \"a99f9a96-48bc-4b66-803b-c46f4275c44c\", \"visitDates\": [\"2025-09-30T00:00:00.000Z\", \"2025-10-01T00:00:00.000Z\", \"2025-10-02T00:00:00.000Z\", \"2025-10-03T00:00:00.000Z\", \"2025-10-04T00:00:00.000Z\", \"2025-10-05T00:00:00.000Z\", \"2025-10-06T00:00:00.000Z\", \"2025-10-07T00:00:00.000Z\", \"2025-10-08T00:00:00.000Z\"], \"doulaProfileId\": \"655fa3dd-7b27-4371-b9e8-9bf4343b7735\", \"servicePricingId\": \"f00e2a99-b097-4c3c-9783-75d5d09ba497\", \"serviceTimeShift\": \"FULLDAY\"}',NULL,NULL,'2025-12-28 15:17:15.612','2025-12-28 15:17:16.540',0.00,'cs_test_a1Y4kKIsBCUT9pzeCSw4aqCwr26JHHcYYlzoTRmCDJP03GSWjrsH37unVC',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Region`
--

DROP TABLE IF EXISTS `Region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Region` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `regionName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `longitude` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `zoneManagerId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Region_pincode_key` (`pincode`),
  KEY `Region_zoneManagerId_fkey` (`zoneManagerId`),
  CONSTRAINT `Region_zoneManagerId_fkey` FOREIGN KEY (`zoneManagerId`) REFERENCES `ZoneManagerProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Region`
--

LOCK TABLES `Region` WRITE;
/*!40000 ALTER TABLE `Region` DISABLE KEYS */;
INSERT INTO `Region` VALUES ('b6d5f121-9e09-436f-af18-39f3e5a824c7','Texas','000348','Texas','Texas','India','19.1136','72.8697',1,'2025-12-27 12:26:28.299','2025-12-27 12:27:03.962','f88c9e79-66b0-4d3b-968a-7df22bdaee50');
/*!40000 ALTER TABLE `Region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schedules`
--

DROP TABLE IF EXISTS `Schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedules` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `bookingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `timeshift` enum('MORNING','NIGHT','FULLDAY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FULLDAY',
  PRIMARY KEY (`id`),
  KEY `Schedules_doulaProfileId_fkey` (`doulaProfileId`),
  KEY `Schedules_serviceId_fkey` (`serviceId`),
  KEY `Schedules_clientId_fkey` (`clientId`),
  KEY `Schedules_bookingId_fkey` (`bookingId`),
  CONSTRAINT `Schedules_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `ServiceBooking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Schedules_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Schedules_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Schedules_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schedules`
--

LOCK TABLES `Schedules` WRITE;
/*!40000 ALTER TABLE `Schedules` DISABLE KEYS */;
INSERT INTO `Schedules` VALUES ('04ab0fc6-2a8f-4bca-939e-ee4bd26416bf','2025-09-11','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('0dd8c648-ff57-4585-bf2c-0d96e29bf059','2025-09-23','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('189e3279-f983-4dbc-ae21-5186d2b5f611','2025-10-02','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('2220a8e5-aa53-43c0-91a9-8cc2d62fd858','2025-10-05','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('25d8753c-05ab-4767-b06f-c820b9355055','2025-08-08','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('268b6513-7e16-4580-b172-e2e881ddd48c','2025-09-01','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('2e7177b5-0a2c-4a57-b922-ec7f81e69ab2','2025-09-15','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('3515c3d7-7a69-4b60-94b9-fcfffa040b51','2025-08-25','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:29:48.337','2025-12-27 20:29:48.337','a72b4264-d85d-48c3-adc0-8b8971781abe',NULL,'FULLDAY'),('410ce4c6-cc31-4ee0-9b19-74cdf4f3b737','2025-09-07','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('4f2cbd6a-bfa7-46a8-a3ef-c51b06a39940','2025-10-09','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('59b01675-c687-47ca-98fd-e07e4ae425f4','2025-08-31','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('61bb8bec-3ec8-49b9-ac22-5236e6618743','2025-09-02','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('6542f6cb-f145-4cef-9cd4-9055ace878de','2025-09-21','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('6551fc3d-a4da-43e7-83e7-f7a20754fa91','2025-09-08','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('65ed61a9-06af-4fae-a0aa-7039ff524c11','2025-08-13','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('6b2de68f-f714-4640-af2c-e9bcf0d50b21','2025-10-08','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('6dc0b8b0-748e-4a58-9d7f-173e72f9677c','2025-09-25','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('76f1d396-c839-49c2-8232-8504545e6f87','2025-08-11','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('7c417b6b-462c-4033-871d-157f408dd094','2025-10-06','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('7ccae847-dcae-4afd-a110-4c8150616fa8','2025-08-10','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('7d4b63e7-3d7f-45ff-ab89-179b21f8f9f5','2025-08-03','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.372','2025-12-27 20:40:45.372','2d1b17ce-d28f-449c-8cd2-d2acc8f283ea',NULL,'FULLDAY'),('81393acf-9b58-4e03-a1c4-1db33175339e','2025-09-19','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('8398f428-a415-4c2c-aba9-d6fe009278ea','2025-10-04','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('8af93543-8814-43a4-a744-f7bfe94387ea','2025-09-10','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('8b155b20-8520-4a9a-880d-db67e083572b','2025-08-04','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.372','2025-12-27 20:40:45.372','2d1b17ce-d28f-449c-8cd2-d2acc8f283ea',NULL,'FULLDAY'),('8b2d6dee-4ee3-4814-9ab7-23b97963e9a1','2025-08-30','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('a7b50d5d-29dd-4dd4-9445-27c6c44693fd','2025-09-30','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('ad25d290-9672-4833-acea-ca7c8acbe8a5','2025-10-10','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('ad8a5751-f02e-4e5f-9879-a6defdc5a259','2025-10-11','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('ae0f58b3-e0d1-45fd-9c47-82ab5e46ac58','2025-09-05','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('bd7e0448-9e42-45bf-8f65-abdfdc6df744','2025-10-12','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('c01e4cda-a277-443b-8b80-e04910e87bdc','2025-09-09','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('c177bb8e-3277-4d79-82a9-0d2ae685679a','2025-10-03','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('c24c654a-46a9-46b3-adf0-0611b2cc7eb9','2025-09-06','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('c5118685-9849-4696-b57c-cf782e411c8b','2025-08-27','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:29:48.337','2025-12-27 20:29:48.337','a72b4264-d85d-48c3-adc0-8b8971781abe',NULL,'FULLDAY'),('c7673871-e50a-402c-b908-4b7d0923c94a','2025-09-03','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('cac25cb9-34fb-4776-b1f8-5bef63f38960','2025-08-02','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.372','2025-12-27 20:40:45.372','2d1b17ce-d28f-449c-8cd2-d2acc8f283ea',NULL,'FULLDAY'),('cf4b3d3b-d286-4204-a02c-dd6b738c92fa','2025-08-12','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('dc083efe-b15a-4b29-8ffe-f5536e5c3be9','2025-08-09','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.331','2025-12-27 20:34:54.331','47dbc869-2f03-45ca-bb22-6eff3eb27d8b',NULL,'FULLDAY'),('dde2704f-940e-4544-8a97-1e06a49564fa','2025-09-12','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('e0fe8c31-20a9-43f5-a5af-09fa816c32ec','2025-10-07','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('e9d75eb5-8c20-449f-a349-6fa38778458c','2025-09-04','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.445','2025-12-27 20:43:25.445','907609a4-b907-49ca-a419-b550872769f0',NULL,'NIGHT'),('f1e83eb3-ecff-48b3-892b-ae89c36ec39f','2025-09-17','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.455','2025-12-27 20:48:55.455','550c16be-4a62-42d9-8f75-7bc00e750415',NULL,'NIGHT'),('f593044a-5c1b-4389-b5f2-a880aec0db7b','2025-10-01','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.527','2025-12-30 09:30:46.527','2315472b-9971-4825-b0a5-5878b82be291',NULL,'FULLDAY'),('ff14bde3-5bab-4520-944e-addc312af92b','2025-08-05','PENDING','655fa3dd-7b27-4371-b9e8-9bf4343b7735','f00e2a99-b097-4c3c-9783-75d5d09ba497','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.372','2025-12-27 20:40:45.372','2d1b17ce-d28f-449c-8cd2-d2acc8f283ea',NULL,'FULLDAY');
/*!40000 ALTER TABLE `Schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Service`
--

DROP TABLE IF EXISTS `Service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Service` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Service`
--

LOCK TABLES `Service` WRITE;
/*!40000 ALTER TABLE `Service` DISABLE KEYS */;
INSERT INTO `Service` VALUES ('26c11b42-417c-4e37-8543-4ef609646718','Birth Doula','A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.','2025-12-27 19:54:43.687','2025-12-27 19:54:43.687'),('41bb32e6-ae80-4a9c-8cd9-855f98ced1b2','Post Partum Doula','A Post Partum  Doula is a trained professional who provides emotional, physical, and informational support to an expectant mother throughout pregnancy, labor, and childbirth. Their role is to ensure that the mother feels confident, informed, and comforted during one of life’s most important moments. Birth doulas offer continuous support during labor, help with breathing techniques, positions, and pain-relief methods, and advocate for the mother’s preferences with the healthcare team. They also guide partners on how to participate effectively.','2025-12-27 19:54:37.168','2025-12-27 19:54:37.168');
/*!40000 ALTER TABLE `Service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceBooking`
--

DROP TABLE IF EXISTS `ServiceBooking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceBooking` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `paymentDetails` json DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','CANCELED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `regionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `servicePricingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `timeshift` enum('MORNING','NIGHT','FULLDAY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FULLDAY',
  `isPaid` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ServiceBooking_doulaProfileId_fkey` (`doulaProfileId`),
  KEY `ServiceBooking_servicePricingId_fkey` (`servicePricingId`),
  KEY `ServiceBooking_clientId_fkey` (`clientId`),
  KEY `ServiceBooking_regionId_fkey` (`regionId`),
  CONSTRAINT `ServiceBooking_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ServiceBooking_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ServiceBooking_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ServiceBooking_servicePricingId_fkey` FOREIGN KEY (`servicePricingId`) REFERENCES `ServicePricing` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceBooking`
--

LOCK TABLES `ServiceBooking` WRITE;
/*!40000 ALTER TABLE `ServiceBooking` DISABLE KEYS */;
INSERT INTO `ServiceBooking` VALUES ('2315472b-9971-4825-b0a5-5878b82be291','2025-10-02 00:00:00.000','2025-10-10 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','b05d6b0b-71cc-4443-929f-e3055ea6d4ea','2025-12-30 09:30:46.523','2025-12-30 09:30:46.523',NULL,'FULLDAY',1),('2d1b17ce-d28f-449c-8cd2-d2acc8f283ea','2025-08-03 00:00:00.000','2025-08-04 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:40:45.370','2025-12-27 20:40:45.370',NULL,'FULLDAY',0),('47dbc869-2f03-45ca-bb22-6eff3eb27d8b','2025-08-10 00:00:00.000','2025-08-11 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:34:54.330','2025-12-27 20:34:54.330',NULL,'FULLDAY',0),('550c16be-4a62-42d9-8f75-7bc00e750415','2025-09-15 00:00:00.000','2025-09-25 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:48:55.454','2025-12-27 20:48:55.454',NULL,'FULLDAY',0),('907609a4-b907-49ca-a419-b550872769f0','2025-09-01 00:00:00.000','2025-09-10 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','a7e7ebcc-8855-4c08-b6c1-76132ba676a6','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-27 20:43:25.443','2025-12-27 20:43:25.443',NULL,'FULLDAY',0),('a72b4264-d85d-48c3-adc0-8b8971781abe','2025-08-25 00:00:00.000','2025-08-28 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','80bbacc1-8c84-4a88-b0fa-f1908b6e82f7','2025-12-27 20:29:48.333','2025-12-27 20:29:48.333',NULL,'FULLDAY',0),('bad93972-4e88-49c0-b7d2-54d42a149019','2025-10-02 00:00:00.000','2025-10-06 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-28 15:15:37.922','2025-12-28 15:15:37.922',NULL,'FULLDAY',0),('beb0ea39-9802-48e0-8d19-d234ee1824e8','2025-10-02 00:00:00.000','2025-10-06 00:00:00.000',NULL,'ACTIVE','b6d5f121-9e09-436f-af18-39f3e5a824c7','f00e2a99-b097-4c3c-9783-75d5d09ba497','655fa3dd-7b27-4371-b9e8-9bf4343b7735','a99f9a96-48bc-4b66-803b-c46f4275c44c','2025-12-28 15:17:15.610','2025-12-28 15:17:15.610',NULL,'FULLDAY',0);
/*!40000 ALTER TABLE `ServiceBooking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServicePricing`
--

DROP TABLE IF EXISTS `ServicePricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServicePricing` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ServicePricing_serviceId_fkey` (`serviceId`),
  KEY `ServicePricing_doulaProfileId_fkey` (`doulaProfileId`),
  CONSTRAINT `ServicePricing_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ServicePricing_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServicePricing`
--

LOCK TABLES `ServicePricing` WRITE;
/*!40000 ALTER TABLE `ServicePricing` DISABLE KEYS */;
INSERT INTO `ServicePricing` VALUES ('a7e7ebcc-8855-4c08-b6c1-76132ba676a6','41bb32e6-ae80-4a9c-8cd9-855f98ced1b2','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"night\": 10, \"fullday\": 10, \"morning\": 1000}','2025-12-27 19:56:49.739','2025-12-28 18:33:58.708'),('f00e2a99-b097-4c3c-9783-75d5d09ba497','26c11b42-417c-4e37-8543-4ef609646718','655fa3dd-7b27-4371-b9e8-9bf4343b7735','{\"night\": 1, \"fullday\": 100, \"morning\": 1}','2025-12-27 19:57:29.720','2025-12-27 19:57:29.720');
/*!40000 ALTER TABLE `ServicePricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Testimonials`
--

DROP TABLE IF EXISTS `Testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Testimonials` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doulaProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratings` int NOT NULL,
  `reviews` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Testimonials_doulaProfileId_fkey` (`doulaProfileId`),
  KEY `Testimonials_serviceId_fkey` (`serviceId`),
  KEY `Testimonials_clientId_fkey` (`clientId`),
  CONSTRAINT `Testimonials_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `ClientProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Testimonials_doulaProfileId_fkey` FOREIGN KEY (`doulaProfileId`) REFERENCES `DoulaProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Testimonials_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServicePricing` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Testimonials`
--

LOCK TABLES `Testimonials` WRITE;
/*!40000 ALTER TABLE `Testimonials` DISABLE KEYS */;
/*!40000 ALTER TABLE `Testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otpExpiresAt` datetime(3) DEFAULT NULL,
  `role` enum('ADMIN','CLIENT','DOULA','ZONE_MANAGER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('0ba64e27-c4d0-406f-902a-7caa7a143bde','Suni','suni@test.com','9836660888',NULL,NULL,'CLIENT',1,'2025-12-27 20:00:40.994','2025-12-27 20:00:40.994'),('19b959cd-d6df-496c-ac6e-e97be6183465','Jane Doe','client1@gmail.com','+911234517880',NULL,NULL,'CLIENT',1,'2025-12-27 20:38:12.228','2025-12-28 15:11:35.691'),('3675b870-889c-4033-bc5c-af469270436b','hari','hari@testclient.com','6896356838',NULL,NULL,'CLIENT',1,'2025-12-30 09:30:46.468','2025-12-30 09:30:46.468'),('55f12bf3-317f-4157-8aa0-0d979e3e8fa7','Adam Smith','zonemanager@test.com','+918843488338',NULL,NULL,'ZONE_MANAGER',1,'2025-12-27 12:27:03.962','2025-12-30 09:30:32.269'),('88695218-6ab3-4f74-8c94-7428fb968115','Devanand ','admin@test.com','7894789364',NULL,NULL,'ADMIN',1,'2025-12-27 12:26:11.658','2025-12-27 19:54:17.961'),('a0f185ed-8c28-4316-ac07-dbdc7dce8f38','Anita Sharma','doula@test.com','+919876543342',NULL,NULL,'DOULA',1,'2025-12-27 12:27:47.513','2025-12-30 09:28:09.282');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ZoneManagerProfile`
--

DROP TABLE IF EXISTS `ZoneManagerProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ZoneManagerProfile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ZoneManagerProfile_userId_key` (`userId`),
  CONSTRAINT `ZoneManagerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ZoneManagerProfile`
--

LOCK TABLES `ZoneManagerProfile` WRITE;
/*!40000 ALTER TABLE `ZoneManagerProfile` DISABLE KEYS */;
INSERT INTO `ZoneManagerProfile` VALUES ('f88c9e79-66b0-4d3b-968a-7df22bdaee50','55f12bf3-317f-4157-8aa0-0d979e3e8fa7','uploads/manager/1766838423953-160339682.png','2025-12-27 12:27:03.962','2025-12-27 12:27:03.962');
/*!40000 ALTER TABLE `ZoneManagerProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'douladb'
--

--
-- Dumping routines for database 'douladb'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 8.4.6.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-30 15:10:35
