"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding DB…");
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@test.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@test.com",
            phone: "9000000001",
            role: client_1.Role.ADMIN,
            adminProfile: { create: { profile_image: "admin.jpg" } },
        },
    });
    const zoneUser = await prisma.user.upsert({
        where: { email: "zonemanager@test.com" },
        update: {},
        create: {
            name: "Zone Manager",
            email: "zonemanager@test.com",
            phone: "9000000002",
            role: client_1.Role.ZONE_MANAGER,
            zonemanagerprofile: { create: { profile_image: "zm.jpg" } },
        },
        include: { zonemanagerprofile: true },
    });
    const clientUser = await prisma.user.upsert({
        where: { email: "client@test.com" },
        update: {},
        create: {
            name: "Client User",
            email: "client@test.com",
            phone: "9000000004",
            role: client_1.Role.CLIENT,
            clientProfile: {
                create: {
                    address: "123 Client Street",
                    profile_image: "client.jpg",
                },
            },
        },
        include: { clientProfile: true },
    });
    const client = clientUser.clientProfile;
    const zoneManager = zoneUser.zonemanagerprofile;
    async function createDoula(i, yoe) {
        return prisma.user.upsert({
            where: { email: `d${i}@test.com` },
            update: {},
            create: {
                name: `Doula ${i}`,
                email: `d${i}@test.com`,
                phone: `900000001${i}`,
                role: client_1.Role.DOULA,
                doulaProfile: {
                    create: {
                        description: `Experienced doula ${i}`,
                        qualification: "Certified",
                        yoe,
                    },
                },
            },
            include: { doulaProfile: true },
        });
    }
    const d1 = await createDoula(1, 4);
    const d2 = await createDoula(2, 6);
    const doula1 = d1.doulaProfile;
    const doula2 = d2.doulaProfile;
    const region = await prisma.region.upsert({
        where: { pincode: "682001" },
        update: {},
        create: {
            regionName: "Kochi",
            pincode: "682001",
            district: "Ernakulam",
            state: "Kerala",
            country: "India",
            latitude: "9.93",
            longitude: "76.26",
            zoneManager: { connect: { id: zoneManager.id } },
        },
    });
    for (const doulaId of [doula1.id, doula2.id]) {
        await prisma.doulaProfile.update({
            where: { id: doulaId },
            data: {
                regionId: region.id,
            },
        });
    }
    const service = await prisma.service.create({
        data: {
            name: "Doula Consultation",
            description: "1 hour consultation",
        },
    });
    const pricing1 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula1.id, price: 1500 },
    });
    const pricing2 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula2.id, price: 1800 },
    });
    const meetingDate = new Date("2025-11-30");
    const meetingDay = await prisma.availableSlotsForMeeting.upsert({
        where: {
            doulaId_date: {
                doulaId: doula1.id,
                date: meetingDate,
            },
        },
        update: {},
        create: {
            date: meetingDate,
            weekday: "Sunday",
            ownerRole: client_1.Role.DOULA,
            doulaId: doula1.id,
        },
    });
    const meetingSlot = await prisma.availableSlotsTimeForMeeting.create({
        data: {
            startTime: new Date("2025-11-30T10:00:00"),
            endTime: new Date("2025-11-30T11:00:00"),
            dateId: meetingDay.id,
            isBooked: true,
        },
    });
    await prisma.meetings.create({
        data: {
            link: "https://meet.com/active",
            status: client_1.MeetingStatus.SCHEDULED,
            bookedById: client.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doula1.id,
            serviceId: service.id,
        },
    });
    await prisma.meetings.create({
        data: {
            link: "https://meet.com/canceled",
            status: client_1.MeetingStatus.CANCELED,
            cancelledAt: new Date(),
            bookedById: client.id,
            slotId: (await prisma.availableSlotsTimeForMeeting.create({
                data: {
                    startTime: new Date("2025-12-01T12:00"),
                    endTime: new Date("2025-12-01T13:00"),
                    dateId: meetingDay.id,
                },
            })).id,
            doulaProfileId: doula1.id,
            serviceId: service.id,
        },
    });
    await prisma.serviceBooking.create({
        data: {
            startDate: new Date("2025-12-05"),
            endDate: new Date("2025-12-10"),
            regionId: region.id,
            clientId: client.id,
            doulaProfileId: doula1.id,
            servicePricingId: pricing1.id,
            status: client_1.BookingStatus.ACTIVE,
            paymentDetails: { amount: 1500, method: "UPI" },
        },
    });
    await prisma.serviceBooking.create({
        data: {
            startDate: new Date("2025-11-01"),
            endDate: new Date("2025-11-05"),
            regionId: region.id,
            clientId: client.id,
            doulaProfileId: doula2.id,
            servicePricingId: pricing2.id,
            status: client_1.BookingStatus.COMPLETED,
        },
    });
    await prisma.serviceBooking.create({
        data: {
            startDate: new Date("2025-12-15"),
            endDate: new Date("2025-12-20"),
            regionId: region.id,
            clientId: client.id,
            doulaProfileId: doula1.id,
            servicePricingId: pricing1.id,
            status: client_1.BookingStatus.CANCELED,
            cancelledAt: new Date(),
        },
    });
    console.log("🌱 Seed Done!");
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map