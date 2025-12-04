"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@test.com",
            phone: "9000000001",
            role: client_1.Role.ADMIN,
            adminProfile: { create: { profile_image: "admin.jpg" } }
        },
        include: { adminProfile: true }
    });
    const zoneUser = await prisma.user.create({
        data: {
            name: "Zone Manager",
            email: "zonemanager@test.com",
            phone: "9000000002",
            role: client_1.Role.ZONE_MANAGER,
            zonemanagerprofile: { create: { profile_image: "zm.jpg" } }
        },
        include: { zonemanagerprofile: true }
    });
    const clientUser = await prisma.user.create({
        data: {
            name: "Client User",
            email: "client@test.com",
            phone: "9000000004",
            role: client_1.Role.CLIENT,
            clientProfile: {
                create: {
                    address: "123 Client Street",
                    profile_image: "client.jpg"
                }
            }
        },
        include: { clientProfile: true }
    });
    const doulaUser1 = await prisma.user.create({
        data: {
            name: "Doula User 1",
            email: "doula1@test.com",
            phone: "9000000011",
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: "doula1.jpg",
                    description: "Experienced doula 1.",
                    qualification: "Certified Doula",
                    yoe: 4
                }
            }
        },
        include: { doulaProfile: true }
    });
    const doulaUser2 = await prisma.user.create({
        data: {
            name: "Doula User 2",
            email: "doula2@test.com",
            phone: "9000000012",
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: "doula2.jpg",
                    description: "Experienced doula 2.",
                    qualification: "Certified Doula",
                    yoe: 6
                }
            }
        },
        include: { doulaProfile: true }
    });
    const doulaUser3 = await prisma.user.create({
        data: {
            name: "Doula User 3",
            email: "doula3@test.com",
            phone: "9000000013",
            role: client_1.Role.DOULA,
            doulaProfile: {
                create: {
                    profileImage: "doula3.jpg",
                    description: "Experienced doula 3.",
                    qualification: "Certified Doula",
                    yoe: 2
                }
            }
        },
        include: { doulaProfile: true }
    });
    const zoneManager = zoneUser.zonemanagerprofile;
    const client = clientUser.clientProfile;
    const doula1 = doulaUser1.doulaProfile;
    const doula2 = doulaUser2.doulaProfile;
    const doula3 = doulaUser3.doulaProfile;
    const english = await prisma.language.create({ data: { name: "English" } });
    const hindi = await prisma.language.create({ data: { name: "Hindi" } });
    await Promise.all([doula1.id, doula2.id, doula3.id].map((id) => prisma.doulaProfile.update({
        where: { id },
        data: { languages: { connect: [{ id: english.id }, { id: hindi.id }] } }
    })));
    const region = await prisma.region.create({
        data: {
            regionName: "Kochi",
            pincode: "682001",
            district: "Ernakulam",
            state: "Kerala",
            country: "India",
            latitude: "9.9312",
            longitude: "76.2673",
            zoneManager: { connect: { id: zoneManager.id } }
        }
    });
    await Promise.all([doula1.id, doula2.id, doula3.id].map((id) => prisma.doulaProfile.update({
        where: { id },
        data: { Region: { connect: { id: region.id } } }
    })));
    await prisma.zoneManagerProfile.update({
        where: { id: zoneManager.id },
        data: {
            doulas: {
                connect: [{ id: doula1.id }, { id: doula2.id }, { id: doula3.id }]
            }
        }
    });
    const service = await prisma.service.create({
        data: {
            name: "Doula Consultation",
            description: "1 hour consultation with a certified doula."
        }
    });
    const pricing1 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula1.id, price: 1500.0 }
    });
    const pricing2 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula2.id, price: 1800.0 }
    });
    const pricing3 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula3.id, price: 1200.0 }
    });
    const meetingDay = await prisma.availableSlotsForMeeting.create({
        data: {
            date: new Date("2025-11-30"),
            weekday: "Sunday",
            ownerRole: client_1.Role.DOULA,
            doulaId: doula1.id
        }
    });
    const meetingSlot = await prisma.availableSlotsTimeForMeeting.create({
        data: {
            startTime: new Date("2025-11-30T10:00:00"),
            endTime: new Date("2025-11-30T11:00:00"),
            dateId: meetingDay.id
        }
    });
    await prisma.meetings.create({
        data: {
            link: "https://meet.example.com/123",
            status: client_1.MeetingStatus.SCHEDULED,
            bookedById: client.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doula1.id,
            serviceId: service.id
        }
    });
    const serviceDay = await prisma.availableSlotsForService.create({
        data: { date: new Date("2025-12-01"), weekday: "Monday", doulaId: doula1.id }
    });
    const serviceTimeSlot = await prisma.availableSlotsTimeForService.create({
        data: {
            startTime: new Date("2025-12-01T09:00:00"),
            endTime: new Date("2025-12-01T10:00:00"),
            dateId: serviceDay.id
        }
    });
    await prisma.intakeForm.create({
        data: {
            date: new Date(),
            address: "Client Address",
            regionId: region.id,
            clientId: client.id,
            doulaProfileId: doula1.id,
            servicePricingId: pricing1.id,
            slotId: serviceDay.id,
            slotTimeId: serviceTimeSlot.id
        }
    });
    await prisma.serviceBooking.create({
        data: {
            date: new Date(),
            regionId: region.id,
            servicePricingId: pricing1.id,
            doulaProfileId: doula1.id,
            clientId: client.id,
            slotId: serviceDay.id,
            slotTimeId: serviceTimeSlot.id,
            status: client_1.BookingStatus.ACTIVE,
            paymentDetails: { amount: 1500, method: "UPI" }
        }
    });
    const now = new Date();
    const daysAgo = (d) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() - d);
        return dt;
    };
    await prisma.testimonials.createMany({
        data: [
            {
                id: undefined,
                doulaProfileId: doula1.id,
                serviceId: pricing1.id,
                ratings: 5,
                reviews: "Amazing service! (most recent)",
                clientId: client.id,
                createdAt: daysAgo(0).toISOString(),
                updatedAt: daysAgo(0).toISOString()
            },
            {
                doulaProfileId: doula2.id,
                serviceId: pricing2.id,
                ratings: 4,
                reviews: "Very helpful",
                clientId: client.id,
                createdAt: daysAgo(1).toISOString(),
                updatedAt: daysAgo(1).toISOString()
            },
            {
                doulaProfileId: doula3.id,
                serviceId: pricing3.id,
                ratings: 3,
                reviews: "Good experience",
                clientId: client.id,
                createdAt: daysAgo(2).toISOString(),
                updatedAt: daysAgo(2).toISOString()
            },
            {
                doulaProfileId: doula1.id,
                serviceId: pricing1.id,
                ratings: 5,
                reviews: "Excellent follow up",
                clientId: client.id,
                createdAt: daysAgo(5).toISOString(),
                updatedAt: daysAgo(5).toISOString()
            },
            {
                doulaProfileId: doula2.id,
                serviceId: pricing2.id,
                ratings: 4,
                reviews: "Very kind and patient",
                clientId: client.id,
                createdAt: daysAgo(10).toISOString(),
                updatedAt: daysAgo(10).toISOString()
            },
            {
                doulaProfileId: doula3.id,
                serviceId: pricing3.id,
                ratings: 2,
                reviews: "Average",
                clientId: client.id,
                createdAt: daysAgo(20).toISOString(),
                updatedAt: daysAgo(20).toISOString()
            }
        ]
    });
    await prisma.notes.create({
        data: { remarks: "Zone manager feedback.", zoneManagerId: zoneManager.id }
    });
    await prisma.notes.create({
        data: { remarks: "Admin remarks.", adminId: adminUser.adminProfile?.id }
    });
    console.log("🌱 Seeding Completed Successfully!");
}
main()
    .catch((e) => {
    console.error("❌ Seed Error", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map