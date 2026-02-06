import { PrismaClient, Role, WeekDays, MeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    /*
     -----------------------------------
     1. ZONE MANAGERS
     -----------------------------------
    */
    const zmUsers = await Promise.all(
        Array.from({ length: 2 }).map((_, i) =>
            prisma.user.create({
                data: {
                    name: `Zone Manager ${i + 1}`,
                    email: `zm${i + 1}@test.com`,
                    role: Role.ZONE_MANAGER,
                },
            })
        )
    );

    const zoneManagers = await Promise.all(
        zmUsers.map(u =>
            prisma.zoneManagerProfile.create({
                data: { userId: u.id },
            })
        )
    );

    /*
     -----------------------------------
     2. REGIONS
     -----------------------------------
    */
    const regions = await Promise.all([
        prisma.region.create({
            data: {
                regionName: "Kochi",
                pincode: "682001",
                district: "Ernakulam",
                state: "Kerala",
                country: "India",
                latitude: "9.9312",
                longitude: "76.2673",
                zoneManagerId: zoneManagers[0].id,
            },
        }),
        prisma.region.create({
            data: {
                regionName: "Thrissur",
                pincode: "680001",
                district: "Thrissur",
                state: "Kerala",
                country: "India",
                latitude: "10.5276",
                longitude: "76.2144",
                zoneManagerId: zoneManagers[1].id,
            },
        }),
    ]);

    /*
     -----------------------------------
     3. SERVICES
     -----------------------------------
    */
    const services = await Promise.all([
        prisma.service.create({ data: { name: "Postnatal Care" } }),
        prisma.service.create({ data: { name: "Prenatal Care" } }),
        prisma.service.create({ data: { name: "Lactation Support" } }),
    ]);

    /*
     -----------------------------------
     4. CLIENTS
     -----------------------------------
    */
    const clients: typeof zoneManagers = [];

    for (let i = 0; i < 5; i++) {
        const user = await prisma.user.create({
            data: {
                name: `Client ${i + 1}`,
                email: `client${i + 1}@test.com`,
                role: Role.CLIENT,
            },
        });

        const profile = await prisma.clientProfile.create({
            data: { userId: user.id },
        });

        clients.push(profile);
    }

    /*
     -----------------------------------
     5. AVAILABLE SLOTS (MONDAY-SUNDAY)
     -----------------------------------
    */
    const weekdays = Object.values(WeekDays);

    const slots = await Promise.all(
        weekdays.map(day =>
            prisma.availableSlotsForMeeting.create({
                data: {
                    weekday: day,
                    ownerRole: Role.ZONE_MANAGER,
                    zoneManagerId: zoneManagers[0].id,
                },
            })
        )
    );

    /*
     -----------------------------------
     6. CREATE 15 ENQUIRIES
     -----------------------------------
    */

    for (let i = 0; i < 15; i++) {

        const client = clients[i % clients.length];
        const region = regions[i % regions.length];
        const service = services[i % services.length];
        const slot = slots[i % slots.length];

        const meetingDate = new Date();
        meetingDate.setDate(meetingDate.getDate() + i);

        const enquiry = await prisma.enquiryForm.create({
            data: {
                name: `Enquiry ${i + 1}`,
                email: `enquiry${i}@mail.com`,
                phone: `99999999${i}`,
                additionalNotes: `Test enquiry ${i}`,
                meetingsDate: meetingDate,
                meetingsTimeSlots: "10:00-11:00",
                serviceName: service.name,
                regionId: region.id,
                slotId: slot.id,
                serviceId: service.id,
                clientId: client.id,
            },
        });

        await prisma.meetings.create({
            data: {
                link: "https://meet.test.com/abc",
                status: MeetingStatus.SCHEDULED,
                startTime: new Date(`${meetingDate.toISOString().split('T')[0]}T10:00:00`),
                endTime: new Date(`${meetingDate.toISOString().split('T')[0]}T11:00:00`),
                date: meetingDate,
                serviceName: service.name,
                bookedById: client.id,
                zoneManagerProfileId: region.zoneManagerId!,
                enquiryId: enquiry.id,
            },
        });
    }

    console.log("✅ 15 enquiry records created");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
