// // prisma/seed.ts
// import {
//     PrismaClient,
//     Role,
//     BookingStatus,
//     MeetingStatus,
//     WeekDays,
// } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//     console.log("🌱 Seeding DB…");

//     /* =========================
//        USERS
//     ========================= */

//     const adminUser = await prisma.user.upsert({
//         where: { email: "admin@test.com" },
//         update: {},
//         create: {
//             name: "Admin User",
//             email: "admin@test.com",
//             phone: "9000000001",
//             role: Role.ADMIN,
//             adminProfile: { create: { profile_image: "admin.jpg" } },
//         },
//         include: { adminProfile: true },
//     });

//     const zoneUser = await prisma.user.upsert({
//         where: { email: "zonemanager@test.com" },
//         update: {},
//         create: {
//             name: "Zone Manager",
//             email: "zonemanager@test.com",
//             phone: "9000000002",
//             role: Role.ZONE_MANAGER,
//             zonemanagerprofile: { create: { profile_image: "zm.jpg" } },
//         },
//         include: { zonemanagerprofile: true },
//     });

//     const clientUser = await prisma.user.upsert({
//         where: { email: "client@test.com" },
//         update: {},
//         create: {
//             name: "Client User",
//             email: "client@test.com",
//             phone: "9000000004",
//             role: Role.CLIENT,
//             clientProfile: {
//                 create: {
//                     address: "123 Client Street",
//                     profile_image: "client.jpg",
//                 },
//             },
//         },
//         include: { clientProfile: true },
//     });

//     const client = clientUser.clientProfile!;
//     const zoneManager = zoneUser.zonemanagerprofile!;

//     /* =========================
//        DOULAS
//     ========================= */

//     const doulaUser = await prisma.user.upsert({
//         where: { email: "doula@test.com" },
//         update: {},
//         create: {
//             name: "Senior Doula",
//             email: "doula@test.com",
//             phone: "9000000005",
//             role: Role.DOULA,
//             doulaProfile: {
//                 create: {
//                     description: "Experienced doula",
//                     qualification: "Certified",
//                     yoe: 6,
//                 },
//             },
//         },
//         include: { doulaProfile: true },
//     });

//     const doula = doulaUser.doulaProfile!;

//     /* =========================
//        REGION
//     ========================= */

//     const region = await prisma.region.upsert({
//         where: { pincode: "682001" },
//         update: {},
//         create: {
//             regionName: "Kochi",
//             pincode: "682001",
//             district: "Ernakulam",
//             state: "Kerala",
//             country: "India",
//             latitude: "9.93",
//             longitude: "76.26",
//             zoneManager: { connect: { id: zoneManager.id } },
//         },
//     });

//     await prisma.doulaProfile.update({
//         where: { id: doula.id },
//         data: {
//             Region: { connect: { id: region.id } },
//         },
//     });

//     /* =========================
//        SERVICE + PRICING
//     ========================= */

//     const service = await prisma.service.create({
//         data: {
//             name: "Doula Consultation",
//             description: "1 hour consultation",
//         },
//     });

//     const pricing = await prisma.servicePricing.create({
//         data: {
//             serviceId: service.id,
//             doulaProfileId: doula.id,
//             price: 1500,
//         },
//     });

//     /* =========================
//        MEETING AVAILABILITY (WEEKDAY)
//     ========================= */

//     const meetingDay = await prisma.availableSlotsForMeeting.upsert({
//         where: {
//             doulaId_weekday: {
//                 doulaId: doula.id,
//                 weekday: WeekDays.SUNDAY,
//             },
//         },
//         update: {},
//         create: {
//             weekday: WeekDays.SUNDAY,
//             ownerRole: Role.DOULA,
//             doulaId: doula.id,
//         },
//     });

//     /* =========================
//        MEETING TIME SLOT
//     ========================= */

//     await prisma.availableSlotsTimeForMeeting.create({
//         data: {
//             startTime: new Date("1970-01-01T10:00:00"),
//             endTime: new Date("1970-01-01T11:00:00"),
//             dateId: meetingDay.id,
//             isBooked: true,
//         },
//     });

//     /* =========================
//        MEETINGS
//     ========================= */

//     await prisma.meetings.create({
//         data: {
//             link: "https://meet.com/active",
//             status: MeetingStatus.SCHEDULED,
//             date: new Date("2025-11-30"),
//             startTime: new Date("1970-01-01T10:00:00"),
//             endTime: new Date("1970-01-01T11:00:00"),
//             serviceName: service.name,
//             bookedById: client.id,
//             doulaProfileId: doula.id,
//             availableSlotsForMeetingId: meetingDay.id,
//             serviceId: service.id,
//         },
//     });

//     await prisma.meetings.create({
//         data: {
//             link: "https://meet.com/canceled",
//             status: MeetingStatus.CANCELED,
//             cancelledAt: new Date(),
//             date: new Date("2025-12-01"),
//             startTime: new Date("1970-01-01T12:00:00"),
//             endTime: new Date("1970-01-01T13:00:00"),
//             serviceName: service.name,
//             bookedById: client.id,
//             doulaProfileId: doula.id,
//             availableSlotsForMeetingId: meetingDay.id,
//             serviceId: service.id,
//         },
//     });

//     /* =========================
//        SERVICE BOOKINGS
//     ========================= */

//     await prisma.serviceBooking.create({
//         data: {
//             startDate: new Date("2025-12-05"),
//             endDate: new Date("2025-12-10"),
//             regionId: region.id,
//             clientId: client.id,
//             doulaProfileId: doula.id,
//             servicePricingId: pricing.id,
//             status: BookingStatus.ACTIVE,
//             paymentDetails: { amount: 1500, method: "UPI" },
//         },
//     });

//     console.log("🌱 Seed completed successfully");
// }

// main()
//     .catch(console.error)
//     .finally(() => prisma.$disconnect());
