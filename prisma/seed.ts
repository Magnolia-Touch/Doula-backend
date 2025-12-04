// prisma/seed.ts
import { PrismaClient, Role, BookingStatus, MeetingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // -------------------------
    // USERS (admin, zone manager, client)
    // -------------------------
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@test.com",
            phone: "9000000001",
            role: Role.ADMIN,
            adminProfile: { create: { profile_image: "admin.jpg" } }
        },
        include: { adminProfile: true }
    });

    const zoneUser = await prisma.user.create({
        data: {
            name: "Zone Manager",
            email: "zonemanager@test.com",
            phone: "9000000002",
            role: Role.ZONE_MANAGER,
            zonemanagerprofile: { create: { profile_image: "zm.jpg" } }
        },
        include: { zonemanagerprofile: true }
    });

    const clientUser = await prisma.user.create({
        data: {
            name: "Client User",
            email: "client@test.com",
            phone: "9000000004",
            role: Role.CLIENT,
            clientProfile: {
                create: {
                    address: "123 Client Street",
                    profile_image: "client.jpg"
                }
            }
        },
        include: { clientProfile: true }
    });

    // -------------------------
    // Create multiple doula users + profiles
    // -------------------------
    const doulaUser1 = await prisma.user.create({
        data: {
            name: "Doula User 1",
            email: "doula1@test.com",
            phone: "9000000011",
            role: Role.DOULA,
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
            role: Role.DOULA,
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
            role: Role.DOULA,
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

    // convenience vars
    const zoneManager = zoneUser.zonemanagerprofile!;
    const client = clientUser.clientProfile!;
    const doula1 = doulaUser1.doulaProfile!;
    const doula2 = doulaUser2.doulaProfile!;
    const doula3 = doulaUser3.doulaProfile!;

    // -------------------------
    // LANGUAGES
    // -------------------------
    const english = await prisma.language.create({ data: { name: "English" } });
    const hindi = await prisma.language.create({ data: { name: "Hindi" } });

    // connect languages to all doulas
    await Promise.all(
        [doula1.id, doula2.id, doula3.id].map((id) =>
            prisma.doulaProfile.update({
                where: { id },
                data: { languages: { connect: [{ id: english.id }, { id: hindi.id }] } }
            })
        )
    );

    // -------------------------
    // REGIONS
    // -------------------------
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

    // connect doulas to region (so Doula.Region relation has entries)
    await Promise.all(
        [doula1.id, doula2.id, doula3.id].map((id) =>
            prisma.doulaProfile.update({
                where: { id },
                data: { Region: { connect: { id: region.id } } }
            })
        )
    );

    // -------------------------
    // IMPORTANT: Link doulas to zone manager (M2M)
    // -------------------------
    // connect all doulas to the zone manager profile so queries like zoneManager.doulas will work
    await prisma.zoneManagerProfile.update({
        where: { id: zoneManager.id },
        data: {
            doulas: {
                connect: [{ id: doula1.id }, { id: doula2.id }, { id: doula3.id }]
            }
        }
    });

    // -------------------------
    // SERVICES
    // -------------------------
    const service = await prisma.service.create({
        data: {
            name: "Doula Consultation",
            description: "1 hour consultation with a certified doula."
        }
    });

    // -------------------------
    // SERVICE PRICING (one pricing per doula)
    // -------------------------
    const pricing1 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula1.id, price: 1500.0 }
    });
    const pricing2 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula2.id, price: 1800.0 }
    });
    const pricing3 = await prisma.servicePricing.create({
        data: { serviceId: service.id, doulaProfileId: doula3.id, price: 1200.0 }
    });

    // -------------------------
    // AVAILABLE MEETING SLOTS (for doula1)
    // -------------------------
    const meetingDay = await prisma.availableSlotsForMeeting.create({
        data: {
            date: new Date("2025-11-30"),
            weekday: "Sunday",
            ownerRole: Role.DOULA,
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

    // create a meeting (booked)
    await prisma.meetings.create({
        data: {
            link: "https://meet.example.com/123",
            status: MeetingStatus.SCHEDULED,
            bookedById: client.id,
            slotId: meetingSlot.id,
            availableSlotsForMeetingId: meetingDay.id,
            doulaProfileId: doula1.id,
            serviceId: service.id
        }
    });

    // -------------------------
    // SERVICE SLOTS (for doula1)
    // -------------------------
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

    // -------------------------
    // INTAKE FORM
    // -------------------------
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

    // -------------------------
    // SERVICE BOOKING
    // -------------------------
    await prisma.serviceBooking.create({
        data: {
            date: new Date(),
            regionId: region.id,
            servicePricingId: pricing1.id,
            doulaProfileId: doula1.id,
            clientId: client.id,
            slotId: serviceDay.id,
            slotTimeId: serviceTimeSlot.id,
            status: BookingStatus.ACTIVE,
            paymentDetails: { amount: 1500, method: "UPI" }
        }
    });

    // -------------------------
    // TESTIMONIALS (multiple, with explicit createdAt times)
    // -------------------------
    // We'll add 6 testimonials across the 3 doulas, with varying createdAt values.
    // Newest dates near current date (assume today ~ 2025-12-04) so you can test "latest first".
    const now = new Date();

    // Helper to produce relative dates
    const daysAgo = (d: number) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() - d);
        return dt;
    };

    await prisma.testimonials.createMany({
        data: [
            {
                id: undefined as any, // prisma will generate id when omitted in createMany supported DBs.
                doulaProfileId: doula1.id,
                serviceId: pricing1.id,
                ratings: 5,
                reviews: "Amazing service! (most recent)",
                clientId: client.id,
                createdAt: daysAgo(0).toISOString(), // today (most recent)
                updatedAt: daysAgo(0).toISOString()
            } as any,
            {
                doulaProfileId: doula2.id,
                serviceId: pricing2.id,
                ratings: 4,
                reviews: "Very helpful",
                clientId: client.id,
                createdAt: daysAgo(1).toISOString(),
                updatedAt: daysAgo(1).toISOString()
            } as any,
            {
                doulaProfileId: doula3.id,
                serviceId: pricing3.id,
                ratings: 3,
                reviews: "Good experience",
                clientId: client.id,
                createdAt: daysAgo(2).toISOString(),
                updatedAt: daysAgo(2).toISOString()
            } as any,
            {
                doulaProfileId: doula1.id,
                serviceId: pricing1.id,
                ratings: 5,
                reviews: "Excellent follow up",
                clientId: client.id,
                createdAt: daysAgo(5).toISOString(),
                updatedAt: daysAgo(5).toISOString()
            } as any,
            {
                doulaProfileId: doula2.id,
                serviceId: pricing2.id,
                ratings: 4,
                reviews: "Very kind and patient",
                clientId: client.id,
                createdAt: daysAgo(10).toISOString(),
                updatedAt: daysAgo(10).toISOString()
            } as any,
            {
                doulaProfileId: doula3.id,
                serviceId: pricing3.id,
                ratings: 2,
                reviews: "Average",
                clientId: client.id,
                createdAt: daysAgo(20).toISOString(),
                updatedAt: daysAgo(20).toISOString()
            } as any
        ]
    });

    // NOTE: createMany doesn't populate nested relations in return value. That's fine — data is in DB.

    // -------------------------
    // NOTES (Admin + ZM)
    // -------------------------
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
