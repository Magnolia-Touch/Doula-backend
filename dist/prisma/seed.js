"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding DB…");
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@test.com",
            phone: "9000000001",
            role: client_1.Role.ADMIN,
            adminProfile: { create: { profile_image: "admin.jpg" } }
        }
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
    async function createDoula(i, yoe) {
        return prisma.user.create({
            data: {
                name: `Doula ${i}`,
                email: `d${i}@test.com`,
                phone: `900000001${i}`,
                role: client_1.Role.DOULA,
                doulaProfile: {
                    create: {
                        profileImage: `d${i}.jpg`,
                        description: `Experienced doula ${i}`,
                        qualification: "Certified",
                        yoe
                    }
                }
            },
            include: { doulaProfile: true }
        });
    }
    const d1 = await createDoula(1, 4);
    const d2 = await createDoula(2, 6);
    const d3 = await createDoula(3, 2);
    const doula1 = d1.doulaProfile;
    const doula2 = d2.doulaProfile;
    const doula3 = d3.doulaProfile;
    const zoneManager = zoneUser.zonemanagerprofile;
    const client = clientUser.clientProfile;
    await Promise.all([doula1.id, doula2.id, doula3.id].map(id => prisma.doulaProfile.update({
        where: { id },
        data: {}
    })));
    const region = await prisma.region.create({
        data: {
            regionName: "Kochi",
            pincode: "682001",
            district: "Ernakulam",
            state: "Kerala",
            country: "India",
            latitude: "9.93",
            longitude: "76.26",
            zoneManager: {
                connect: { id: zoneManager.id }
            }
        }
    });
    await Promise.all([doula1.id, doula2.id, doula3.id].map(id => prisma.doulaProfile.update({
        where: { id },
        data: {
            Region: { connect: { id: region.id } }
        }
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
            description: "1 hour consultation."
        }
    });
    const pricing1 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula1.id, price: 1500 }
    });
    const pricing2 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula2.id, price: 1800 }
    });
    const pricing3 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula3.id, price: 1200 }
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
            startTime: new Date("2025-11-30T10:00"),
            endTime: new Date("2025-11-30T11:00"),
            dateId: meetingDay.id
        }
    });
    await prisma.meetings.create({
        data: {
            link: "https://meet.com/123",
            status: client_1.MeetingStatus.SCHEDULED,
            bookedById: client.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doula1.id,
            serviceId: service.id
        }
    });
    const sDay = await prisma.availableSlotsForService.create({
        data: {
            date: new Date("2025-12-01"),
            weekday: "Monday",
            doulaId: doula1.id
        }
    });
    const sSlot = await prisma.availableSlotsTimeForService.create({
        data: {
            startTime: new Date("2025-12-01T09:00"),
            endTime: new Date("2025-12-01T10:00"),
            dateId: sDay.id
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
            slot: { connect: { id: sDay.id } },
            slotTime: { connect: { id: sSlot.id } }
        }
    });
    await prisma.serviceBooking.create({
        data: {
            date: new Date(),
            regionId: region.id,
            clientId: client.id,
            doulaProfileId: doula1.id,
            servicePricingId: pricing1.id,
            status: client_1.BookingStatus.ACTIVE,
            paymentDetails: { amount: 1500, method: "UPI" },
            AvailableSlotsForService: { connect: { id: sDay.id } },
            slot: { connect: { id: sSlot.id } }
        }
    });
    const now = new Date();
    const ago = (d) => new Date(now.getTime() - d * 86400000);
    await prisma.testimonials.createMany({
        data: [
            { doulaProfileId: doula1.id, serviceId: pricing1.id, clientId: client.id, ratings: 5, reviews: "Excellent", createdAt: ago(0) },
            { doulaProfileId: doula2.id, serviceId: pricing2.id, clientId: client.id, ratings: 4, reviews: "Great", createdAt: ago(1) },
            { doulaProfileId: doula3.id, serviceId: pricing3.id, clientId: client.id, ratings: 3, reviews: "Normal", createdAt: ago(2) }
        ]
    });
    await prisma.notes.create({
        data: { remarks: "Zone manager feedback", zoneManagerId: zoneManager.id }
    });
    console.log("🌱 Seed Done!");
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map